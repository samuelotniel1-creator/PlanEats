-- Eater — PostgreSQL schema (production data layer; MVP runs on an in-memory
-- store with the same shape, see src/data/seed.js, so the API contract
-- does not change when this schema is wired up).

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  diet_type     TEXT,                 -- e.g. 'vegetarian', 'vegan', 'omnivore'
  allergies     TEXT[] DEFAULT '{}',
  dislikes      TEXT[] DEFAULT '{}',
  max_prep_min  INTEGER,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ingredients (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT UNIQUE NOT NULL,
  is_perishable BOOLEAN NOT NULL DEFAULT true,
  default_unit  TEXT NOT NULL DEFAULT 'unit'
);

CREATE TABLE recipes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  meal_type       TEXT NOT NULL,       -- 'breakfast' | 'lunch' | 'dinner'
  diet_tags       TEXT[] DEFAULT '{}', -- e.g. '{vegetarian,vegan}'
  allergen_tags   TEXT[] DEFAULT '{}', -- e.g. '{gluten,dairy,nuts}'
  prep_minutes    INTEGER NOT NULL,
  cook_minutes    INTEGER NOT NULL DEFAULT 0,
  instructions    TEXT[] NOT NULL,     -- ordered steps
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE recipe_ingredients (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id     UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
  quantity      NUMERIC NOT NULL,
  unit          TEXT NOT NULL
);

CREATE TABLE meal_plans (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  start_date    DATE NOT NULL,
  end_date      DATE NOT NULL,
  meals_per_day INTEGER NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE meal_plan_entries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id  UUID NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
  day_index     INTEGER NOT NULL,   -- 0-based offset from start_date
  meal_type     TEXT NOT NULL,      -- 'breakfast' | 'lunch' | 'dinner'
  recipe_id     UUID NOT NULL REFERENCES recipes(id)
);

CREATE TABLE shopping_lists (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id  UUID NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE shopping_list_items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopping_list_id  UUID NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,
  ingredient_id     UUID NOT NULL REFERENCES ingredients(id),
  quantity          NUMERIC NOT NULL,
  unit              TEXT NOT NULL,
  is_perishable     BOOLEAN NOT NULL,
  suggested_day_index INTEGER  -- NULL for non-perishables (buy at start)
);
