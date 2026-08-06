# 12 — Herramientas del proyecto

> Herramientas auxiliares usadas para consultar el código, manipular archivos y mantener la calidad en Windows.
> Verificado el 2026-08-06.

---

## 1. graphify — grafo del codebase

graphify construye un grafo de conocimiento del proyecto (nodos = archivos/símbolos, aristas = dependencias). El resultado vive en `graphify-out/` (ignorado por git).

| Archivo | Contenido |
|---|---|
| `graphify-out/graph.json` | Grafo completo (286 nodos, 371 aristas, 52 comunidades aprox.) |
| `graphify-out/graph.html` | Visualización interactiva (abrir en navegador) |
| `graphify-out/GRAPH_REPORT.md` | Resumen generado |
| `graphify-out/cache/` | Caché del AST extract |

### Consultar el grafo

```bash
graphify query "dónde se define validateState"
graphify query "qué archivos importan de engine/validation"
```

- Binario: `C:\Users\nacho\.local\bin\graphify.exe`
- Python (vía uv): `C:\Users\nacho\AppData\Roaming\uv\tools\graphifyy\Scripts\python.exe`

### Reconstruir tras cambios grandes

Los scripts de build viven dentro de `graphify-out/` y se borran al limpiar. Para regenerar el grafo hay que correr **AST extract + build** (ver `GRAPH_REPORT.md` para los comandos exactos).

> Convención del proyecto: ante preguntas del codebase ("¿dónde está X?", "¿qué llama a Y?") usar `graphify query` antes de explorar a mano.

---

## 2. Scripts Python auxiliares

Viven en `graphify-out/` (no versionados). Se usan para conteos exactos y para manipular archivos sin romper el encoding.

### Conteo de ejercicios — `count_exercises.py`

```bash
python graphify-out/count_exercises.py
```

Imprime, por cada archivo de data (`challenges`, `parcial1..3`, `final`): cantidad de ejercicios, categorías, validationTypes y dificultades, más totales. Fuente de las cifras de `06-EJERCICIOS.md`.

### Conteo de comandos por archivo — `extract_cmds.py`

```bash
python graphify-out/extract_cmds.py
```

Lista categorías y comandos usados en `commands:` de cada archivo de data.

### Diagnóstico de line endings — `check_eol.py` / `check_p3.py`

```bash
python graphify-out/check_eol.py
python graphify-out/check_p3.py
```

Verifican CR/LF/CRLF, bytes especiales (VT, FF) y la presencia de IDs concretos en `parcial3.ts`. Se usan después de scripts que reescriben `.ts` para detectar corrupción `\r\r\n`.

---

## 3. Quirks de Windows / PowerShell

Estas reglas son obligatorias al manipular archivos del repo desde Windows:

### 3.1 Out-File agrega BOM

`Out-File` de PowerShell escribe UTF-8 con BOM, que rompe `json.loads` y a veces la detección de encoding. **Regla**: usar `utf-8-sig` en Python o `Set-Content -Encoding utf8NoBOM`, o escribir desde scripts `.py`.

### 3.2 Corrupción `\r\r\n` al reescribir `.ts`

Si un script Python lee un `.ts` con `newline=''` y hace `split('\n')`, los CR sueltos quedan pegados a las líneas y se duplican al unir con `\r\n`:

```
antes:  \r\n (CRLF limpio)
después de split+join: \r\r\n  ← corrupto
```

**Verificación post-escritura**:

```bash
python -c "d=open('src/data/archivo.ts','rb').read(); print(d.count(b'\r\r\n'))"
```

**Normalización**:

```python
d = d.replace(b'\r\r\n', b'\r\n')
```

Esto ya causó corrupción dos veces en `parcial3.ts`/`final.ts`; siempre normalizar antes de commitear.

### 3.3 PowerShell: sin `&&` encadenado

PowerShell 5.1 no soporta `&&`. Encadenar con `;` o `if ($?) { ... }`.

---

## 4. Caveman — skills de comunicación comprimida

Skill instalada a nivel global (plugins, comandos `/caveman*`, agents `cavecrew-*`) y por proyecto.

- **Comandos**: `/caveman` (modo), `/caveman-help`, `/caveman-commit`, `/caveman-review`, `/caveman-compress`, `/caveman-stats`.
- **Regla always-on** en `AGENTS.md`: respuestas en estilo caveman (nivel `full` por defecto); apagado con "stop caveman".
- **Código, commits y PRs siempre en formato normal** (el caveman es solo para la conversación).
- Instalación: `npx -y github:JuliusBrussee/caveman -- --only opencode --with-init`. Nota: el instalador falla en paths con espacios; completar el paso per-repo manualmente.

Archivos generados (ignorados por git): `.cursor/`, `.windsurf/`, `.clinerules/`, `.github/copilot-instructions.md`.

---

## 5. Herramientas de calidad (verificación obligatoria)

| Herramienta | Comando | Cuándo |
|---|---|---|
| Tests | `npx vitest run` | 358 tests en 17 archivos |
| Typecheck | `npx tsc --noEmit` | equivalencia de `tsc -b` del build |
| Build | `npm run build` | `tsc -b && vite build` |
| Lint | `npm run lint` (eslint) | local, no entra en el pipeline de Vercel |

**Regla**: tras cada tarea correr los tres primeros. Detalle en `10-TESTING.md`.

---

## Referencias

- `graphify-out/` (ignorado) · `.gitignore`
- `PLAN-DOCUMENTACION.md` (local, ignorado)
- Commands de verificación: sección 6 de `PLAN-DOCUMENTACION.md`
