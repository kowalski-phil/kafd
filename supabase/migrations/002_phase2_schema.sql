-- Phase 2 Schema: user_settings, meal_plans, weight_log
-- Run this in the Supabase SQL Editor

-- ============================================
-- Table: user_settings (single-row)
-- ============================================
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  daily_calorie_target INTEGER NOT NULL DEFAULT 1800,
  meals_per_day INTEGER NOT NULL DEFAULT 3 CHECK (meals_per_day IN (3, 4, 5)),
  time_budget_breakfast INTEGER NOT NULL DEFAULT 15,
  time_budget_lunch INTEGER NOT NULL DEFAULT 30,
  time_budget_dinner INTEGER NOT NULL DEFAULT 30,
  time_budget_snack INTEGER NOT NULL DEFAULT 10,
  start_weight_kg DECIMAL,
  target_weight_kg DECIMAL,
  pantry_staples TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Table: meal_plans
-- ============================================
CREATE TABLE meal_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack_1', 'snack_2')),
  recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  servings INTEGER NOT NULL DEFAULT 1,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  is_free_meal BOOLEAN NOT NULL DEFAULT FALSE,
  free_meal_calories INTEGER,
  free_meal_note TEXT,
  is_meal_prep BOOLEAN NOT NULL DEFAULT FALSE,
  meal_prep_source_id UUID REFERENCES meal_plans(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(date, meal_type)
);

CREATE INDEX idx_meal_plans_date ON meal_plans(date);
CREATE INDEX idx_meal_plans_recipe_id ON meal_plans(recipe_id);

CREATE TRIGGER meal_plans_updated_at
  BEFORE UPDATE ON meal_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Table: weight_log
-- ============================================
CREATE TABLE weight_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  weight_kg DECIMAL NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_weight_log_date ON weight_log(date);

-- ============================================
-- Row Level Security
-- ============================================
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on user_settings" ON user_settings
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on meal_plans" ON meal_plans
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on weight_log" ON weight_log
  FOR ALL USING (true) WITH CHECK (true);
