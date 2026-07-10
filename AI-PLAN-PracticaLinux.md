# Plan de Integración IA — Práctica Linux (Zero-Cost)

## Principio

100% gratis, sin APIs externas. Lógica local, matching inteligente, templates.
Cero dependencias externas de AI.

---

## Fase 0 — Bugs Críticos (COMPLETADA ✅)

### initialState ahora se aplica al seleccionar un ejercicio
- `challengeSlice.ts::28`: `setCurrentChallenge` ejecuta `challenge.initialState(get())`
- Cada vez que se clickea un ejercicio, el entorno se resetea al estado inicial esperado
- Soluciona: cwd incorrecto, rutas relativas rotas en validadores

### Validación silenciosa para comandos no relacionados
- `validation.ts::16`: si el comando no matchea el regex esperado **pero** `exitCode === 0`, retorna `'ignore'`
- `validation.ts::90-92`: `'ignore'` se traduce a `ValidationResult { passed: false, ignored: true }`
- `TerminalInput.tsx::206-210`: si `validation.ignored`, no registra intento fallido ni muestra error
- El usuario puede navegar libremente (`cd`, `ls`, `pwd`) sin falsos positivos

### Auto-validación al salir de modo captura (Ctrl+D)
- `TerminalInput.tsx::247-268`: después de `createFile` en Ctrl+D, ejecuta `validateCommand('cat > target', 0)`
- Si pasa → marca ejercicio como completado automáticamente

---

## Fase 1 — Validación Semántica Mejorada

### Estrategia
Reemplazar `simulateCommand` del plan original (inviable) por integración con `validateState` existente.

### Implementaciones
1. **Equivalencias de comandos**: tabla de sinónimos (`ls -la` = `ls -al` = `ls -l -a`)
2. **Fuzzy matching Levenshtein**: para flags y rutas typos
3. **Plantillas de feedback**: mensajes contextuales por tipo de error (~30 templates)
4. **Integración con `validateState`**: si el estado final del VFS es correcto, el comando es válido aunque no sea el esperado

```typescript
// enhancement: SemanticValidator.ts — ~3KB
const commandEquivalents: Record<string, string[]> = {
  'ls': ['ls', 'list', 'dir'],
  'ls -la': ['ls -la', 'ls -al', 'ls -l -a', 'list -la', 'dir /a'],
  'chmod 755': ['chmod 755', 'chmod u=rwx,g=rx,o=rx', 'chmod u+rwx,g+rx,o+rx'],
  'grep': ['grep', 'search', 'findstr'],
  'cat': ['cat', 'type', 'more'],
}

function validateSemantically(cmd: string, expected: string): ValidationResult {
  const normalized = normalizeCommand(cmd)
  if (isEquivalent(normalized, expected)) return { passed: true }
  
  const cmdParts = parseCommand(normalized)
  const expectedParts = parseCommand(expected)
  const similarity = compareParts(cmdParts, expectedParts)
  
  if (similarity > 0.8) return { passed: true }
  return {
    passed: false,
    reason: feedbackTemplates.bestMatch(cmd, findClosest(normalized, commandEquivalents)),
  }
}
```

### Archivos afectados
- `src/engine/validation.ts` — nuevo pipeline semántico antes del regex match
- `src/engine/semantic-validator.ts` — nuevo módulo

### Costo de tokens
**Cero**. Matching local.

---

## Fase 2 — Generación Dinámica de Ejercicios (Templates + Parámetros)

### Estrategia
Sin LLM. Usar **plantillas de ejercicios con parámetros variables**.
Cada template genera un `Challenge` completo con todos los campos obligatorios:
`id`, `category`, `instruction`, `solutionHint`, `initialState`, `validationType`,
`expectedCommandRegex`, `validateState`, `commands`, `difficulty`, `hint`.

```typescript
// enhancement: ExerciseGenerator.ts — ~3KB
interface ExerciseTemplate {
  idPrefix: string
  category: string
  generate: (params: Record<string, any>) => Omit<Challenge, 'id'>
}

const exerciseTemplates: Record<string, ExerciseTemplate> = {
  'permisos': {
    idPrefix: 'gen-perm',
    category: 'Permisos',
    generate: (p) => ({
      instruction: `Tenés un ${p.fileType} en /compartido/ que debe ser...`,
      solutionHint: `chmod ${p.permissions} /compartido/${p.fileType}`,
      initialState: (s) => s.setCwd('/home/usuario'),
      validationType: 'command',
      expectedCommandRegex: new RegExp(`chmod\\s+${p.permissions}\\s+/compartido/`),
      commands: ['chmod'],
      difficulty: p.permissions > 700 ? 'medio' : 'fácil',
      hint: 'Primer dígito = dueño, segundo = grupo, tercero = otros',
    }),
  },
  // ~20 templates → combinaciones paramétricas ilimitadas
}
```

### Archivos afectados
- `src/data/exercise-generator.ts` — nuevo módulo
- `src/store/slices/challengeSlice.ts` — integrar generación con `importChallenges`

### Costo de tokens
**Cero**.

---

## Fase 3 — Comando `?explica` (alias de `man`)

### Estrategia
Ya existe `man` en `src/engine/commands/man.ts`. `?explica` se agrega como alias
que redirige al mismo sistema de documentación.

### Archivos afectados
- `src/engine/commands/man.ts` — agregar `'?explica'` como comando válido (o alias)
- `src/engine/executor.ts` — registrar el alias

### Costo de tokens
**Cero**.

---

## Fase 4 — Pista Inteligente Contextual (Máquina de Estados)

### Estrategia
Sistema de hints progresivos basado en contador de intentos (`challengeResults[id].attempts`),
mapeado a las **categorías reales del sistema** (`'PARCIAL 1 - FileSystem'`, etc.).

```typescript
// enhancement: HintSystem.ts — ~2KB
function getHint(challenge: Challenge, attempts: number): string {
  const categoryHints: Record<string, string[]> = {
    'PARCIAL 1 - FileSystem': [
      'Pensá en qué comando crea archivos o directorios.',
      'Usá touch, mkdir, cat o cp según lo que pida el enunciado.',
      'Recordá que podés usar rutas relativas (..) o absolutas.',
    ],
    'PARCIAL 2 - Shell Scripting': [
      'Pensá en la estructura de un script: shebang, variables, condicionales.',
      'Usá chmod +x para hacer el script ejecutable.',
      'No olvides la extensión .sh aunque no es obligatoria.',
    ],
  }

  const hints = categoryHints[challenge.category]
  if (!hints) return challenge.hint || 'Usá "help" para ver los comandos disponibles.'

  const index = Math.min(attempts, hints.length - 1)
  return hints[index]
}
```

### Archivos afectados
- `src/engine/hint-system.ts` — nuevo módulo
- `src/components/ChallengeBanner.tsx` — usar `getHint` con contador de intentos

### Costo de tokens
**Cero**.

---

## Fase 5 — Modo Libre (Selector de Temas + Sesión Guiada)

### Estrategia
El usuario elige un tema y el sistema arma una secuencia didáctica basada en
**IDs de ejercicios reales** del sistema, no nombres genéricos.

```typescript
// enhancement: LearningPaths.ts — ~2KB
const learningPaths: Record<string, { title: string; prerequisites: string[]; sequence: string[] }> = {
  'navegacion': {
    title: 'Navegación y directorios',
    prerequisites: [],
    sequence: ['p1-01', 'p1-05', 'p1-13', 'pipe-01', 'pipe-02'],
    estimatedTime: '10min',
  },
  'filesystem': {
    title: 'Gestión de archivos',
    prerequisites: ['navegacion'],
    sequence: ['p1-02', 'p1-03', 'p1-04', 'p1-06', 'p1-09', 'p1-11', 'p1-12', 'p1-15'],
    estimatedTime: '20min',
  },
  'permisos': {
    title: 'Permisos y usuarios',
    prerequisites: ['navegacion'],
    sequence: ['p1-56', 'p1-58', 'p1-59', 'p1-67', 'p1-85', 'p1-86'],
    estimatedTime: '15min',
  },
}
```

### Archivos afectados
- `src/data/learning-paths.ts` — nuevo módulo
- `src/components/LeftPanel.tsx` — nueva sección "Modo Libre" con selector de temas
- `src/components/ChallengeCard.tsx` — resaltar siguiente ejercicio del path

### Costo de tokens
**Cero**.

---

## Resumen de Costos

| Fase | Feature | Costo | Implementación |
|------|---------|-------|----------------|
| 0 | Bugs críticos (initialState, silent validation, capture) | $0 | COMPLETADA |
| 1 | Validación semántica (equivalencias + fuzzy + feedback) | $0 | ~3 días |
| 2 | Generación dinámica de ejercicios | $0 | ~3-4 días |
| 3 | `?explica` como alias de `man` | $0 | ~1 día |
| 4 | Pistas progresivas por categoría | $0 | ~1-2 días |
| 5 | Modo libre / learning paths | $0 | ~2-3 días |

**Costo total por usuario**: $0
**Dependencias externas**: 0
**Total estimado**: ~10-13 días hábiles

---

## Roadmap Ajustado

| Fase | Descripción | Estado |
|------|-------------|--------|
| 0 | Arreglar bugs actuales | ✅ COMPLETADA |
| 1 | Validación semántica mejorada | ⏳ Pendiente |
| 2 | Templates paramétricos de ejercicios | ⏳ Pendiente |
| 3 | Comando `?explica` (alias de `man`) | ⏳ Pendiente |
| 4 | Máquina de estados para pistas | ⏳ Pendiente |
| 5 | Learning paths + modo libre | ⏳ Pendiente |
