# Supabase

Database schema and migrations for Finance Tracker.

## Environments

| Environment | Frontend branch | Supabase project |
|-------------|-----------------|------------------|
| dev / staging | `dev` | created (in use) |
| production | `main` | to be created |

The frontend reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (see `.env.example`).
These are public client keys; security is enforced by **Row Level Security (RLS)**.

## Applying migrations

### Option A — SQL Editor (no tooling)

1. Open the Supabase dashboard → **SQL Editor**.
2. Paste the contents of `migrations/0001_init.sql`.
3. **Run**.
4. Verify RLS is on:
   ```sql
   select tablename, rowsecurity from pg_tables where schemaname = 'public';
   ```
   All four tables must show `rowsecurity = true`.

### Option B — Supabase CLI

```bash
# one-time
npx supabase login
npx supabase link --project-ref ebbuyvyroxmeefxgvunm

# apply
npx supabase db push
```

## Data model

Four tables — `accounts`, `categories`, `transactions`, `savings_goals` — each with a
`user_id` referencing `auth.users`. Money is stored as `numeric(14,2)`; `transactions.amount`
is signed (negative = expense). See `migrations/0001_init.sql` for the full definition and the
RLS policies that isolate each user's data.
