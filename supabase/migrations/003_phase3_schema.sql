-- Phase 3: Shopping Lists
CREATE TABLE shopping_lists (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  week_start DATE NOT NULL UNIQUE,
  items      JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for shopping_lists" ON shopping_lists FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX idx_shopping_lists_week ON shopping_lists(week_start);
