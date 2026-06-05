# Finance Tracker

Aplicación web para el seguimiento de finanzas personales. Construida con React, TypeScript, Vite y pnpm.

## Tech stack

| Capa | Tecnología |
|------|-----------|
| UI | React 19, React Router 7 |
| Lenguaje | TypeScript 6 (strict mode) |
| Build | Vite 8 |
| State | `useReducer` + Context |
| Test | Vitest |
| Lint | ESLint 10 (flat config) + typescript-eslint |
| Paquete | pnpm 11.5.1 |
| Docker | node:22-alpine (multi-stage) |
| Deploy | Vercel |

## State management

Sin librería externa — `useReducer` + React Context con persistencia automática en localStorage.

- `FinanceProvider.tsx` contiene el reducer y el efecto de persistencia.
- `financeContext.ts` expone el contexto y el hook `useFinance()`.
- Las páginas llaman a `useFinance()` para leer estado y disparar acciones.

### Rutas

| Path | Página | Descripción |
|------|--------|-------------|
| `/` | DashboardPage | Resumen: patrimonio, cuentas, ahorro, gastos |
| `/movimientos` | TransactionsPage | CRUD de movimientos con filtros |
| `/categorias` | CategoriesPage | CRUD de categorías |
| `/cuentas` | AccountsPage | CRUD de cuentas |

### Tipos principales

| Tipo | Descripción |
|------|-------------|
| `Account` | Cuenta con `type: 'cash'\|'savings'\|'investment'` y `openingBalance` |
| `Category` | Categoría de gasto/ingreso con `color` e `icon` |
| `Transaction` | Movimiento con `amount` (signado), `accountId`, `categoryId` |
| `FinanceAction` | 10 tipos de acción discriminada para el reducer |
| `FinanceContextValue` | Interface completa del contexto (estado + métodos) |

## Desarrollo

```bash
pnpm install
pnpm run dev       # http://localhost:5173
pnpm run build     # Producción → dist/
pnpm run lint      # ESLint (0 warnings goal)
pnpm run test      # Vitest
pnpm exec tsc --noEmit --project tsconfig.app.json
pnpm exec tsc --noEmit                         # + tsconfig.node.json (configs)
```

### Docker

```bash
# Desarrollo (hot-reload)
docker compose up

# Producción (servido con serve en :3000)
docker build --target production -t finance-tracker .
docker run -p 3000:3000 finance-tracker
```

## Tests

Actualmente cubren utilidades puras (2 ficheros, 3 tests). No hay tests de componentes ni páginas.

```
src/utils/format.test.ts   → formatDate
src/utils/math.test.ts     → fractionOf
```

## Deployment

Vercel con configuración en `vercel.json`. El framework se detecta automáticamente como Vite.

| Entorno | Rama |
|---------|------|
| Producción | `main` |
| Staging (preview permanente) | `dev` |
| Preview por PR | automática |

## Tracker de incidencias

Usamos [GitHub Issues](https://github.com/mystraldev/finance-tracker/issues) para la gestión de tareas y bugs.
