# Plan de productivización — Finance Tracker

> Objetivo: pasar de una SPA con datos en `localStorage` a una aplicación real,
> con base de datos, autenticación y **aislamiento de datos por usuario**, para que
> dos desarrolladores puedan usarla cada uno sin ver los datos del otro.

## 0. Resumen ejecutivo

- **Stack elegido:** Supabase (Postgres gestionado + Auth + Row Level Security) + el frontend actual (Vite/React) en Vercel. Sin backend propio que mantener.
- **Aislamiento:** cada fila lleva `user_id`; **Row Level Security (RLS)** en Postgres garantiza que un usuario solo accede a sus filas. Es la base de datos quien lo impone, no el código de la app.
- **Privacidad entre los dos devs:** RLS basta para no mezclar datos. Si además queréis que *ni siquiera con acceso de admin* podáis ver lo del otro, hace falta una decisión extra (ver §3).
- **Cambio de código principal:** convertir la capa de persistencia (hoy síncrona contra `localStorage`) en asíncrona contra Supabase, con cache/optimistic updates vía TanStack Query. Las páginas apenas cambian.

## 1. Estado actual

SPA 100% cliente. Todo el estado (`accounts`, `categories`, `transactions`, `savingsGoals`)
vive en `localStorage` bajo la clave `finance-tracker:v2`, gestionado por `useReducer` + Context.

```
Navegador (React + useReducer) ──► localStorage["finance-tracker:v2"]
        sin login · sin servidor · datos atados a un dispositivo
```

Punto a favor: la persistencia está aislada tras la interfaz `FinanceRepo`
(`src/data/financeRepo.ts`) y un único efecto en `src/store/FinanceProvider.tsx`. Eso
hace que enchufar un backend sea un cambio acotado.

## 2. Arquitectura objetivo

```
Navegador (React + TanStack Query) ──(supabase-js + JWT)──►  SUPABASE
                                                              ├─ Auth  (usuarios, sesiones)
                                                              └─ Postgres + RLS
                                                                 accounts · categories
                                                                 transactions · savings_goals
                                                                 (toda fila con user_id)
```

La `publishable/anon key` viaja en el frontend **por diseño**: no es un secreto. La
seguridad la dan el JWT del usuario autenticado + las políticas RLS.

## 3. Privacidad y aislamiento de usuarios

| Nivel | Mecanismo | Quién NO ve tus datos | Coste |
|------|-----------|----------------------|-------|
| **1. Aislamiento por fila (RLS)** ✅ recomendado | `user_id` + política `auth.uid() = user_id` | El otro usuario **a través de la app** | Bajo |
| **2. Cifrado en reposo (server-side)** | Columnas cifradas; clave en el servidor | Quien robe un backup de la BBDD | Medio |
| **3. Cifrado extremo a extremo (E2E)** | Cifrado en el navegador con clave del usuario | **Todos**: el otro dev, el admin, el proveedor | Alto |

**Matiz importante para vuestro caso:** con RLS, cada uno solo ve lo suyo *desde la app*.
Pero si **ambos compartís el panel de Supabase**, cualquiera puede leer las filas del otro
desde el dashboard. RLS protege la app, no el acceso de admin. Si queréis ceguera mutua
incluso a nivel BBDD: (a) que administre el proyecto una sola persona, (b) un proyecto por
cada uno, o (c) cifrado E2E (Nivel 3, con el peaje de que *perder la contraseña = perder los
datos* y de que el servidor no puede hacer cálculos sobre datos cifrados).

**Recomendación:** Nivel 1 (RLS) para empezar. E2E queda como fase futura opcional si abrís
la web a terceros.

## 4. Modelo de datos

Cuatro tablas, cada una con `user_id → auth.users`, dinero en `numeric(14,2)`,
`transactions.amount` con signo (negativo = gasto). Definición completa + políticas RLS en
[`supabase/migrations/0001_init.sql`](../supabase/migrations/0001_init.sql).

Decisiones respecto al modelo actual:
- **IDs** los genera la BBDD (`uuid`), no el cliente (`uid()`). El seed usa ids semánticos
  (`'income'`, `'home'`) que habrá que **re-mapear** a uuids al migrar, preservando las FKs.
- **Borrado referenciado** (`on delete restrict` en `account_id`/`category_id`) refleja el
  guard que ya existe en la UI ("No se puede borrar").
- **Dinero** en `numeric`, no float, para evitar el error de redondeo que hoy se arrastra.

## 5. Plan por fases

Alineado con el flujo de `AGENTS.md` (issue → rama desde `dev` → PR a `dev`).

### Fase 0 — Setup ✅ (hecho, ver §6)
Proyecto Supabase dev creado, entorno y cliente configurados, migración escrita.

### Fase 1 — Base de datos + RLS
- **Aplicar** `supabase/migrations/0001_init.sql` en el proyecto dev (ver `supabase/README.md`).
- Verificar RLS activo en las cuatro tablas.
- *(Hardening opcional)* trigger `before insert/update` que valide que `account_id` y
  `category_id` pertenecen al mismo `user_id` (evita referencias cruzadas entre usuarios vía FK).
- **Entregable:** esquema vivo; un usuario no puede leer filas de otro.

### Fase 2 — Autenticación
- `AuthProvider` + `useAuth()` sobre `supabase.auth`.
- `LoginPage` (registro + acceso). Rutas protegidas en `src/App.tsx`: sin sesión → `/login`.
- Usuario + logout en `src/components/Sidebar.tsx`.
- **Decisión pendiente:** método de login (email+contraseña / magic link / Google).
- **Entregable:** los dos podéis registraros; sin login no se ve nada.

### Fase 3 — Capa de datos asíncrona (mayor cambio de código)
- Añadir `@tanstack/react-query`.
- `createSupabaseFinanceRepo()` implementando una versión **async** de `FinanceRepo`.
- Reescribir `FinanceProvider`: carga vía React Query al iniciar sesión; mutaciones con
  *optimistic updates*; eliminar el `useEffect` de persistencia en localStorage.
- **Churn limitado:** las lecturas (`getTransactions`, `getAvailableMonths`) pueden seguir
  siendo síncronas sobre la cache en memoria; solo cambian persistencia y mutaciones.
- Añadir estados de **carga / error / vacío** (hoy no existen).
- **Entregable:** CRUD real contra Postgres con datos por usuario.

### Fase 4 — Migración de datos y onboarding
- Reutilizar el import/export JSON de `src/pages/SettingsPage.tsx` para **subir** los datos
  actuales de `localStorage` a la cuenta (insert masivo + re-mapeo de ids).
- Decidir onboarding del usuario nuevo: cuenta vacía vs. botón "cargar datos de ejemplo".
- **Entregable:** podéis migrar vuestros datos locales sin perderlos.

### Fase 5 — Productivización general (hardening)
- Observabilidad (Sentry) + analítica básica.
- Validación en servidor (reutilizar validadores de `financeRepo.ts` en Edge Function o
  confiar en constraints + RLS). **Antes, arreglar el bug de `isRecord` — ver §8.**
- CI: añadir job de Playwright e2e (ya configurado, no corre en CI) + smoke contra el preview.
- RGPD: export/borrado de datos, política de privacidad, región EU.
- Backups automáticos y headers de seguridad.
- **Entregable:** apta para uso real continuado.

### Fase 6 — Futuro (opcional)
- Cifrado E2E (Nivel 3).
- Presupuestos/cuentas compartidas tipo "hogar" con invitaciones.
- PWA / offline.

### Camino mínimo a "usable de verdad"
Fases **1 → 2 → 3**. Las 4 y 5 se pueden solapar o ir después.

## 6. Estado del setup (ya hecho en esta rama)

- `@supabase/supabase-js` instalado.
- `.env.example` (plantilla) y `.env.local` (dev, gitignored) con la URL y la public key.
- `src/lib/supabase.ts` — cliente singleton.
- Tipado de env en `src/vite-env.d.ts`.
- `supabase/migrations/0001_init.sql` — esquema + índices + RLS + grants.
- `supabase/README.md` — cómo aplicar.
- `src/lib/**` excluido de cobertura (capa de I/O, igual que `src/data/**`).

**Pendiente manual tuyo:** aplicar la migración (§ `supabase/README.md`) y decidir el método de login.

## 7. Bugs y mejoras detectadas

- **Bug (bajo, latente) — `isRecord` acepta `null`** en `src/data/financeRepo.ts`:
  `typeof null === 'object'`, así que `isRecord(null) === true`. Hoy lo enmascaran los
  `try/catch`, pero da el mensaje de error equivocado al importar un backup con `null` y
  **será peligroso si se reutilizan estos validadores en servidor (Fase 5)**. Fix de una
  línea: `value !== null && typeof value === 'object'`.
- **Dinero en float:** las sumas con `reduce` acumulan error de redondeo → `numeric` en BBDD.
- **IDs en cliente** (`uid()`, fallback no-cripto) → uuid de BBDD.
- **Colisión entre pestañas:** el efecto de persistencia sobrescribe el blob completo y no
  escucha el evento `storage` → lo resuelve el backend + React Query.
- **Sin estados de carga/error** en la UI (todo es síncrono hoy) → Fase 3.
- **CI sin e2e:** Playwright configurado pero el workflow solo corre lint/tsc/test/build.
- **Sin observabilidad** (Sentry) → Fase 5.

Revisado y **correcto** (no son bugs): el borrado de categorías/cuentas referenciadas está
bloqueado en la UI con modal "No se puede borrar"; el import está envuelto en `try/catch`;
el patrón repositorio está limpio.

## 8. Decisiones abiertas

1. Método de login (email+contraseña / magic link / Google).
2. Onboarding: cuenta vacía vs. datos de ejemplo.
3. Nivel de privacidad: RLS (recomendado) vs. E2E desde el principio.
4. ¿Aplicar el hardening de referencias cruzadas (trigger de ownership) en Fase 1 o más tarde?
