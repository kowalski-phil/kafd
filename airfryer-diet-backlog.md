# AirFryer Diet App – Bug & Feature Backlog

**Last updated:** 2026-02-27
**Recipes captured so far:** 21 of 30-50 target

---

## Priority Legend

| Priority | Meaning |
|---|---|
| 🔴 P0 | Fix before capturing more recipes |
| 🟠 P1 | Next update |
| 🟡 P2 | Own feature phase |
| 🟢 P3 | Future / nice-to-have |

---

## Bugs

### BUG-001: Decimal number input not working properly 🔴 P0
**Description:** Numeric input fields for ingredient amounts do not accept values starting with "0," (e.g., 0.5 or 0.75). Neither comma nor dot works correctly. Current workaround: saving ",75" instead of "0,75".

**Root cause:** HTML `<input type="number">` does not handle German locale decimal separators (comma) properly.

**Suggested fix:** Replace `<input type="number">` with `<input type="text" inputmode="decimal">` for ingredient amount fields. On save, normalize input by converting comma to dot before storing. On display, format back to German locale (comma).

**Affected areas:** Recipe creation, recipe editing, serving size conversion.

---

### BUG-002: Recipes not editable after saving 🔴 P0
**Description:** Once a recipe is saved, there is no way to edit it. Missing data (e.g., page number, category tags) cannot be added after the fact.

**Suggested fix:** Add edit functionality to recipe detail view. All fields that are available during creation should also be editable. Include an "Edit" option in a three-dot menu (⋯) on the recipe detail screen.

**Examples of needed corrections:**
- Adding missing page numbers
- Assigning category tags (breakfast/lunch/dinner/snack)
- Correcting ingredient amounts or names
- Updating calorie or macro values

---

### BUG-003: Recipe photos not replaceable 🔴 P0
**Description:** Recipe photos are currently the raw cookbook page photos from initial capture. There is no option to replace or add a different photo (e.g., a photo of the finished dish or a cleaner image from the cookbook).

**Suggested fix:** In edit mode, add a "Change Photo" button that allows either taking a new photo with the camera or selecting an image from the device gallery.

---

### BUG-004: AI parsing confuses F (Fett) and E (Eiweiß) abbreviations ✅ FIXED
**Description:** In German cookbooks, nutritional values are often abbreviated as F (Fett/fat), E (Eiweiß/protein), KH (Kohlenhydrate/carbs). The Claude API sometimes swaps F and E values.

**Suggested fix:** Add explicit instruction to the Claude API parsing prompt:
```
"In German cookbooks, nutritional values are often abbreviated:
- F = Fett (fat) → map to fat_g
- E = Eiweiß (protein) → map to protein_g  
- KH = Kohlenhydrate (carbohydrates) → map to carbs_g
- kcal = Kalorien (calories) → map to calories
Always map these abbreviations correctly. Double-check: F is NEVER protein, E is NEVER fat."
```

---

## New Features

### FEAT-001: Recipe count display with filter context ✅ DONE
**Description:** The recipe overview should display the total number of recipes. When filters are active, show the filtered count as a fraction of the total.

**Example:** "5 of 21 recipes" when filtering for breakfast.

**Location:** Top of recipe list view, below or next to the search bar.

---

### FEAT-002: Three-dot action menu on recipes ✅ DONE
**Description:** Replace the current icon row (heart + trash) with a cleaner pattern: keep the heart icon (favorite) visible, and move other actions into a three-dot menu (⋯).

**Menu items:**
- ✏️ Edit
- 👎 Don't suggest anymore (dislike/exclude)
- 🗑️ Delete (with confirmation dialog)

**Behavior of "Don't suggest anymore":**
- Recipe is flagged as `is_excluded = true`
- Recipe is hidden from meal plan generation
- Recipe remains visible in the recipe list but with a visual indicator (e.g., greyed out or a small "excluded" badge)
- Exclusion is reversible via the same menu ("Suggest again")

---

### FEAT-003: Multi-user support (family) 🟡 P2
**Description:** Enable multiple users to use the app. Primary scope: family / partner.

**Required changes:**
- Supabase Auth setup (email/password or magic link)
- Add `user_id` column to all relevant tables (recipes, meal_plans, weight_log, user_settings, shopping_lists)
- Supabase Row Level Security (RLS) policies: users can only see/edit their own data by default
- User profile with name and personal settings (calorie target, time budgets, etc.)
- Login / registration screen
- Shared recipe library: recipes are visible to all family members (shared by default since all recipes come from shared physical cookbooks)
- Personal data remains private: meal plans, weight log, favorites, exclusions

**Data sharing model:**
| Data | Scope |
|---|---|
| Recipes | Shared (all family members see all recipes) |
| Cookbooks | Shared |
| Meal plans | Private (per user) |
| Weight log | Private (per user) |
| User settings | Private (per user) |
| Favorites | Private (per user) |
| Exclusions | Private (per user) |
| Comments | Private by default, optionally public |
| Star ratings | Visible to all family members |
| Shopping lists | private (per user) |

---

### FEAT-004: Comments on recipes 🟡 P2
**Description:** Each user can leave comments on any recipe. Comments are private by default, with the option to make them public (visible to other family members).

**Data model addition – table `recipe_comments`:**
| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| recipe_id | UUID | FK → recipes |
| user_id | UUID | FK → auth.users |
| comment | TEXT | Comment text |
| is_public | BOOLEAN | Visible to other users (default: false) |
| created_at | TIMESTAMP | Creation date |
| updated_at | TIMESTAMP | Last update |

**UI:** Comment section at the bottom of recipe detail view. Toggle for public/private per comment. Other users' public comments shown below own comments.

---

### FEAT-005: Star rating per user 🟡 P2
**Description:** Users can rate recipes on a 1-5 star scale. Ratings are visible to all family members. Average rating is displayed on the recipe card in list view.

**Data model addition – table `recipe_ratings`:**
| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| recipe_id | UUID | FK → recipes |
| user_id | UUID | FK → auth.users |
| rating | INTEGER | 1-5 stars |
| created_at | TIMESTAMP | Creation date |

**Constraint:** One rating per user per recipe (UNIQUE on recipe_id + user_id). Rating is updateable.

**UI:** Star display on recipe detail view. Tap to rate. Average shown on recipe cards in list view.

---

### FEAT-006: AI chat for recipe recommendations 🟡 P2
**Description:** A chat interface where the user can describe what they're in the mood for, and the AI suggests matching recipes from the user's library.

**Example interactions:**
- "Ich hab Hunger auf was Herzhaftes" → suggests savory recipes
- "Was kann ich in 15 Minuten machen?" → filters by prep time
- "Ich hatte gestern Hähnchen, heute lieber was anderes" → avoids similar ingredients
- "Was Leichtes unter 400 Kalorien" → filters by calorie count

**Technical approach:**
- Dedicated chat screen (own tab or accessible from "Today" dashboard)
- Claude API call with user's full recipe library as context
- System prompt includes: all recipes (title, calories, prep time, category, ingredients), user's preferences (favorites, exclusions), recent meal history (to avoid repetition)
- Response format: recipe suggestions with brief reasoning, tappable links to recipe detail

**Future enhancement:** Connect to n8n webhook for more complex orchestration.

---

### FEAT-007: Meal prep – portion scaling choice 🟠 P1
**Description:** When a recipe is added to the meal plan, the user should be able to choose between two options:

**Option A – Scale down:** Cook only the needed portion. Ingredients are recalculated (e.g., 600g almond flour → 150g for 1 serving instead of 4). No meal prep involved.

**Option B – Cook full batch:** Cook the full recipe (e.g., 4 servings). Eat 1 now, schedule remaining 3 as meal prep for upcoming meals. Meal prep entries have prep_time = 0.

**UI:** When adding a recipe to the plan that has base_servings > 1, show a dialog:
- "This recipe makes [X] servings. What would you like to do?"
- Button 1: "Cook [1] serving (scale ingredients down)"
- Button 2: "Cook all [X] servings (schedule leftovers as meal prep)"

---

### FEAT-008: Storage cleanup for replaced recipe photos 🟢 P3
**Description:** When a recipe photo is replaced via edit mode, the old photo file remains in the Supabase storage bucket (`recipe-photos`). Over time, this leads to orphaned files consuming storage.

**Suggested fix:** Before uploading a new photo, delete the old file from Supabase storage using `supabase.storage.from('recipe-photos').remove([oldFileName])`. Extract the filename from the existing `photo_url`. Also consider a periodic cleanup job to remove any orphaned files not referenced by any recipe.

---

## Notes

- Multi-user (FEAT-003) is a prerequisite for FEAT-004 (comments) and FEAT-005 (star ratings)
- FEAT-006 (AI chat) can be implemented independently of multi-user
- Shopping list sharing model (shared vs. private) needs decision when implementing FEAT-003
- All P0 bugs should be fixed before continuing recipe capture to avoid data quality issues
