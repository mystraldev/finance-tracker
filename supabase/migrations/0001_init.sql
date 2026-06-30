-- Finance Tracker — initial schema with per-user isolation.
--
-- Every row is owned by a user (user_id -> auth.users) and Row Level Security
-- guarantees that a user can only read/write their own rows. This is the
-- mechanism that separates the two developers' data.
--
-- How to apply:
--   A) Supabase dashboard -> SQL Editor -> paste this file -> Run.
--   B) Supabase CLI:  supabase db push   (with migrations linked to the project)

create extension if not exists pgcrypto;

-- ===========================================================================
-- Tables
-- ===========================================================================

create table public.accounts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  name            text not null,
  type            text not null check (type in ('cash', 'savings', 'investment')),
  icon            text not null,
  accent          text not null,
  opening_balance numeric(14, 2) not null default 0,
  interest_rate   numeric(6, 4),
  created_at      timestamptz not null default now()
);

create table public.categories (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  label      text not null,
  icon       text not null,
  color      text not null,
  budget     numeric(14, 2),
  created_at timestamptz not null default now()
);

create table public.transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  date        date not null,
  amount      numeric(14, 2) not null,            -- negative = expense
  description text not null default '',
  account_id  uuid not null references public.accounts (id) on delete restrict,
  category_id uuid not null references public.categories (id) on delete restrict,
  created_at  timestamptz not null default now()
);

create table public.savings_goals (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  name          text not null,
  target_amount numeric(14, 2) not null,
  saved_amount  numeric(14, 2) not null default 0,
  icon          text not null,
  color         text not null,
  account_id    uuid references public.accounts (id) on delete restrict,
  target_date   date,
  created_at    timestamptz not null default now()
);

-- ===========================================================================
-- Indexes (queries are almost always scoped by user_id, often by month)
-- ===========================================================================

create index accounts_user_id_idx       on public.accounts (user_id);
create index categories_user_id_idx     on public.categories (user_id);
create index transactions_user_id_idx   on public.transactions (user_id);
create index transactions_user_date_idx on public.transactions (user_id, date);
create index transactions_account_idx   on public.transactions (account_id);
create index transactions_category_idx  on public.transactions (category_id);
create index savings_goals_user_id_idx  on public.savings_goals (user_id);

-- ===========================================================================
-- Row Level Security — a row is visible/writable only by its owner.
-- ===========================================================================

alter table public.accounts      enable row level security;
alter table public.categories    enable row level security;
alter table public.transactions  enable row level security;
alter table public.savings_goals enable row level security;

create policy "accounts_owner" on public.accounts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "categories_owner" on public.categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "transactions_owner" on public.transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "savings_goals_owner" on public.savings_goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ===========================================================================
-- Privileges — logged-in requests use the `authenticated` role.
-- RLS still restricts which rows they touch. `anon` gets no access (login required).
-- ===========================================================================

grant usage on schema public to authenticated;
grant select, insert, update, delete
  on public.accounts, public.categories, public.transactions, public.savings_goals
  to authenticated;

-- ---------------------------------------------------------------------------
-- Verify (optional): every table below should show rowsecurity = true.
--   select tablename, rowsecurity from pg_tables where schemaname = 'public';
-- ---------------------------------------------------------------------------
