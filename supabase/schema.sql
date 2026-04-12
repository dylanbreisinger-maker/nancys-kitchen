-- Nancy's Kitchen — Supabase Database Schema
-- Run this in your Supabase SQL Editor (Database → SQL Editor → New query)

-- ─────────────────────────────────────────────
-- 1. Enable UUID extension
-- ─────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────
-- 2. Recipes table
-- ─────────────────────────────────────────────
create table if not exists recipes (
  id            uuid default uuid_generate_v4() primary key,
  title         text not null default 'Untitled Recipe',
  category      text not null default 'other'
                  check (category in (
                    'chicken','beef','pork','fish','pasta','soup',
                    'salad','vegetarian','dessert','bread','drink',
                    'breakfast','appetizer','other'
                  )),
  image_url     text,
  ingredients   text[],
  instructions  text,
  servings      text,
  notes         text,
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);

-- ─────────────────────────────────────────────
-- 3. Comments / reviews table
-- ─────────────────────────────────────────────
create table if not exists comments (
  id            uuid default uuid_generate_v4() primary key,
  recipe_id     uuid not null references recipes(id) on delete cascade,
  author_name   text not null,
  comment_text  text not null,
  photo_url     text,
  rating        integer check (rating >= 1 and rating <= 5),
  created_at    timestamptz default now() not null
);

-- ─────────────────────────────────────────────
-- 4. Indexes for performance
-- ─────────────────────────────────────────────
create index if not exists idx_recipes_category   on recipes(category);
create index if not exists idx_recipes_created_at on recipes(created_at desc);
create index if not exists idx_comments_recipe_id on comments(recipe_id);

-- ─────────────────────────────────────────────
-- 5. Row Level Security — allow all (family site)
-- ─────────────────────────────────────────────
alter table recipes  enable row level security;
alter table comments enable row level security;

-- Drop policies if they already exist (safe to re-run)
drop policy if exists "Allow all on recipes"  on recipes;
drop policy if exists "Allow all on comments" on comments;

create policy "Allow all on recipes"
  on recipes for all
  using (true)
  with check (true);

create policy "Allow all on comments"
  on comments for all
  using (true)
  with check (true);

-- ─────────────────────────────────────────────
-- 6. Auto-update updated_at timestamp
-- ─────────────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists recipes_updated_at on recipes;
create trigger recipes_updated_at
  before update on recipes
  for each row execute procedure update_updated_at();
