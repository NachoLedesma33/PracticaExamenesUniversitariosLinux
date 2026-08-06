# 14 — Historial de Cambios

> Historia del proyecto reconstruida desde `git log` (68 commits en `main`).
> Verificado el 2026-08-06.

---

## 1. Versiones / hitos

### v1.0.0 — "SO-practica" (estado actual)

Simulador de terminal Linux para práctica de exámenes universitarios. 339 ejercicios, 74 comandos, VFS completo, validación multi-modo y deploy en Vercel.

| Métrica | Valor |
|---|---|
| Ejercicios | 339 (base 54 · p1 102 · p2 100 · p3 67 · final 16) |
| Comandos simulados | 74 módulos / 75 registrados |
| Tests | 358 en 17 archivos |
| VFS | 28 dirs + 111 archivos |
| Slices de Zustand | 5 |
| Learning paths | 15 |
| Commits en `main` | 68 |

---

## 2. Fase 1 — Fundación (commits iniciales)

### Motor y data base
- `ab97030` **feat**: simulador de terminal Linux con VFS, motor de comandos y ejercicios interactivos (base del proyecto).
- `a51951c` **feat**: PARCIAL 1 y 2 completos, UI glassmorphism, importación de ejercicios, 12 comandos nuevos, shell scripts, monitoreo.
- `be95a8c` **feat**: PARCIAL 3 completo (53 ejercicios + anexo vi), errores corregidos de parcial2.
- `8dd9249` **feat**: 31 comandos faltantes, páginas man, light mode, banner de ejercicios, acordeón de categorías, fixes varios.

### Correctitud de validación
- `c1a4593` **fix**: regex de validación ajustados en 10 ejercicios; archivos faltantes agregados al VFS (`/etc/group`, `/media/KINGSTON`, `respaldo.tar`, `archi350`, etc.) para que comandos correctos no fallen.
- `89ca096` **fix**: `validateCommand` ahora verifica el exit code cuando el comando coincide con la regex → rechaza comandos que fallan en el VFS (p. ej. `cat` sobre archivo inexistente).
- `9527568` **fix**: bug de alternancia regex (`\|` → `|`) en 4 patrones; `executionCommand` + `expectedOutput` en 29 ejercicios de scripting; `pendingInput` click-to-paste en session store + TerminalInput; render de secciones ejecución/salida en ChallengeBanner/ChallengeCard.
- `88263c0` **fix**: eliminados 9 ejercicios duplicados en `parcial2.ts`.
- `c34cbc6` **fix**: soporte de operadores de control `&&` y `||` en el executor.
- `c12c442` **fix**: `execute` del initialState del challenge, silenciar validaciones de comandos no relacionados, auto-validación en Ctrl+D, enforcement de exit codes.

### UX de terminal
- `26a0db0` **feat**: terminal realista con prompt minimalista, input al fondo, sin animaciones.
- `65d7523` **feat**: prompt bash realista y textarea a pantalla completa para ejercicios de scripting.
- `18030d0` **feat**: favicon estilo bash (`$` verde con cursor).
- `dfeae61` **feat**: título "bash.practice" más corto.

### Datos enriquecidos
- `17b2d9d` **feat**: `executionCommand` + `expectedOutput` en 28 ejercicios (kill, nice, fg, bg, jobs, at, batch, cron, export, useradd, usermod, groupadd, groupmod, userdel, umount, swapon).
- `d6885f0` **docs**: README completo con todas las features.

### Infraestructura
- `b775e47` **feat**: tests automatizados con Vitest (61 tests en 5 suites).
- `2322fc8` **feat**: barrel files (components/engine/data) + persistencia VFS en localStorage.
- `de62e79` **chore**: `vercel.json` para deploy en Vercel.

---

## 3. Fase 2 — Validación semántica y contenido dinámico

- `5af3b9f` **feat (F1)**: validación semántica con equivalencias, fuzzy matching y feedback.
- `e63cb24` **feat (F2)**: generación dinámica de ejercicios con templates paramétricos (`exercise-generator.ts`).
- `943e736` **feat (F3)**: comando `?explica` como alias de `man`.
- `7d161f4` **feat (F4)**: pistas progresivas por categoría con máquina de estados (`hint-system`).
- `afc9038` **feat (F5)**: Modo Libre con learning paths y secuencia didáctica.
- `4ce8fd3` **refactor**: extraer Modo Libre a componente `ModoLibrePanel`.
- `fbd2c2c` **feat**: validación híbrida de 3 capas y reseteo de input al cambiar ejercicio.
- `c1beb05` **fix**: scroll general en sidebar y contraste de tipografía.
- `0a39a56` **feat**: borrar ejercicios generados y distinción visual (púrpura + badge "Generado").
- `a9f5a7c` **fix**: ordenar ejercicios generados al inicio de la lista.

### Fixes de comandos
- `acb1dbb` **fix**: `cut` con flags descompuestas ahora produce salida visible.
- `4889724` **fix**: `cut` con valores inline y `createDir` no destructivo.
- `a84fc4b` **fix**: `head -4` ahora funciona (reconoce el conteo de líneas en args).
- `31bb6a9` **fix**: `lista` ahora tiene archivos; `ls -i` muestra salida visible.
- `f110351` **fix**: `find -gid/-uid/-ls/-size`, exit code en validación, instrucción de `p3-33`.
- `9dbae80` **fix**: hint de `p1-25` con directorio; regex requiere ambos archivos.
- `d3a7f34` **fix**: `cat` capture mode resuelve rutas relativas con `resolvePath`.
- `8ad9b45` **fix**: enunciados de `p1-03` y `p1-06` muestran contenido en líneas separadas (no comas).

### Ejercicios FINALES
- `f17bb0a` **feat**: ejercicios FINALES con menú, scroll y `case a|A` en soluciones.
- `9ad5f81` **feat**: 6 ejercicios FINALES más (procesos, recursos, discos, tareas, compresión, seguridad).
- `18b8254` **feat**: examen final — script menú para gestión de directorios.
- `34367bb` **feat**: comando `lpstat`, sudo passthrough y ejercicio Menu1 de shell scripting.
- `1348b7f` **fix**: mover ejercicio Menu1 de shell scripting a categoría FINALES.

---

## 4. Fase 3 — Tests masivos (fases 1-9)

Estrategia: tests por fase del motor. Ver `10-TESTING.md` para el mapa completo.

| Commit | Fase | Tests | Cobertura |
|---|---|---|---|
| `3016712` | Fase 1 | 57 | executor (fixes de tail/chown/grep) |
| `1601cc8` | Fase 2 | 40 | VFS (fix `createVFS` deep clone) |
| `a6a4517` | Fase 3 | 30 | validación (fix `fileExists(dire/lista)`) |
| `edf869a` | Fase 4 | 28 | capture mode (extracción de lógica a `capture-mode.ts`) |
| `894f140` | Fase 5 | 30 | persistencia y estado (challenge, history, session slices) |
| `2a888b6` | Fase 6 | 24 | integración de ejercicios parcial1/3/finales |
| `475a184` | Fase 8 | 10 | flujos de usuario complejos (capture, navigate, revalidate) |
| `01ff74d` | Fase 9 | 9 | regresión de build (IDs únicos, campos requeridos, conteos) |

- `0a893c0` **fix (P017)**: ejercicios de estado rechazan comandos no relacionados + fix de 6 ejercicios con estado pre-satisfecho.

---

## 5. Fase 4 — Salida simulada y expansión del VFS

- `b0efe84` **feat**: sistema `simulatedOutput` para archivos faltantes.
- `7f53f0b` **feat**: salida simulada en 8 comandos cuando faltan archivos.
- `8c1ad17` **feat**: expansión de `/bin` de 10 a 44 binarios realistas de Linux.
- `2ee963b` **test**: 16 tests de simulated output y contenido de `/bin`.
- `d2671f7` **fix**: eliminadas variables sin uso que rompían el build de TS.
- `4bc12e8` **chore**: ignorar artefactos de build de `graphify-out`.

---

## 6. Fase 5 — Reorganización de ejercicios y documentación

### Data
- `e742d0e` **feat**: dividir preguntas teóricas de dirmenu en 5 ejercicios FINALES separados.
- `edc2378` **feat**: mover dirmenu (script + teoría) a PARCIAL 3 - Shell Scripting como `p3-dirmenu` y `p3-dirmenu-teoria`.
- `36d1645` **feat**: nuevo examen final `FINALES - Examen Final` con 4 ejercicios (`final-13`..`final-16`): menú tar+awk, users/groups, chmod 744, cron.

### Fixes
- `18145b1` **fix**: preservar indentación/whitespace en la solución del ChallengeBanner (`<pre>`).

### Config / hygiene
- `73ce6cf` **chore**: gitignore de docs locales y reglas IDE + config de agente del proyecto (`AGENTS.md`).
- `aed0635` **chore**: gitignore del plan de documentación.

### Docs (ver `docs/00-INDICE.md`)
- `30182a1` **docs**: índice + README con cifras verificadas.
- `f789bff` **docs**: 01-ARQUITECTURA.
- `7b4850c` **docs**: 02-MOTOR-TERMINAL, 03-VALIDACION, 04-VFS.
- `b3d7d5f` **docs**: 10-TESTING, 13-GUIA-DESARROLLADOR.
- `dfb3be4` **docs**: 05-COMANDOS, 06-EJERCICIOS.

---

## 7. Bugs conocidos pendientes

Fuente: `ERRORES-BUGS.md` (local, fuera del repo). Reportados 2026-07; algunos recibieron mitigación parcial.

| # | Bug | Ejercicios | Severidad | Estado |
|---|---|---|---|---|
| 1 | `chmod` no procesa operadores `=`/`+` con múltiples clases (`ug+rx`, `u=rw,g=rx`) | p1-55..58 | Alta | Pendiente |
| 2 | `crontab` no parsea la línea completa (toma el minuto como comando: "30: comando no encontrado") | p2-01..12 | Alta | Pendiente |
| 3 | `tar` no soporta modos `t` y `x` (listar/extraer) | p1-65, p1-66 | Media | Mitigado con salida simulada |
| 4 | `unzip` no encuentra archivos `.zip` ausentes del VFS | p1-67..70 | Media | Mitigado con salida simulada |
| 5 | `more` no soporta flags posicionales (`more 4 archivo`) | p1-20..23 | Media | Pendiente |
| 6 | Output vacío sin feedback en redirecciones a archivo | p1-17, p1-24, p1-18, p1-19 | Baja | Pendiente |
| 7 | Validación regex intermitente en p2-07 | p2-07 | Media | Pendiente (verificar) |

> Mitigación histórica: el sistema `simulatedOutput` (Fase 4) resuelve la falta de feedback cuando un comando referencia archivos que no existen en el VFS (`wc`, `tar`, `unzip`, etc.), mostrando qué saldría si el archivo existiera.

---

## 8. Convenciones de commits

- Formato: `tipo: descripción` con prefijos `feat:` / `fix:` / `test:` / `docs:` / `refactor:` / `chore:`.
- Los tests se commitean por fase (mensaje `test: fase N E2E - <cantidad> tests <área>`).
- Los .md de diagnóstico/planificación local (ERRORES-BUGS.md, E2E-DIAGNOSTICO.md, PLAN-DOCUMENTACION.md, etc.) **no** se suben.
