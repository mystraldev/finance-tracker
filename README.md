# Finance Tracker

Aplicación web para el seguimiento de finanzas personales.

## Desarrollo

```bash
npm install
npm run dev
```

## Comandos

- `npm run dev`: inicia el servidor de desarrollo.
- `npm run build`: genera la versión de producción.
- `npm run lint`: ejecuta ESLint.

## Deployment

El proyecto está configurado para desplegarse en **Vercel** mediante `vercel.json`.

### Rama `main` — producción

La rama `main` se despliega automáticamente en el entorno de producción al hacer merge.

### Rama `dev` — preview permanente

La rama `dev` se despliega como preview de staging. Para activarla:

1. En el dashboard de Vercel, ve a **Project Settings > Git > Preview Branches**.
2. Añade `dev` a la lista de ramas con preview permanente.

### PRs — preview automática

Cada Pull Request genera un preview URL única automáticamente (Vercel lo activa por defecto).

### Setup inicial (una vez)

1. Ve a [vercel.com](https://vercel.com) e importa el repositorio `hatsydev/finance-tracker`.
2. Vercel detectará automáticamente el framework **Vite** y usará la configuración de `vercel.json`.
3. Tras el primer deploy, configura las ramas de preview (paso anterior) si es necesario.
