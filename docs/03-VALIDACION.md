# 03 — Validación de ejercicios

> Cómo se decide si una respuesta es correcta: 4 modos de validación, fallback semántico, pistas por categoría y validación asistida por IA.
> Público: desarrolladores. Fuente: `src/engine/validation.ts`, `src/engine/semantic-validator.ts`, `src/engine/semantic-text.ts`, `src/engine/hint-system.ts`, `src/engine/ai-validator.ts`, `src/types/challenge.ts`.

---

## 1. Los 4 modos de validación

Cada ejercicio (`Challenge`) declara un `validationType` que decide qué se comprueba:

| Tipo | Qué valida | Cuándo se usa |
|---|---|---|
| `command` | La línea escrita contra `expectedCommandRegex` o, si no hay regex, por comparación semántica/salida | Ejercicios de ejecución de comandos |
| `state` | Solo el estado final del VFS (`validateState`) | Ejercicios tipo "crear archivo / cambiar permisos" |
| `both` | Comando **y** estado: exige que la línea matchee (o sea semánticamente válida) y además que el VFS quede en el estado esperado | Ejercicios mixtos |
| `text` | Respuesta textual (teórica) sin ejecutar nada en el VFS | Preguntas conceptuales |

```ts
interface Challenge {
  validationType: 'command' | 'state' | 'both' | 'text';
  expectedCommandRegex?: RegExp;
  validateState?: (store: any) => string | null;  // null = OK, string = motivo de error
  commands: string[];        // comandos permitidos (modo state)
  solutionHint: string;      // respuesta/ejecución modelo
}
```

Resultado siempre con la forma `{ passed, reason?, ignored? }`:

```ts
interface ValidationResult {
  passed: boolean;
  reason?: string;    // mensaje de error mostrado al usuario
  ignored?: boolean;  // true = no se penaliza ni pasa (evita falsos negativos)
}
```

---

## 2. Punto de entrada: `validateCommand`

`src/engine/validation.ts` — `validateCommand(input, exitCode?): Promise<ValidationResult>`.

```
validateCommand(input, exitCode?)
  │
  ├─ Sin ejercicio activo     → { passed:false, "No hay un ejercicio activo." }
  ├─ input vacío              → { passed:false, "No escribiste ningún comando." }
  │
  ├─ validationType === 'text'        → validateByText()      (no ejecuta nada)
  ├─ validationType command|both      → validateByCommand()   (puede devolver 'ignore')
  │
  └─ validationType state|both
        ├─ exitCode ≠ 0               → falla con "El comando falló..."
        ├─ modo state + commands[]    → exige que el primer token esté en commands[]
        └─ validateByState(store)     → corre challenge.validateState(store)
```

Notas:

- En `both`, el comando debe pasar **y** el estado debe quedar correcto.
- `validateByCommand` puede devolver la cadena especial `'ignore'`: significa que la regex no matcheó pero el comando corrió sin error y la validación semántica/AI no encontró equivalencia. `validateCommand` lo convierte en `{ passed:false, ignored:true }` — no es un error, simplemente no penaliza.
- Los ejercicios `text` no tocan el VFS: `validateByText` solo compara strings.

---

## 3. Validación textual: `validateByText`

Para `validationType === 'text'` (respuestas teóricas):

1. **L1 — Regex** (si existe `expectedCommandRegex`): prueba directa contra `input.trim().toLowerCase()`.
2. **L2 — Semántica** (`semantic-text.ts`): `semanticTextMatch(trimmed, solution)`. Si `matched` → OK.
3. **L3 — IA** (si configurada y habilitada): `validateWithAI(..., 'text')`. Si matchea → OK; si hay feedback → `"Casi! {feedback}"`.
4. **Fallback con feedback parcial**: si `semantic.confidence > 0.3` devuelve `"Tu respuesta es parcialmente correcta (X%). {feedback}"`.
5. **Fallback de palabras**: compara palabra a palabra la solución contra la entrada; si coincide ≥ 60% de las palabras → OK.
6. Si nada funciona → `"La respuesta no es correcta. Revisá la solución o pedí una pista."`

---

## 4. Validación de comandos: `validateByCommand`

Para `validationType === 'command'` o `'both'`:

### Con `expectedCommandRegex`

1. `lastIndex = 0` y prueba la regex. Si matchea → OK.
2. Si no matchea **y** `exitCode === 0`, intenta en orden:
   - `validateSemantically(input, challenge)` (ver §6):
     - `matched` → OK.
     - `feedback` → devuelve ese feedback (ej: "Falta la flag -R...").
   - AI (si habilitada) → `validateWithAI(..., 'command')`.
   - Si nada concluye → devuelve `'ignore'`.
3. Si no matchea y `exitCode !== 0` → `"El comando no coincide con el patrón esperado."`

### Sin regex (comparación por salida)

1. Si `normalise(trimmed) === normalise(solution)` → OK.
2. Ejecuta `executeCommand(trimmed)` y `executeCommand(solution)`, compara `(stdout + stderr).trim()`:
   - Si salidas iguales → OK.
   - Si AI habilitada y difieren → consulta IA antes de fallar.
   - Si difieren → `"El comando no produce la salida esperada."`
   - Si el comando del usuario falla (`exitCode !== 0`) → `"El comando falló: {stderr}."`

> La comparación por ejecución real es la más robusta: dos soluciones distintas pero equivalentes (`ls -la` vs `ls -al`) producen la misma salida y pasan sin necesidad de la validación semántica.

---

## 5. Validación de estado: `validateByState` y re-validación

```ts
function validateByState(store, challenge): string | null {
  if (!challenge.validateState) return null;
  return challenge.validateState(store);
}
```

- El `validateState` de cada ejercicio inspecciona el VFS (vía `store`) y devuelve `null` si está correcto o un **string con el motivo** del error.
- En modo `state` con `commands[]` no vacío, se exige que el primer token del comando esté en la lista (`"El comando "X" no está relacionado con este ejercicio. Probá con: ..."`).
- **`revalidateCurrentChallenge()`**: se llama automáticamente al mutar el VFS (por ejemplo con `resetfs`). Solo aplica a ejercicios `state`; re-ejecuta `validateState` y devuelve el estado actual. Esto permite que un ejercicio de estado quede marcado como completado *después* de la última acción que faltaba.

---

## 6. Validación semántica (`src/engine/semantic-validator.ts`)

Fallback para comandos que no matchean la regex pero sí corren: permite aceptar soluciones funcionalmente equivalentes.

### `normalize(cmd)`

- Lowercase, quita comillas y espacios múltiples.
- Separa flags y args:
  - `--largo` → flag largo tal cual.
  - `-abc` (corto, no numérico) → expande a `['-a', '-b', '-c']`.
  - Token numérico (`-1`) → se queda como arg (no es flag).
- Ordena los flags (para que `ls -la` ≡ `ls -al`).

### `resolveEquivalence(cmd)`

Traduce comandos "tipo Windows" a su equivalente Unix:

| Windows | Unix |
|---|---|
| `dir` | `ls` |
| `type`, `more` | `cat` |
| `del(ete)`, `erase` | `rm` |
| `move`, `ren(ame)` | `mv` |
| `copy` | `cp` |
| `cls` | `clear` |
| `findstr` | `grep` |
| `chdir` | `cd` |
| `md` | `mkdir` |
| `rd` | `rmdir` |

### `fuzzyMatch(input, expected)` y `levenshtein`

- `levenshtein(a, b)`: distancia de edición (DP clásica).
- `fuzzyMatch`: `1 - dist / max(len)` sobre los comandos normalizados. Umbral **≥ 0.8** → se considera match.

### `generateFeedback(input, challenge)` — reglas de feedback específico

Si la regex y el fuzzy no alcanzan, se buscan reglas de error típico (solo para dar el mensaje correcto, no para pasar):

| Regla | Detecta | Mensaje |
|---|---|---|
| `chmod-mode` | `chmod 6XX` cuando la solución pide otro modo | "Casi! El permiso X no es el esperado (Y)..." |
| `missing-flag` | chmod/grep/cp/rm/head/tail sin la flag de la solución (`-R`, `-r`, `-i`, `-N`) | "Falta la flag -R (recursivo)..." |
| `wrong-redirect` | Solución usa `>`/`>>` y el input no usa redirección; o usa `>` cuando la solución pide `>>` | "Usaste > (sobrescribir) pero deberías usar >> (concatenar)..." |
| `wrong-operator` | Solución usa `&&`/`\|\|` y el input usa `;` | "Usaste ; pero deberías usar &&..." |

### Orden de resolución en `validateSemantically`

1. Normalizados idénticos → match.
2. Equivalencias aplicadas idénticas → match.
3. `fuzzyMatch ≥ 0.8` → match (con confidence).
4. `generateFeedback` matchea → `{ matched:false, confidence, feedback }`.
5. Sin conclusión → `null` (el llamador decide, típicamente `'ignore'`).

---

## 7. Validación de texto libre (`src/engine/semantic-text.ts`)

Se usa para respuestas teóricas (`text`) y no depende de la ejecución.

### Stopwords y sinónimos

- `STOPWORDS`: artículos/partículas en español (`el`, `la`, `con`, `por`...) que se ignoran al extraer conceptos.
- `SYNONYM_MAP`: ~80 entradas bilingües y con variantes de tildes/ortografía:
  - `archivo ↔ fichero`, `directorio ↔ carpeta ↔ folder`, `enlace duro ↔ hard link`, `inodo ↔ i-nodo ↔ inode`, `ejecución ↔ ejecucion ↔ execute`, `código de salida ↔ exit code`, `tubería ↔ pipe`, `sticky bit ↔ bit pegajoso`, `foreground ↔ primer plano`, etc.
- `getSynonyms(word)`: devuelve un set con la palabra + todos sus sinónimos (en ambas direcciones del mapa).

### Extracción de conceptos (`extractConcepts`)

- Divide la solución en líneas (o en oraciones si es una sola línea).
- La **primera línea** es un "header" con peso 2 y marcado `required` (si el usuario no la menciona, se reporta en "Falta mencionar: ...").
- Las líneas siguientes son conceptos con peso decreciente `max(1, 3 - i * 0.3)`.
- Se limpian puntuación, numeración de listas (`1.` → quita) y palabras ≤ 2 chars.

### Match y umbrales

- `conceptMatchScore(userWords, conceptWords)`: proporción de palabras del concepto que aparecen en el texto del usuario (con sinónimos y matching parcial por `includes`). Un concepto cuenta como cubierto si `score ≥ 0.5`.
- `confidence = matchedWeight / totalWeight`.
- Umbral de aprobación: **confidence ≥ 0.45**.
- Si falta el header y `confidence < 0.7` → feedback `"Falta mencionar: {conceptos}."`
- Fallback sin conceptos: `matched ≥ 60%` de palabras de la solución.

---

## 8. Sistema de pistas (`src/engine/hint-system.ts`)

- `categoryHints`: diccionario categoría → array de pistas progresivas (de general a específica). Cubre las categorías base (`Navegación`, `Listado`, `Archivos`, `Visualización`, `Búsqueda`, `Redirección`, `Permisos`, `Comodines`, `Avanzados`, `Teoría`) y las de parcial (`PARCIAL 1 - Navegación`, `PARCIAL 1 - FileSystem`, `PARCIAL 1 - Filtros`, `PARCIAL 1 - Enlaces`, `PARCIAL 1 - Permisos`, `PARCIAL 1 - Compresión`, `PARCIAL 1 - Teoría`, `PARCIAL 1 - Comandos`).
- `defaultHints`: 3 pistas genéricas (`?explica`, `help`, pensar paso a paso).
- `getHint(challenge, attempts)`: si la categoría tiene pistas usa `Math.min(attempts, hints.length - 1)`, si no, las default. A más intentos fallidos, más específica la pista.

---

## 9. Validación asistida por IA (`src/engine/ai-validator.ts`)

Opcional: se activa con una config en `localStorage['ai-validator-config']`:

```ts
interface AIValidatorConfig {
  provider: 'openai' | 'anthropic';
  apiKey: string;
  model: string;      // openai: gpt-4o-mini (default) · anthropic: claude-3-haiku (default)
  enabled: boolean;
}
```

- **Dos prompts distintos**:
  - `buildSystemPrompt` (tipo `text`): acepta sinónimos, variaciones de formato y "cualquier implementación que cumpla la misma funcionalidad" para scripts.
  - `buildCommandPrompt` (tipo `command`): acepta flags/orden/pipes distintos y comandos equivalentes (`dir` por `ls`).
- **Llamada**: `fetch` directo a `api.openai.com/v1/chat/completions` o `api.anthropic.com/v1/messages` con `temperature: 0.1` y `max_tokens: 300`. La API key **solo se usa en el navegador del usuario** (nunca se envía a un backend propio).
- **Respuesta esperada**: JSON `{ match, confidence, feedback }`. Si no parsea, fallback a regex `/true/i` sobre el texto.
- **Cualquier error se traga** (`catch → null`): la IA nunca bloquea la validación; si falla, el sistema sigue con el fallback normal.
- **Cuándo se invoca**: solo si `enabled && apiKey`. En `text` antes del fallback; en `command` cuando la regex no matchea (exit 0) y cuando las salidas ejecutadas difieren.

---

## 10. Orden de precedencia global

Resumen de qué se intenta primero cuando un ejercicio NO matchea la forma esperada:

| Modo | Orden de intentos |
|---|---|
| `text` | Regex → semántica textual → AI → fallback 60% palabras |
| `command` (con regex) | Regex → semántica (`validateSemantically`) → AI → `ignore` (si exit 0) |
| `command` (sin regex) | Normalizado igual → ejecutar y comparar salida → AI → "no produce la salida esperada" |
| `state` / `both` | Exit code → comando permitido → `validateState` |

---

## 11. Archivos relacionados

| Archivo | Contenido |
|---|---|
| `src/types/challenge.ts` | `Challenge`, `ChallengeResult`, `ValidationResult` |
| `src/engine/validation.ts` | Orquestador de los 4 modos + `revalidateCurrentChallenge` |
| `src/engine/semantic-validator.ts` | Equivalencias, fuzzy match, feedback de errores típicos |
| `src/engine/semantic-text.ts` | Conceptos, sinónimos, umbrales para respuestas teóricas |
| `src/engine/hint-system.ts` | Pistas por categoría |
| `src/engine/ai-validator.ts` | Validación con OpenAI/Anthropic |
