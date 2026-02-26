-- Phase 1 Schema: cookbooks + recipes
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Table: cookbooks
-- ============================================
CREATE TABLE cookbooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  author TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Table: recipes
-- ============================================
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  cookbook_id UUID REFERENCES cookbooks(id) ON DELETE SET NULL,
  page_number INTEGER,
  ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  calories INTEGER,
  protein_g DECIMAL,
  carbs_g DECIMAL,
  fat_g DECIMAL,
  prep_time_minutes INTEGER,
  base_servings INTEGER NOT NULL DEFAULT 1,
  category_tags TEXT[] NOT NULL DEFAULT '{}',
  is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
  is_excluded BOOLEAN NOT NULL DEFAULT FALSE,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Indexes
-- ============================================

-- Full-text search on title (German)
CREATE INDEX idx_recipes_title ON recipes USING gin(to_tsvector('german', title));

-- Category tag filtering
CREATE INDEX idx_recipes_category_tags ON recipes USING gin(category_tags);

-- Cookbook filtering
CREATE INDEX idx_recipes_cookbook_id ON recipes(cookbook_id);

-- ============================================
-- Auto-update updated_at trigger
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Row Level Security
-- ============================================
ALTER TABLE cookbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Permissive policies (single-user app, no auth)
CREATE POLICY "Allow all on cookbooks" ON cookbooks
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on recipes" ON recipes
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Storage: recipe-photos bucket
-- ============================================
-- Create bucket via Supabase dashboard:
--   Name: recipe-photos
--   Public: Yes
--   File size limit: 10MB
--   Allowed MIME types: image/jpeg, image/png, image/webp

-- Storage policies (run after bucket creation)
CREATE POLICY "Public read recipe-photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'recipe-photos');

CREATE POLICY "Allow upload recipe-photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'recipe-photos');

CREATE POLICY "Allow update recipe-photos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'recipe-photos');

CREATE POLICY "Allow delete recipe-photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'recipe-photos');
