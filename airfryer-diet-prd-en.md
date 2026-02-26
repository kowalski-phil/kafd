# Product Requirements Document: AirFryer Diet App

## 1. Product Vision

A mobile-first Progressive Web App (PWA) to support weight loss using air fryer recipes. The app digitizes recipes from physical cookbooks via photo upload, creates personalized meal plans based on calorie budgets and available preparation time, and guides the user through daily cooking with an optimized cooking mode.

**Target audience:** Single user (the developer himself), expandable in the future.

**Language:** German (UI and content). Architecture prepared for future multi-language support (i18n-ready).

---

## 2. Tech Stack

| Component | Technology | Rationale |
|---|---|---|
| Frontend | Vite + React (TypeScript) | Fast dev setup, large ecosystem |
| Styling | Tailwind CSS | Utility-first, great for responsive/mobile design |
| PWA | Workbox / vite-plugin-pwa | Offline capability, homescreen installation |
| Backend/DB | Supabase (PostgreSQL) | Free tier, REST API, auth-ready, cross-device access |
| Photo Parsing | Claude API (Vision) | Reliable parsing of cookbook photos |
| Hosting | Vercel | Free hosting, simple deployment |
| Offline Cache | Service Worker + IndexedDB | Current weekly plan and recipes available offline |

### Architecture Notes

- **Offline strategy:** The current weekly plan and all associated recipes are cached in the Service Worker. New data is synced once the connection is restored.
- **API abstraction:** Meal plan generation is abstracted behind a service layer, so the rule-based algorithm can later be replaced by Claude API calls or an n8n webhook without modifying the frontend.
- **Ingredient normalization:** During photo parsing, the Claude API normalizes ingredient names against a consistent naming standard (e.g., always "chicken breast" instead of varying synonyms) to enable aggregation for shopping lists.

---

## 3. Data Model

### 3.1 Table: `cookbooks`
| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| name | TEXT | Cookbook name |
| author | TEXT | Author (optional) |
| created_at | TIMESTAMP | Creation date |

### 3.2 Table: `recipes`
| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| title | TEXT | Recipe name |
| cookbook_id | UUID | FK → cookbooks |
| page_number | INTEGER | Page number in the cookbook |
| ingredients | JSONB | Array of {name, amount, unit, category} |
| steps | JSONB | Array of {step_number, instruction, duration_seconds?} |
| calories | INTEGER | Calories per serving |
| protein_g | DECIMAL | Protein in grams (optional) |
| carbs_g | DECIMAL | Carbohydrates in grams (optional) |
| fat_g | DECIMAL | Fat in grams (optional) |
| prep_time_minutes | INTEGER | Preparation time in minutes |
| base_servings | INTEGER | Base serving count from the original recipe |
| category_tags | TEXT[] | Array: 'breakfast', 'lunch', 'dinner', 'snack' (multiple allowed) |
| is_favorite | BOOLEAN | Favorite flag |
| is_excluded | BOOLEAN | Excluded from planning |
| photo_url | TEXT | URL of the original cookbook photo (in Supabase Storage) |
| created_at | TIMESTAMP | Creation date |
| updated_at | TIMESTAMP | Last update |

**Note on `ingredients.category`:** Each ingredient receives a category during parsing for shopping list sorting: `fruits_vegetables`, `meat_fish`, `dairy`, `dry_goods`, `spices`, `other`.

### 3.3 Table: `user_settings`
| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| daily_calorie_target | INTEGER | Daily calorie goal |
| meals_per_day | INTEGER | 3, 4, or 5 meals |
| time_budget_breakfast | INTEGER | Available minutes in the morning |
| time_budget_lunch | INTEGER | Available minutes at noon |
| time_budget_dinner | INTEGER | Available minutes in the evening |
| time_budget_snack | INTEGER | Available minutes for snacks |
| start_weight | DECIMAL | Starting weight in kg |
| target_weight | DECIMAL | Target weight in kg |
| pantry_staples | TEXT[] | Staple ingredients always on hand (salt, pepper, oil, etc.) |

### 3.4 Table: `meal_plans`
| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| date | DATE | Date |
| meal_type | TEXT | 'breakfast', 'lunch', 'dinner', 'snack_1', 'snack_2' |
| recipe_id | UUID | FK → recipes (NULL for free meals) |
| servings | DECIMAL | Chosen serving count |
| is_completed | BOOLEAN | Eaten as planned? |
| is_free_meal | BOOLEAN | Free meal (eating out, etc.) |
| free_meal_calories | INTEGER | Estimated calories for free meal |
| free_meal_note | TEXT | Note about the free meal |
| is_meal_prep | BOOLEAN | From meal prep of another day |
| meal_prep_source_id | UUID | FK → meal_plans (reference to original cooking session) |

### 3.5 Table: `weight_log`
| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| date | DATE | Date (unique) |
| weight_kg | DECIMAL | Weight in kg |

### 3.6 Table: `shopping_lists`
| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| week_start | DATE | Monday of the week |
| items | JSONB | Array of {name, amount, unit, category, is_checked} |
| created_at | TIMESTAMP | Creation date |

---

## 4. Features in Detail

### 4.1 Photo Upload & Recipe Capture

**User Flow:**
1. User taps "Add Recipe" (+)
2. Camera opens → User photographs the recipe page in the cookbook
3. Photo is sent to Claude API (Vision) with a structured prompt
4. App displays a preview of the recognized data:
   - Recipe name
   - Ingredients with amounts and units
   - Preparation steps
   - Calories, prep time, serving count (if visible on the page)
5. User supplements/corrects:
   - Cookbook (dropdown from saved books, or create new)
   - Page number
   - Category tags (multi-select: Breakfast/Lunch/Dinner/Snack)
   - Calories and macros (if not automatically recognized)
6. Save

**Claude API Prompt Strategy:**
- Structured output as JSON
- Ingredient normalization (consistent naming)
- Ingredient categorization for shopping lists
- Detection of time references in preparation steps (for timers in cooking mode)
- Robust error handling for poorly readable photos

**Goal:** Under 2 minutes per recipe capture.

### 4.2 Recipe Management

**Recipe List:**
- Card view with title, calories, prep time, and category tags
- Search function (free text across title and ingredients)
- Filter options: by category, calorie range, prep time, cookbook, favorites
- Sorting: alphabetical, calories, prep time

**Recipe Detail:**
- All metadata (calories, macros, prep time, book + page)
- Ingredient list with serving size converter
- Preparation steps
- Favorite toggle (heart icon)
- Exclusion toggle ("Don't suggest anymore")
- Button: "Cook Now" → Cooking Mode

**Serving Size Conversion:**
- Slider or +/- buttons for serving count
- All ingredient amounts adjust proportionally
- Smart rounding:
  - Eggs: always round up to whole numbers (0.5 → 1)
  - Spices: minimum 1 pinch, no values below 0.25 tsp
  - Liquids: round to 10ml increments
  - Weights: round to 5g increments (under 50g), 10g (under 200g), 25g (above)
- Calories adjust proportionally to serving count
- Note displayed when rounding affects actual calorie count

### 4.3 Cooking Mode

**Activation:** Via "Cook Now" button in recipe detail or in the daily plan.

**Display:**
- Fullscreen mode, no browser chrome
- Large font (minimum 18px body text, 24px headings)
- High contrast for good readability
- Screen Wake Lock: display stays active as long as cooking mode is running

**Flow:**
1. **Overview:** Confirm/adjust serving count, show total duration
2. **Ingredient Check:** List of all ingredients with checkboxes. User gathers everything.
3. **Step-by-Step:** Horizontal swipe between steps. Per step:
   - Step number and total count ("Step 3 of 7")
   - Instruction in large font
   - Timer button when a time reference is included in the step (e.g., "12 min at 180°C")
   - Timer runs with audible alert at the end
   - Previous/Next navigation
4. **Done:** "Enjoy your meal!" screen, mark meal as completed

### 4.4 Meal Planning

**Settings (one-time / adjustable):**
- Daily calorie target (e.g., 1,800 kcal)
- Meals per day: 3, 4, or 5
  - 3 = Breakfast, Lunch, Dinner
  - 4 = Breakfast, Snack, Lunch, Dinner
  - 5 = Breakfast, Snack 1, Lunch, Snack 2, Dinner
- Time budget per meal in minutes
- Calorie distribution per meal (default: evenly distributed, adjustable)

**Plan Generation (rule-based algorithm V1):**
1. For each meal: filter recipes by matching category tag
2. Filter by prep time ≤ meal's time budget
3. Filter out excluded recipes
4. Prefer favorites (higher probability, but not exclusively)
5. Check calories: sum of all meals should be within ±10% of daily target
6. Avoid repetitions: same recipe maximum 2x per week
7. If ingredient intelligence is active: prefer recipes with overlapping ingredients on consecutive days
8. Random selection from remaining candidates

**Plan Display:**
- Day view: All meals for today with calorie overview
- Week view: 7-day overview, compact
- Drag & drop or swap button to rearrange individual meals
- "Regenerate" button for individual meals or the entire day

**Plan vs. Reality Tracking:**
- Each meal can be marked as "✓ Eaten as planned" (single tap)
- Alternative: "Deviated" → optional note and calorie correction
- "Free meal" → select meal type, enter estimated calories, optional note
- Day view shows: Planned calories vs. actually consumed calories

### 4.5 Shopping List

**Generation:**
- Automatically generated from confirmed weekly plan
- Aggregation of all ingredients across all planned recipes (amounts added up)
- Pantry staples (from `pantry_staples`) are hidden (with option "Show anyway")

**Sorting by Supermarket Categories:**
- 🥬 Fruits & Vegetables
- 🥩 Meat & Fish
- 🥛 Dairy & Eggs
- 🌾 Dry Goods (flour, rice, pasta, legumes)
- 🧂 Spices & Oils
- 🛒 Other

**Interaction:**
- Check off while shopping (checkbox, strikethrough)
- Manually add entries (e.g., household items)
- List persists until the next weekly plan generation

**Future (n8n integration):**
- Export via n8n webhook to Todoist, Apple Reminders, or WhatsApp

### 4.6 "What Can I Cook?"

**V1 (manual):**
- Dedicated tab or button in the recipes section
- Shows all recipes, sorted by number of ingredients
- Filter option: free text search in ingredients ("chicken" → all recipes with chicken)
- Filterable by prep time and category

**V2 (future):**
- Automatic inventory tracking based on shopping list and consumed recipes
- Sorting: "Missing 0 ingredients", "Missing 1 ingredient", "Missing 2 ingredients"

### 4.7 Weight Tracking

**Input:**
- Simple input field on the dashboard or in the profile tab
- One entry per day, overwritable

**Graph:**
- Main line: Rolling 7-day average
- Background: Individual measurement points as dots
- Color coding of the average line:
  - 🟢 Green: Trending down (>1% below previous week)
  - 🟡 Yellow: Stable (±1%)
  - 🔴 Red: Trending up (>1% above previous week)
- Time range: last 4 weeks (default), switchable to 3 months / 6 months / all time

**Dashboard Widget:**
- Starting weight → Current weight → Target weight
- Progress bar in percent

### 4.8 Motivation & Statistics

**Streak Counter:**
- "X days tracked in a row" (at least 1 meal marked as completed)
- Visually prominent on the dashboard

**Weekly Review (every Sunday or at the weekend):**
- Days within calorie budget: X of 7
- Number of recipes cooked
- Average calories/day
- Weight change for the week
- Streak length

### 4.9 Meal Prep

**Logic:**
- When a recipe is planned for e.g., 4 servings, but only 1 serving is needed for the current meal:
  - App asks: "This recipe yields 4 servings. Schedule remaining 3 servings for upcoming meals?"
  - If yes: App automatically inserts remaining servings into the plan (next suitable meal slots)
  - These meals are marked as "Meal Prep" (no cooking required, prep time = 0)

---

## 5. Navigation & UI Structure

### Mobile Tab Navigation (Bottom of Screen)

| Tab | Icon | Content |
|---|---|---|
| **Today** | 📅 | Daily plan, calorie overview, quick actions |
| **Recipes** | 📖 | Recipe list, search, filters, "What can I cook?" |
| **Plan** | 🗓️ | Week view, generate plan, edit |
| **Shopping** | 🛒 | Current shopping list |
| **Profile** | ⚙️ | Weight tracking, statistics, settings, streak |

### "Today" Dashboard (Home Screen)

- Streak counter prominently at top
- Calorie overview: Planned / Consumed / Remaining (circle chart or bar)
- Meals of the day as cards:
  - Meal type + time slot
  - Recipe name + calories + prep time
  - Status: planned / completed / deviated
  - "Cook Now" button
- Weight input widget (subtle, at bottom)
- Weekly review card (on Sundays)

---

## 6. Development Phases

### Phase 1: Foundation
**Goal:** Digitize and display recipes.

- [ ] Project setup: Vite + React + TypeScript + Tailwind + PWA plugin
- [ ] Create Supabase project, set up database schema
- [ ] Cookbook management (CRUD)
- [ ] Photo upload with camera integration
- [ ] Claude API integration for photo parsing
- [ ] Recipe preview and manual correction after parsing
- [ ] Recipe list with search and filters
- [ ] Recipe detail view with serving size conversion (incl. smart rounding)
- [ ] Base navigation (tab bar)
- [ ] Vercel deployment

### Phase 2: Planning & Cooking
**Goal:** Create meal plans and cook recipes in cooking mode.

- [ ] Settings: calorie target, meals/day, time budgets
- [ ] Rule-based meal plan generator (day + week)
- [ ] Day and week views
- [ ] Edit plan: swap meals, regenerate
- [ ] Cooking mode: fullscreen, step-by-step, timer, wake lock
- [ ] Plan vs. reality: mark meals as completed, free meals
- [ ] Daily calorie overview (planned vs. consumed)
- [ ] Favorites and exclusions

### Phase 3: Shopping & Tracking
**Goal:** Shopping list, weight tracking, motivation.

- [ ] Generate shopping list from weekly plan
- [ ] Sorting by supermarket categories
- [ ] Pantry staples management
- [ ] Check off and manually add items
- [ ] Weight input and storage
- [ ] Weight graph with 7-day rolling average and color coding
- [ ] Progress display: Start → Current → Target
- [ ] Streak counter
- [ ] Weekly review

### Phase 4: Smart Features
**Goal:** Smarter planning and convenience.

- [ ] "What can I cook?" function (V1: filter-based)
- [ ] Meal prep logic (auto-schedule remaining servings)
- [ ] Macronutrient display in daily dashboard
- [ ] Offline cache for current week + associated recipes
- [ ] PWA optimization: homescreen icon, splash screen

### Phase 5: Future Enhancements
**Goal:** Optional upgrades for later.

- [ ] Claude API for intelligent meal planning (replacing rule-based algorithm)
- [ ] n8n integration: shopping list → Todoist / Apple Reminders / WhatsApp
- [ ] "What can I cook?" V2: automatic inventory tracking
- [ ] Multi-language support (i18n)
- [ ] Seasonality and advanced repetition logic

---

## 7. Non-Functional Requirements

- **Performance:** Recipe list must scroll smoothly with 50+ recipes. Page load time < 2 seconds.
- **Offline:** Current weekly plan and associated recipes must be available without internet connection.
- **Mobile UX:** Touch targets minimum 44x44px. No hover-only interactions. Large, legible font in cooking mode.
- **Data Privacy:** Single user only, no shared data. Configure Supabase Row Level Security anyway (best practice).
- **Accessibility:** Good contrast, readable font sizes, screen-reader-compatible structure.

---

## 8. Success Criteria

- 30-50 recipes can be captured within one evening (< 2 min per recipe)
- Weekly plan generation delivers sensible, varied results
- App is comfortable to use on a phone in the kitchen (cooking mode)
- Shopping list is practical to use while grocery shopping
- User (developer) still uses the app regularly after 4 weeks
