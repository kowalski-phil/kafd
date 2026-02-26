# AirFryer Diet App

## Project Overview
A mobile-first PWA for weight loss using air fryer recipes. Digitizes recipes from physical cookbooks via photo upload (Claude Vision API), creates personalized meal plans based on calorie budgets and available prep time, and guides the user through daily cooking with an optimized cooking mode.

**Target user:** Single user (the developer), expandable later.
**UI Language:** German. Architecture is i18n-ready for future multi-language support.

## Tech Stack
- **Frontend:** Vite + React (TypeScript) + Tailwind CSS
- **PWA:** Workbox / vite-plugin-pwa
- **Backend/DB:** Supabase (PostgreSQL)
- **Photo Parsing:** Claude API (Vision)
- **Hosting:** Vercel
- **Offline Cache:** Service Worker + IndexedDB

## Key Architecture Decisions
- Offline strategy: Cache current weekly plan + associated recipes in Service Worker
- API abstraction: Meal plan generation behind a service layer (rule-based now, Claude API later)
- Ingredient normalization: Claude API normalizes ingredient names during parsing for shopping list aggregation

## Data Model (6 tables)
- `cookbooks` — cookbook metadata
- `recipes` — recipe data with JSONB ingredients/steps, calories, macros, category tags
- `user_settings` — calorie target, meals/day, time budgets, pantry staples
- `meal_plans` — daily meal assignments with completion tracking, free meals, meal prep
- `weight_log` — daily weight entries
- `shopping_lists` — weekly aggregated shopping lists by category

## Development Phases
1. **Phase 1 - Foundation:** Project setup, Supabase schema, cookbook CRUD, photo upload + Claude parsing, recipe list/detail/search, serving conversion, tab navigation, Vercel deploy
2. **Phase 2 - Planning & Cooking:** User settings, meal plan generator, day/week views, cooking mode (fullscreen, step-by-step, timer, wake lock), plan tracking
3. **Phase 3 - Shopping & Tracking:** Shopping list generation, weight tracking with graph, streak counter, weekly review
4. **Phase 4 - Smart Features:** "What can I cook?", meal prep logic, macros dashboard, offline cache, PWA optimization
5. **Phase 5 - Future:** Claude API meal planning, n8n integrations, inventory tracking, i18n, seasonality

## Navigation (Bottom Tab Bar)
- Today (daily plan + dashboard)
- Recipes (list, search, filters)
- Plan (week view, generate, edit)
- Shopping (current shopping list)
- Profile (weight, stats, settings, streak)

## Project Log
See `PROJECT_LOG.md` for detailed progress tracking.

## Conventions
- All UI text in German
- Ingredient categories: `fruits_vegetables`, `meat_fish`, `dairy`, `dry_goods`, `spices`, `other`
- Meal types: `breakfast`, `lunch`, `dinner`, `snack_1`, `snack_2`
- Category tags on recipes: `breakfast`, `lunch`, `dinner`, `snack`
- Smart rounding rules for serving conversion (eggs round up, liquids to 10ml, weights to 5g/10g/25g tiers)
- Touch targets minimum 44x44px, cooking mode font minimum 18px body / 24px headings
