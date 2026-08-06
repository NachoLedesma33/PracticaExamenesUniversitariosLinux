# 11 — Deploy (Vercel)

> Cómo se despliega el proyecto a producción y qué pipeline corre.
> Verificado el 2026-08-06 contra `vercel.json`, `package.json`, `vite.config.ts`, `tsconfig*.json`.

---

## 1. Resumen

| Aspecto | Valor |
|---|---|
| Plataforma | Vercel |
| Repositorio | `github.com/NachoLedesma33/PracticaExamenesUniversitariosLinux` |
| Trigger | Push a `main` → deploy automático (integración nativa de Vercel con GitHub, sin hooks locales) |
| Framework | Vite (React 19 + TS) |
| Build command | `npm run build` → `tsc -b && vite build` |
| Output | `dist/` |

El proyecto es un SPA puro (sin backend, sin SSR): Vercel sirve el bundle estático y los assets generados por Vite.

---

## 2. Configuración

### `vercel.json`

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install"
}
```

- `framework: "vite"` — Vercel usa el preset Vite (presets de build y de assets).
- `buildCommand` — sobrescribe el comando por defecto.
- `outputDirectory` — dónde queda el build.
- `installCommand` — `npm install` (no `ci`) para tolerancia de lockfile.

### `package.json` (scripts relevantes)

```json
"dev": "vite",
"build": "tsc -b && vite build",
"preview": "vite preview",
"test": "vitest run"
```

- `build` corre primero `tsc -b` (typecheck de los project references `tsconfig.app.json` + `tsconfig.node.json`) y después `vite build`. **Si el typecheck falla, el deploy falla.**
- No hay `lint` en el build (ESLint es solo local): el pipeline de Vercel no lo ejecuta.

### `vite.config.ts`

```ts
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

Sin `base` custom → la app se sirve desde la raíz del dominio (`/`). No hay rewrite SPA necesario porque la app no usa rutas de navegación (es una sola vista).

### `tsconfig.json`

Project references:

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

`tsconfig.app.json` cubre `src/`; `tsconfig.node.json` cubre configs/scripts (vite.config.ts, scripts de build, e2e). `tsc -b` construye ambos en orden.

---

## 3. Flujo de deploy

```
git push origin main
    └── Vercel detecta el push (webhook de GitHub)
        ├── npm install
        ├── npm run build   → tsc -b && vite build  → dist/
        └── sirve dist/ en el dominio asignado
```

Cada push a `main` genera un **preview deploy** y (si la rama es la de producción) el **production deploy**. Vercel también hace **deploy previews** automáticos por cada PR/rama nueva.

---

## 4. Verificación local antes de pushear

El mismo pipeline corre en local:

```bash
npx vitest run    # 358 tests
npx tsc --noEmit  # typecheck equivalente a tsc -b
npm run build     # build completo de producción
```

Regla del proyecto: **ningún push a main sin que los tres pasen** (ver `AGENTS.md`).

---

## 5. Troubleshooting

| Problema | Causa probable | Fix |
|---|---|---|
| Deploy rojo en Vercel | Error de typecheck o build | Correr `npm run build` local; corregir y pushear |
| Build local pasa, Vercel falla | Version de Node distinta o lockfile desactualizado | `npm install` y regenerar `package-lock.json` |
| Dominio devuelve 404 en assets | `outputDirectory` incorrecto | Debe ser `dist` |
| Tests no corren en Vercel | El pipeline no ejecuta vitest | La calidad se garantiza localmente antes del push |

> Nota: Vercel **no** corre los tests; el pipeline de calidad es responsabilidad del desarrollador (git hooks/config local). Considerar agregar GitHub Actions si se quiere CI automatizada.

---

## Referencias

- `vercel.json` · `package.json` · `vite.config.ts` · `tsconfig.json` · `tsconfig.app.json` · `tsconfig.node.json`
- Estrategia de tests: `10-TESTING.md`
