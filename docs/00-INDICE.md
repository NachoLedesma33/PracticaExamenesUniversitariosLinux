# Índice de Documentación — SO-ejercitacion

> Mapa de navegación de toda la documentación oficial del proyecto.
> Última actualización: 2026-07-31

---

## Cifras clave (verificadas)

| Métrica | Valor |
|---|---|
| Ejercicios | **330** (base 54 · parcial1 93 · parcial2 100 · parcial3 67 · final 16) |
| Comandos simulados | **74** |
| Archivos VFS | 28 directorios + 111 archivos |
| Tests | **358** en 17 archivos |
| Slices de Zustand | 5 |
| Learning paths | 15 |
| Líneas de código `src/` | ~16.240 |
| Commits en `main` | 63 |

---

## Mapa de documentos

| Doc | Título | Contenido | Público | Estado |
|---|---|---|---|---|
| `00-INDICE.md` | Índice | Este documento | Todos | ✅ |
| `01-ARQUITECTURA.md` | Arquitectura | Visión general, flujo de datos, módulos de `src/` | Desarrolladores | ⏳ |
| `02-MOTOR-TERMINAL.md` | Motor de terminal | Parser, executor, capture mode, tab completion, historial | Desarrolladores | ⏳ |
| `03-VALIDACION.md` | Validación de ejercicios | 4 modos, hint system, validación semántica y AI | Desarrolladores | ⏳ |
| `04-VFS.md` | Sistema de archivos virtual | Modelo de nodo, árbol inicial, operaciones, simulatedOutput | Desarrolladores | ⏳ |
| `05-COMANDOS.md` | Catálogo de comandos | Los 74 comandos con firma, flags y ejemplos | Desarrolladores y estudiantes | ⏳ |
| `06-EJERCICIOS.md` | Catálogo de ejercicios | 330 ejercicios por archivo/categoría, tipos de validación | Estudiantes | ⏳ |
| `07-GENERADOR-EJERCICIOS.md` | Generador y learning paths | exercise-generator, learning-paths, ModoLibre | Desarrolladores | ⏳ |
| `08-UI.md` | Interfaz de usuario | Componentes, layout 3 paneles, sistema de temas | Desarrolladores | ⏳ |
| `09-ESTADO.md` | Estado global | Zustand, 5 slices, persistencia | Desarrolladores | ⏳ |
| `10-TESTING.md` | Estrategia de tests | Cómo correrlos, mapa de archivos de test, fases | Desarrolladores | ⏳ |
| `11-DEPLOY.md` | Deploy | Vercel, build, pipeline | Desarrolladores | ⏳ |
| `12-HERRAMIENTAS.md` | Herramientas | graphify, scripts Python, quirks Windows/PowerShell | Desarrolladores | ⏳ |
| `13-GUIA-DESARROLLADOR.md` | Guía del desarrollador | Recetas para agregar comando/ejercicio/test/VFS | Desarrolladores | ⏳ |
| `14-CHANGELOG.md` | Historial de cambios | Historia del proyecto desde git log | Todos | ⏳ |

Leyenda de estado: ✅ listo · ⏳ pendiente

---

## Lectura recomendada por rol

- **Desarrollador nuevo**: `00` → `01` → `02` → `03` → `04` → `13` → `10` → `11`
- **Estudiante / usuario**: `00` → `06` → `05` → `14`
- **Autor / mantenedor**: `12` → `09` → `14`

---

## Reglas de la documentación

- **Idioma**: español (los identificadores/código en inglés).
- **Exactitud**: toda cifra sale de un comando de verificación, nunca de memoria.
- **Commit**: docs en commits separados tipo `docs: <área>`; los `.md` de diagnóstico local (ERRORES-BUGS.md, E2E-DIAGNOSTICO.md, etc.) quedan fuera del repo.
- **Verificación**: `npx vitest run` + `npx tsc --noEmit` + `npm run build` después de cada cambio.
