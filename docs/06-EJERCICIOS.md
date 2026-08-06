# 06 — Catálogo de Ejercicios

> Catálogo de los ejercicios incorporados (estáticos) y cómo se organizan por archivo, categoría, validación y dificultad.
> Cifras verificadas el 2026-08-06 contra `src/data/*.ts`.

---

## 1. Resumen

| Métrica | Valor |
|---|---|
| Ejercicios estáticos | **339** |
| Archivos de datos | 5 (`challenges.ts`, `parcial1.ts`, `parcial2.ts`, `parcial3.ts`, `final.ts`) |
| Ejercicios generados en runtime (`generateAll`) | +46 teoría + variantes (ver sección 6) |
| Tipos de validación | `command`, `state`, `both`, `text` |
| Dificultades | `fácil`, `medio`, `difícil` |
| Tests | 358 en 17 archivos |

Los 339 ejercicios se componen en el LeftPanel agrupados por **categoría** (ver sección 4).

---

## 2. Distribución por archivo

| Fuente | Export | Ejercicios | Temas |
|---|---|---|---|
| `src/data/challenges.ts` | `challenges` | **54** | Base: navegación, listado, archivos, visualización, búsqueda, redirección, permisos, comodines, avanzados |
| `src/data/parcial1.ts` | `PARCIAL_1_CHALLENGES` | **102** | FileSystem, filtros/pipes, enlaces, permisos, teoría, comandos, compresión |
| `src/data/parcial2.ts` | `PARCIAL_2_CHALLENGES` | **100** | Procesos, planificación, control de trabajos, monitoreo, shell scripting |
| `src/data/parcial3.ts` | `PARCIAL_3_CHALLENGES` | **67** | Sistemas de archivos, shell scripting, variables de entorno, usuarios y grupos, swap, editor vi |
| `src/data/final.ts` | `EXAMEN_FINAL_CHALLENGES` | **16** | Examen final (menús, teoría, conceptos) |
| **Total** | | **339** | |

### Esquema de IDs

| Archivo | Formato | Ejemplo |
|---|---|---|
| `challenges.ts` | prefijo por tema | `nav-01`, `ls-02`, `file-03`, `view-01`, `search-02`, `pipe-01`, `perm-01`, `wild-01`, `adv-01`, `shell-01` |
| `parcial1.ts` | `p1-XX` | `p1-01`, `p1-93` |
| `parcial2.ts` | `p2-XX` | `p2-01`, `p2-100` |
| `parcial3.ts` | `p3-XX` | `p3-01`, `p3-67` |
| `final.ts` | `final-XX` | `final-01`, `final-16` |
| generados | `gen-teoria-N`, `gen-cmd-*` | `gen-teoria-0` |

> Los IDs son estables: los ejercicios importados evitan duplicados por ID, y los tests de regresión referencian ejercicios específicos por su ID.

---

## 3. Categorías por archivo

### 3.1 Base (`challenges.ts`) — 54 ejercicios

| Categoría | Cantidad |
|---|---|
| Archivos | 10 |
| Avanzados | 8 |
| Redirección | 8 |
| Navegación | 5 |
| Listado | 5 |
| Visualización | 5 |
| Búsqueda | 5 |
| Permisos | 5 |
| Comodines | 2 |
| FINALES - Shell Scripting | 1 |

### 3.2 PARCIAL 1 (`parcial1.ts`) — 102 ejercicios

| Categoría | Cantidad |
|---|---|
| PARCIAL 1 - FileSystem | 25 |
| PARCIAL 1 - Permisos | 19 |
| PARCIAL 1 - Filtros | 16 |
| PARCIAL 1 - Teoría | 16 |
| PARCIAL 1 - Compresión | 10 |
| PARCIAL 1 - Comandos | 8 |
| PARCIAL 1 - Navegación | 5 |
| PARCIAL 1 - Enlaces | 3 |

### 3.3 PARCIAL 2 (`parcial2.ts`) — 100 ejercicios

| Categoría | Cantidad |
|---|---|
| PARCIAL 2 - Shell Scripting | 30 |
| PARCIAL 2 - Monitoreo | 26 |
| PARCIAL 2 - Procesos | 22 |
| PARCIAL 2 - Planificación | 16 |
| PARCIAL 2 - Control de Trabajos | 4 |
| PARCIAL 2 - General | 2 |

### 3.4 PARCIAL 3 (`parcial3.ts`) — 67 ejercicios

| Categoría | Cantidad |
|---|---|
| PARCIAL 3 - Sistemas de Archivos | 17 |
| PARCIAL 3 - Shell Scripting | 16 |
| PARCIAL 3 - Usuarios y Grupos | 13 |
| ANEXO - Editor vi | 12 |
| PARCIAL 3 - Variables de Entorno | 5 |
| PARCIAL 3 - Swap | 4 |

### 3.5 Finales (`final.ts`) — 16 ejercicios

| Categoría | Cantidad |
|---|---|
| FINALES - Examen Final | 4 |
| FINALES - Backup y Seguridad | 1 |
| FINALES - Monitoreo del Sistema | 1 |
| FINALES - Administración de Usuarios | 1 |
| FINALES - Análisis de Logs | 1 |
| FINALES - Automatización de Backups | 1 |
| FINALES - Auditoría de Permisos | 1 |
| FINALES - Gestión de Procesos | 1 |
| FINALES - Monitoreo de Recursos | 1 |
| FINALES - Análisis de Discos | 1 |
| FINALES - Planificación de Tareas | 1 |
| FINALES - Compresión y Archivado | 1 |
| FINALES - Seguridad y Auditoría | 1 |

---

## 4. Sistema de categorías y grupos del LeftPanel

El `LeftPanel` agrupa los ejercicios en **5 grupos**. La regla (ver `src/components/LeftPanel.tsx`):

| Condición de la categoría | Grupo |
|---|---|
| Empieza con `PARCIAL 1 - ` | **PARCIAL 1** |
| Empieza con `PARCIAL 2 - ` | **PARCIAL 2** |
| Empieza con `PARCIAL 3 - ` | **PARCIAL 3** |
| Empieza con `FINALES - ` | **FINALES** |
| Cualquier otra cosa | **Original** (colapsado por defecto) |

Consecuencias visibles:
- Los ejercicios de **base** (`challenges.ts`) caen en **Original** (sus categorías no llevan prefijo), salvo `FINALES - Shell Scripting` que aparece en **FINALES**.
- La categoría `ANEXO - Editor vi` de parcial3 no lleva prefijo y cae en **Original**.
- **Regla para autores**: toda categoría nueva debe empezar con `PARCIAL 1/2/3 - ` o `FINALES - ` para aparecer en los grupos principales.

---

## 5. Tipos de validación usados

| Tipo | Total | Descripción corta |
|---|---|---|
| `text` | 175 | El usuario escribe texto/teoría; se valida con regex o similitud semántica (ver `03-VALIDACION.md`) |
| `command` | 102 | Se valida que el comando ejecutado coincida (regex/equivalencias) |
| `state` | 58 | Se valida el estado del VFS/sesión tras ejecutar el comando (archivos, permisos, cwd, usuario) |
| `both` | 4 | Exige comando correcto **y** estado resultante |

Distribución por archivo:

| Archivo | command | state | both | text |
|---|---|---|---|---|
| `challenges.ts` | 27 | 25 | 1 | 1 |
| `parcial1.ts` | 40 | 33 | 3 | 26 |
| `parcial2.ts` | 18 | — | — | 82 |
| `parcial3.ts` | 17 | — | — | 50 |
| `final.ts` | — | — | — | 16 |

> Nota: los parciales 2, 3 y finales usan casi exclusivamente validación `text` (los ejercicios de script/menú piden escribir la solución completa).

---

## 6. Ejercicios generados en runtime

`src/data/exercise-generator.ts` (ver `07-GENERADOR-EJERCICIOS.md`) genera ejercicios adicionales marcados con `generated: true`:

- **Teoría** (`gen-teoria-N`): preguntas de teoría con patrón de respuesta exacto.
- **Variantes de comandos**: ejercicios por comando/categoría según las plantillas del generador.
- Se exponen vía `generateAll()`, `generateByCategory()` y `CATEGORIES` (usado por el Modo Libre).

Estos NO se cuentan en el total estático de 339.

---

## 7. Dificultad

| Dificultad | Base | P1 | P2 | P3 | Finales | Total |
|---|---|---|---|---|---|---|
| `fácil` | 29 | 38 | 27 | 23 | 2 | **119** |
| `medio` | 20 | 52 | 45 | 23 | 2 | **142** |
| `difícil` | 5 | 12 | 28 | 21 | 12 | **78** |

Los finales concentran la mayor proporción de difíciles (12 de 16).

---

## 8. Ejercicios destacados

- **`p3-dirmenu`** — script de menú (shell scripting) con validación `text`; migrado desde FINALES a **PARCIAL 3 - Shell Scripting** el 2026-07-31 (commit `edc2378`). Su solución usa indentación correcta (2/4/6 espacios), renderizada en `<pre>`.
- **`p3-dirmenu-teoria`** — las 5 preguntas teóricas asociadas (free -m, mount, rm -r/-rf, chmod 755, pipes), separadas del script para practicar por partes.
- **`final-13`** — menú de 4 acciones (backup tar.gz, listado de archivos regulares, pwd, salir).
- **`final-14` / `final-15` / `final-16`** — teoría: usuarios/grupos (`useradd`, `groupadd`, `usermod -aG`), `chmod 744`, y cron (`30 22 1 cp -r ...`).

---

## 9. Cómo verificar o ampliar este catálogo

Comandos de verificación (PowerShell):

```powershell
# Conteo por archivo
Get-ChildItem src\data\challenges.ts,src\data\parcial1.ts,src\data\parcial2.ts,src\data\parcial3.ts,src\data\final.ts |
  ForEach-Object { $c = (Select-String -Path $_.FullName -Pattern "id: '").Count; "$($_.Name): $c" }

# Total
(Select-String -Path src\data\*.ts -Pattern "id: '").Count
```

Para agregar un ejercicio nuevo, seguí la receta de `13-GUIA-DESARROLLADOR.md` (formato `Challenge`, categoría con prefijo de grupo, validadores `fileExists`/`fileContains`/`fileMode`/`cwdIs`, etc.).
