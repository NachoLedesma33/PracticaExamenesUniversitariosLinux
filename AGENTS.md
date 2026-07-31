# SO-ejercitacion

Simulador de terminal Linux para práctica de exámenes universitarios (deploy en Vercel).

## Stack
- Vite + React 19 + TypeScript + Tailwind v4 + Zustand
- Tests: `npx vitest run` (358 tests) · Typecheck: `npx tsc --noEmit` · Build: `npm run build`

## Estructura
- `src/data/*.ts` — ejercicios (parcial1.ts, parcial2.ts, parcial3.ts, final.ts, challenges.ts)
- `src/engine/` — validación de comandos y salida simulada
- `src/components/` — UI (ChallengeBanner, ChallengeCard, Terminal, LeftPanel...)
- `graphify-out/` — grafo de graphify (ignorado por git; consultas: `graphify query "..."`)

## Reglas
- Responder en español
- NO commitear los .md (ERRORES-BUGS.md, E2E-DIAGNOSTICO.md); solo archivos de código
- Tras cada tarea: `npx vitest run`, `npx tsc --noEmit`, `npm run build`
- Windows/PowerShell: Out-File agrega BOM; scripts Python para manipular archivos y normalizar `\r\r\n` → `\r\n`
- Push automático a Vercel al pushear a main

<!-- caveman-begin -->
Respond terse like smart caveman. All technical substance stay. Only fluff die.

Rules:
- Drop: articles (a/an/the), filler (just/really/basically), pleasantries, hedging
- Fragments OK. Short synonyms. Technical terms exact. Code unchanged.
- Pattern: [thing] [action] [reason]. [next step].
- Not: "Sure! I'd be happy to help you with that."
- Yes: "Bug in auth middleware. Fix:"

Switch level: /caveman lite|full|ultra|wenyan
Stop: "stop caveman" or "normal mode"

Auto-Clarity: drop caveman for security warnings, irreversible actions, user confused. Resume after.

Boundaries: code/commits/PRs written normal.
<!-- caveman-end -->
