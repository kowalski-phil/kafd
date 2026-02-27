# Project Log — AirFryer Diet App

## 2026-02-26 — Project Kickoff

### What was done
- Reviewed the full PRD (`airfryer-diet-prd-en.md`)
- Created `CLAUDE.md` with project overview, tech stack, architecture decisions, data model summary, development phases, navigation structure, and coding conventions
- Created this `PROJECT_LOG.md` for ongoing progress tracking

### PRD Analysis Summary
- **Scope:** 5 development phases, 6 database tables, 9 major feature areas
- **Phase 1 (Foundation)** is the starting point: project scaffolding, Supabase setup, recipe capture via photo + Claude Vision, recipe management, and deployment
- **Key complexity areas:**
  - Claude Vision API integration for cookbook photo parsing with structured JSON output
  - Rule-based meal plan generation algorithm with multiple constraints (calories, time, variety, favorites)
  - Cooking mode with fullscreen, wake lock, timers, and step-by-step navigation
  - Serving size conversion with smart rounding rules per ingredient type
  - Offline-first PWA with Service Worker caching strategy

### Current Status
- **Phase:** Pre-development (planning complete)
- **Next step:** Begin Phase 1 — project setup (Vite + React + TypeScript + Tailwind + PWA plugin)

---

## 2026-02-26 — Phase 1 Implementation Complete

### What was done
All 8 work chunks of Phase 1 were implemented:

1. **Project Scaffolding** — Vite + React + TypeScript + Tailwind CSS v4 + PWA plugin configured. `.env.local` and `.env.example` created for Supabase + Claude API keys.

2. **Supabase Schema** — SQL migration file (`supabase/migrations/001_phase1_schema.sql`) with `cookbooks` + `recipes` tables, GIN indexes for text search and category filtering, auto-update trigger, RLS policies, and storage bucket policies.

3. **Types, Constants, i18n, Routing, Layout** — All TypeScript interfaces in `src/lib/types.ts`. German translations in `src/i18n/de.ts`. React Router with `AppLayout` + bottom `TabBar` (5 tabs). Supabase client singleton.

4. **UI Components + Cookbook CRUD** — `CookbookSelect` with inline creation. Cookbook API functions. Recipe components: `RecipeCard`, `FilterBar`, `ServingConverter`, `IngredientList`, `StepList`, `CategoryTagSelect`.

5. **Photo Capture + Claude Vision API** — `CameraCapture` component using `<input type="file" capture="environment">`. Image resize to max 2000px before sending. Claude API integration with German parsing prompt, ingredient normalization and categorization, markdown code fence stripping.

6. **Recipe Capture Flow** — `AddRecipePage` with multi-step flow: capture → parsing (spinner) → edit (pre-filled form) → save. Full ingredient and step list editing.

7. **Recipe List + Detail + Serving Conversion** — `RecipesPage` with search, category filters, cookbook filter, prep time slider, sorting options, FAB for adding recipes. `RecipeDetailPage` with photo, metadata, serving converter with smart rounding (eggs, spices, liquids, weights), ingredients, steps, favorite toggle, delete.

8. **Placeholder Pages + Polish** — Today, Plan, Shopping, Profile placeholder pages. Mobile-ready HTML with viewport-fit, theme-color, apple-mobile-web-app meta tags.

### Build Verification
- TypeScript type-check: **0 errors**
- Vite production build: **success** (442 KB JS, 18 KB CSS gzipped)
- PWA: Service worker generated with 5 precached entries

### Files Created (28 files)
```
vite.config.ts, index.html, .env.local, .env.example, public/favicon.svg
supabase/migrations/001_phase1_schema.sql
src/index.css, src/App.tsx
src/lib/types.ts, constants.ts, servingMath.ts, recipeFilters.ts, imageResize.ts, parsePrompt.ts
src/i18n/de.ts, index.ts
src/api/supabase.ts, cookbooks.ts, recipes.ts, storage.ts, claude.ts
src/components/layout/AppLayout.tsx, TabBar.tsx
src/components/cookbooks/CookbookSelect.tsx
src/components/capture/CameraCapture.tsx
src/components/recipes/RecipeCard.tsx, FilterBar.tsx, ServingConverter.tsx, IngredientList.tsx, StepList.tsx, CategoryTagSelect.tsx
src/pages/TodayPage.tsx, RecipesPage.tsx, RecipeDetailPage.tsx, AddRecipePage.tsx, PlanPage.tsx, ShoppingPage.tsx, ProfilePage.tsx
```

### Current Status
- **Phase 1: FULLY DEPLOYED AND TESTED**
- Supabase project created, schema deployed, storage bucket configured
- Claude Vision API routed through OpenRouter (user had no Anthropic credits)
- GitHub repo: https://github.com/kowalski-phil/kafd
- Deployed to Vercel (auto-deploys on push)
- Tested on phone: camera capture, Claude parsing, recipe editing, and saving all work
- **Next step:** Phase 2 — Planning & Cooking

---

## 2026-02-27 — P0 Bug Fixes (BUG-001, BUG-002, BUG-003)

### What was done
Fixed all three P0 bugs from the backlog before continuing recipe capture.

#### BUG-001: Decimal number input (German locale)
- Changed ingredient amount inputs from `<input type="number">` to `<input type="text" inputmode="decimal">` in `AddRecipePage.tsx` and `RecipeDetailPage.tsx`
- Same fix applied to macro inputs (protein, carbs, fat)
- Added `parseDecimal()` helper: normalizes German comma → dot on save
- Raw string kept in parallel state during editing for smooth typing, parsed to number on save
- Stored data type remains `number` — serving math and calculations unaffected
- Integer-only fields (page number, servings, prep time, calories) left as `type="number"`

#### BUG-002: Recipes not editable after saving
- Added full edit mode to `RecipeDetailPage.tsx` with `isEditing` state toggle
- Edit button (pencil icon) added to header alongside heart + trash
- In edit mode: header shows Cancel (left) + Save (right)
- All fields editable: title, cookbook, page number, category tags, servings, prep time, calories, macros, ingredients (add/remove/edit), steps (add/remove/edit)
- Reuses existing components: `CookbookSelect`, `CategoryTagSelect`
- Save calls existing `updateRecipe()` API function, then reloads recipe data

#### BUG-003: Recipe photos not replaceable
- In edit mode, photo area shows "Foto" (camera) and "Galerie" (file picker) buttons overlaid on the image
- New photo preview shown immediately via `URL.createObjectURL()`
- On save, new photo uploaded to Supabase storage via existing `uploadRecipePhoto()`
- Old photos remain in storage (cleanup tracked as FEAT-008 in backlog)

### Backlog update
- Added FEAT-008 (P3): Storage cleanup for replaced recipe photos

### Build Verification
- TypeScript type-check: **0 errors**
- Vite production build: **success** (453 KB JS, 18 KB CSS gzipped)

### Files Modified
- `src/pages/AddRecipePage.tsx` — decimal input fix (BUG-001)
- `src/pages/RecipeDetailPage.tsx` — full rewrite with edit mode + photo replacement (BUG-002 + BUG-003)
- `airfryer-diet-backlog.md` — added FEAT-008

### Current Status
- **P0 bugs: ALL FIXED** — committed as `db81b70`, pushed to main, Vercel auto-deploys
- **21 recipes captured** out of 30-50 target — user testing P0 fixes before capturing more
- **Backlog file:** `airfryer-diet-backlog.md` — tracks all bugs and features with priorities

### Next Development Cycle (P1 items)
After user tests and confirms P0 fixes work on phone:

1. **BUG-004** (P1): AI parsing confuses F (Fett) and E (Eiweiß) abbreviations
   - Fix: Add explicit German macro abbreviation mapping to Claude prompt in `src/lib/parsePrompt.ts`
   - `F = Fett → fat_g`, `E = Eiweiß → protein_g`, `KH = Kohlenhydrate → carbs_g`

2. **FEAT-001** (P1): Recipe count display with filter context
   - Show "5 von 21 Rezepten" on `RecipesPage` when filters are active

3. **FEAT-002** (P1): Three-dot action menu on recipe detail
   - Replace trash icon with ⋯ menu containing: Edit, Don't suggest anymore, Delete
   - Wire up `is_excluded` toggle (field already exists in DB schema + TypeScript types, just not exposed in UI)
   - Keep heart (favorite) as standalone icon

4. **FEAT-007** (P1): Meal prep — portion scaling choice
   - Depends on Phase 2 meal plan feature — may defer to Phase 2

---

## 2026-02-27 — P1 Fixes (BUG-004, FEAT-001, FEAT-002)

### What was done
Completed all three P1 items from the backlog.

#### BUG-004: AI parsing confuses F/E/KH macro abbreviations
- Added explicit German nutritional abbreviation mapping to Claude parse prompt in `src/lib/parsePrompt.ts`
- Mapping: `F = Fett → fat_g`, `E = Eiweiß → protein_g`, `KH = Kohlenhydrate → carbs_g`
- Added emphatic "F is NEVER protein, E is NEVER fat" instruction with double-check reminder

#### FEAT-001: Recipe count display with filter context
- Added recipe count to `RecipesPage` header: shows total ("21 Rezepte") or filtered ("5 von 21 Rezepte")
- Count appears right-aligned next to the page title
- Detects active filters by comparing against defaults (search, categories, cookbook, calorie range, prep time, favorites)

#### FEAT-002: Three-dot action menu on recipe detail
- Replaced pencil + trash icons with a three-dot menu (⋯) using `MoreVertical` from lucide-react
- Heart (favorite) stays as standalone icon
- Menu items: Edit, Don't suggest anymore / Suggest again, Delete (with divider before delete)
- "Don't suggest anymore" toggles `is_excluded` field via `updateRecipe()` API
- Excluded recipes show "Ausgeschlossen" badge on detail page
- Excluded recipes render at 50% opacity in recipe list (`RecipeCard`)
- Menu closes on outside click

### Build Verification
- TypeScript type-check: **0 errors**
- Vite production build: **success** (455 KB JS, 18 KB CSS gzipped)

### Files Modified
- `src/lib/parsePrompt.ts` — German macro abbreviation mapping (BUG-004)
- `src/pages/RecipesPage.tsx` — recipe count with filter context (FEAT-001)
- `src/pages/RecipeDetailPage.tsx` — three-dot menu, exclude toggle, excluded badge (FEAT-002)
- `src/components/recipes/RecipeCard.tsx` — opacity for excluded recipes (FEAT-002)
- `src/i18n/de.ts` — added recipe count translation keys
- `airfryer-diet-backlog.md` — marked BUG-004, FEAT-001, FEAT-002 as done

### Current Status
- **All P1 items: DONE**
- Remaining P1: FEAT-007 (meal prep portion scaling) — deferred to Phase 2
- **Next step:** Phase 2 — Planning & Cooking

---

## 2026-02-27 — Phase 2 Implementation Complete

### What was done
All 7 work chunks of Phase 2 (Planning & Cooking) implemented:

1. **Database Migration** — `supabase/migrations/002_phase2_schema.sql` with 3 new tables: `user_settings` (single-row, calorie target, meals/day, time budgets, pantry staples), `meal_plans` (date+meal_type UNIQUE, recipe FK, completion tracking, free meals), `weight_log` (date UNIQUE). All with RLS, indexes, updated_at triggers.

2. **Types + API Layer + i18n** — Added `MealType`, `UserSettings`, `MealPlan`, `MealPlanWithRecipe`, `WeightLogEntry` types. `MEAL_TYPES` constant with German labels. 3 new API modules (`userSettings.ts`, `mealPlans.ts`, `weightLog.ts`). ~50 new German i18n keys for settings, plan, today, and cooking views.

3. **User Settings (Profile Page)** — Replaced placeholder with full settings form: daily calorie target, meals/day (3-button selector), per-meal time budgets, start/target weight, pantry staples tag input. Upsert pattern (single row).

4. **Meal Plan Generator** — Pure function in `mealPlanGenerator.ts`: determines meal slots from meals_per_day, filters recipes by category + time budget, weighted random selection (favorites 3x weight), max 2x same recipe/week, calorie balancing within ±10% of target (up to 5 swap attempts). Date utilities in `dateUtils.ts`.

5. **Plan Page (Week View)** — Horizontal scroll of 7 day columns with meal cards. Week navigation (prev/next). "Plan erstellen" / "Woche neu planen" button. Tap meal → action modal (Cook Now, Mark Complete, Free Meal, Swap). Swap modal lists filtered recipes. Free meal modal with calorie + note input.

6. **Today Page (Day View)** — Calorie summary with progress bar (consumed/remaining/target). Meal cards with recipe photo, title, calories, prep time. "Jetzt kochen" button, mark eaten, free meal options. Links to plan if no meals for today. Changed default route from `/recipes` to `/today`.

7. **Cooking Mode** — Full-screen route `/cook/:id` outside AppLayout (no tab bar). 4-phase wizard: Overview (servings selector) → Ingredient checklist (tap-to-check) → Step-by-step (with progress dots) → Done (mark complete if from plan). Wake Lock API. Per-step countdown timer with Web Audio beep. Large fonts (18px body, 24px headings). Previous/Next button navigation.

### V1 Simplifications
- Servings always 1 (no calorie-based serving adjustment in generator)
- No meal prep logic (schema supports it, UI doesn't surface it)
- No drag & drop in week view (swap via modal instead)
- Button navigation in cooking mode (no swipe gestures)

### Build Verification
- TypeScript type-check: **0 errors**
- Vite production build: **success** (498 KB JS, 24 KB CSS gzipped)
- PWA: Service worker generated with 5 precached entries

### Files Created (21 new files)
```
supabase/migrations/002_phase2_schema.sql
src/api/userSettings.ts, mealPlans.ts, weightLog.ts
src/lib/mealPlanGenerator.ts, dateUtils.ts
src/hooks/useWakeLock.ts, useTimer.ts
src/components/settings/SettingsForm.tsx, PantryStaplesInput.tsx
src/components/plan/WeekView.tsx, DayColumn.tsx, MealSlotCard.tsx, SwapMealModal.tsx
src/components/today/CalorieSummary.tsx, MealCard.tsx, FreeMealModal.tsx
src/components/cooking/CookingOverview.tsx, IngredientChecklist.tsx, StepByStep.tsx, CookingTimer.tsx, CookingDone.tsx
src/pages/CookingModePage.tsx
```

### Files Modified (7 files)
```
src/lib/types.ts — Phase 2 types (MealType, UserSettings, MealPlan, etc.)
src/lib/constants.ts — MEAL_TYPES, DEFAULT_USER_SETTINGS
src/i18n/de.ts — ~50 new German translation keys
src/App.tsx — /cook/:id route outside AppLayout, default route → /today
src/pages/ProfilePage.tsx — replaced placeholder with SettingsForm
src/pages/PlanPage.tsx — full week view implementation
src/pages/TodayPage.tsx — full day view implementation
```

### Current Status
- **Phase 2: CODE COMPLETE** — 0 TS errors, builds successfully
- **User still needs to:** Run migration `002_phase2_schema.sql` in Supabase dashboard
- **After migration:** Test settings save, plan generation, today view, cooking mode on phone
- **Next step:** Phase 3 — Shopping & Tracking (shopping list generation, weight tracking, streak counter)

---
