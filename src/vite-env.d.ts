/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Supabase project URL, e.g. https://xxxx.supabase.co */
  readonly VITE_SUPABASE_URL: string
  /** Supabase public (publishable/anon) key. Safe to ship in the frontend; RLS enforces access. */
  readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
