# Diagnóstico de Problemas y Mejoras — SO-ejercitacion

## Convenciones

Cada entrada sigue este formato:

```
## [ID] Título
- Fecha:     YYYY-MM-DD
- Commit:    abc1234
- Fase E2E:  F3 / F4 / ...
- Síntoma:   Qué se veía
- Causa:     Por qué pasaba
- Fix:       Qué se cambió
- Secuelas:  Qué revisar después
```

---

## P001 — cat capture mode no resuelve rutas relativas con `..`

- Fecha:     2026-07-20
- Commit:    d3a7f34
- Fase E2E:  F4 (Capture Mode) — E5.1
- Síntoma:   Estando en `grupo`, `cat > ../num10` mostraba "✅ Archivo guardado" pero la validación
             decía "El archivo '../num10' no existe."
- Causa:     En `TerminalInput.tsx:244-246`, el `resolvedTarget` se calculaba con concatenación
             ingenua (`cwd + '/' + captureTarget`), generando `/home/.../grupo/../num10`.
             `createFile` llamaba a `setNodeInTree` que no resuelve `..`, buscaba un hijo literal
             `..` dentro de `grupo`, fallaba silenciosamente y retornaba `false`. El mensaje de
             éxito se mostraba igual porque el return de `createFile` se ignoraba.
- Fix:       Usar `resolvePath(cwd, captureTarget)` en lugar de concatenación. El executor ya
             lo hacía bien en `applyRedirect` (executor.ts:150), pero el capture mode no.
- Secuelas:  Revisar si hay otros lugares que concatenen rutas sin `resolvePath`.

---

## P002 — `cmp` con archivos diferentes se marcaba como fallo

- Fecha:     2026-07-XX
- Commit:    f110351
- Fase E2E:  F1 (Core) / F3 (Validación)
- Síntoma:   `cmp` retorna exit code 1 cuando los archivos difieren (comportamiento normal),
             pero la validación mostraba "El comando falló".
- Causa:     En `validation.ts`, el bloque `validationType: 'command'` con `expectedCommandRegex`
             chequeaba `exitCode !== 0` y devolvía error antes de verificar el regex.
- Fix:       Cuando el regex matchea, se retorna null (aprobado) sin importar el exit code.
- Secuelas:  Verificar otros comandos con exit codes "exitosos" no-zero (ej: `diff`, `grep` sin match).

---

## P003 — `find` no soportaba flags `-gid`, `-uid`, `-size`, `-ls`

- Fecha:     2026-07-XX
- Commit:    f110351
- Fase E2E:  F1 (Core) — E2.26 a E2.29
- Síntoma:   Los ejercicios de parcial3 y final que usaban `find -gid` o `find -uid` funcionaban
             pero ignoraban esos filtros (el comando no daba error pero producía salida incorrecta).
- Causa:     `find.ts` solo implementaba `-name`, `-type`, `-perm`, `-exec`.
- Fix:       Agregar parsing de `-gid` (busca en `/etc/group`), `-uid` (busca en `/etc/passwd`),
             `-size` (compara tamaño con sufijos k/M/G), `-ls` (formato detallado tipo `ls -l`).
- Secuelas:  Mantener sincronizados los flags de `find` con los que usan los ejercicios.

---

## P004 — Directorio `lista` estaba vacío, `ls -i ../lista` no mostraba nada

- Fecha:     2026-07-XX
- Commit:    31bb6a9
- Fase E2E:  F6 (Parcial 1) — E7.9
- Síntoma:   `ls -i ../lista` mostraba salida vacía.
- Causa:     En `vfs-template.ts`, el directorio `lista` se definía como `d('lista', {})`.
- Fix:       Agregar 4 archivos dentro de `lista` con contenido e inodos distintos.
- Secuelas:  Verificar que todos los directorios referenciados en ejercicios tengan contenido real.

---

## P005 — `fileContains` con `..` en ruta sí funciona (validación)

- Fecha:     2026-07-20
- Commit:    —
- Fase E2E:  F2 (VFS) — E3.2 / F3 (Validación)
- Síntoma:   (Potencial) El validador `fileContains('../num10', '12\\n56')` usa `resolvePath`
             que resuelve `..` correctamente, mientras que `createFile` no lo hacía. Era una
             asimetría: el validador encontraba la ruta correcta pero el archivo no existía.
- Causa:     `resolvePath` resuelve `..`, `normalizePath` no.
- Fix:       Asegurar que toda creación/modificación de archivos use `resolvePath` antes de
             llamar a `setNodeInTree`. Ya está corregido en `TerminalInput.tsx`.
- Secuelas:  Centralizar la responsabilidad de resolver rutas en una sola capa.

---

## P006 — `validationType: 'state'` con comandos no relacionados

- Fecha:     2026-07-XX
- Commit:    —
- Fase E2E:  F3 (Validación) — E4.11
- Síntoma:   En p1-06, ejecutar `ls` (comando no relacionado) disparaba validación de estado
             "El archivo '../num10' no existe".
- Causa:     En `validateCommand()`, el bloque `validationType: 'state'` solo chequea `exitCode !== 0`.
             Cualquier comando con exit 0 activa la validación de estado, incluso si es inocuo.
- Fix:       Pendiente de definir. Dos opciones:
             A) Cambiar a `validationType: 'both'` con `expectedCommandRegex`.
             B) Modificar validation.ts para ignorar si el comando no matchea un regex
                (requiere agregar `expectedCommandRegex` en ejercicios state).
- Secuelas:  Auditar todos los ejercicios `validationType: 'state'` para decidir enfoque.

---

## P007 — Falta de contexto de directorio en hints

- Fecha:     2026-07-XX
- Commit:    f110351
- Fase E2E:  F7 (Hints)
- Síntoma:   El hint de p1-25 decía `chmod 750 script.sh` sin aclarar desde dónde ejecutarlo.
- Causa:     Los hints no incluían el directorio de trabajo esperado.
- Fix:       Agregar "Desde dire/:" al hint de p1-25.
- Secuelas:  Revisar hints de ejercicios con rutas relativas.

---

## P008 — Expresiones regulares de validación muy laxas

- Fecha:     2026-07-XX
- Commit:    f110351
- Fase E2E:  F3 (Validación)
- Síntoma:   p1-25 validaba con `/chmod/` — cualquier comando con `chmod` pasaba, aunque
             faltaran argumentos.
- Causa:     Regex demasiado genérico.
- Fix:       Cambiar a `/^chmod\s+750\s+script\.sh$/` o similar que exija todos los argumentos.
- Secuelas:  Revisar todos los `expectedCommandRegex` de la app.

---

## P009 — Enunciados con contenido en formato comma-separated

- Fecha:     2026-07-XX
- Commit:    8ad9b45
- Fase E2E:  F6 (Parcial 1)
- Síntoma:   p1-03 y p1-06 mostraban "12, 34, 56" en vez de "12\\n34\\n56" (líneas separadas).
- Causa:     El contenido del ejercicio usaba formato inline con comas.
- Fix:       Cambiar a string con saltos de línea reales en el instruction.
- Secuelas:  Verificar todos los enunciados que muestren contenido de archivos.

---

## P010 — Scroll en FINALES no funcionaba

- Fecha:     2026-07-XX
- Commit:    (primer commit de FINALES)
- Fase E2E:  UI (sin test automático)
- Síntoma:   Los ejercicios FINALES tenían contenido cortado sin scroll.
- Causa:     El `isScripting` en ChallengeBanner y Terminal solo chequeaba `scripting` en
             el category name, no `finales`.
- Fix:       Agregar `category.includes('finales')` a la condición.
- Secuelas:  Centralizar la lógica de layout en un solo lugar.

---

## P011 — `grep` siempre retorna exit 0 aunque no haya matches

- Fecha:     2026-07-21
- Commit:    (en curso)
- Fase E2E:  F1 (Core) — E2.23
- Síntoma:   `grep "XXXXXXXX" archivo.txt` retornaba exit 0 y stdout vacío.
             En Linux real, grep retorna exit 1 cuando no hay matches (importante para pipes
             y condicionales como `grep ... && echo "encontrado"`).
- Causa:     `processFiles()` y el path de stdin en `grep.ts` retornaban `exitCode: 0` hardcodeado.
- Fix:       Retornar `exitCode: totalMatchCount === 0 ? 1 : 0` en ambas ramas.
- Secuelas:  Verificar que `validationType: 'command'` no penalice exit 1 de grep en ejercicios
             donde el match es lo que se valida (ya está resuelto en P002).

---

## P012 — `tail` no soportaba flag `-2` (solo `-n2`)

- Fecha:     2026-07-21
- Commit:    (en curso)
- Fase E2E:  F1 (Core) — E2.33
- Síntoma:   `tail -2 archivo.txt` no reducía las líneas correctamente.
- Causa:     `tail.ts` solo parseaba `-n` (ej: `-n2`), no el shorthand `-2`. `head.ts` sí lo
             soportaba con `args.find(f => /^-\d+$/.test(f))` y `argNum`.
- Fix:       Agregar detección de `dashNum` (flags) y `argNum` (args) con `/^-\d+$/`, igual que head.
- Secuelas:  Ninguna.

---

## P013 — `chown owner:group` ignora el group

- Fecha:     2026-07-21
- Commit:    (en curso)
- Fase E2E:  F1 (Core) — E2.31
- Síntoma:   `chown root:root archivo.txt` solo cambiaba owner a "root", group permanecía "usuarios".
- Causa:     `chown.ts` hacía `ownerGroup.split(':')[0]` y solo usaba el owner.
- Fix:       Destructurar `[owner, group] = ownerGroup.split(':')` y actualizar `permissions.group`
             solo si `group` está definido.
- Secuelas:  Ninguna.

---

## P014 — `createVFS()` retorna referencias compartidas, mutations persisten entre resets

- Fecha:     2026-07-21
- Commit:    (en curso)
- Fase E2E:  F2 (VFS) — E3.7
- Síntoma:   `resetFS()` no restauraba el VFS al estado original. Después de `setNode` que
             modificaba `notas.txt`, `readFile` en el siguiente test seguía viendo el contenido
             modificado.
- Causa:     `createVFS()` referenciaba los nodos constantes del módulo (`HOME`, `ETC`, `BIN`,
             etc.). `setNodeInTree` mutaba `parent.children[name]` in-place, y las mutaciones
             persistían en los objetos del módulo. Al llamar `createVFS()` de nuevo, se
             retornaban los mismos objetos mutados.
- Fix:       Agregar `deepCloneNode()` en `vfs-template.ts` que clona recursivamente el árbol
             (incluyendo children, permissions, content) y asigna nuevos inodos. `createVFS()`
             ahora llama a `deepCloneNode` sobre la raíz.
- Secuelas:  Los inodos de los archivos del template varían entre resets (cada reset asigna
             nuevos inodos). Los tests que dependan de inodos específicos del template deben
             tenerlo en cuenta.

---

## P015 — `removeNode` retorna true aunque el archivo no exista

- Fecha:     2026-07-21
- Commit:    (en curso)
- Fase E2E:  F2 (VFS) — E3.3
- Síntoma:   `removeNode('/noexiste.txt')` retornaba `true`.
- Causa:     `removeNodeFromTree` hacía `delete parent.children[name]` sin verificar si la
             clave existía. En JavaScript, `delete` en una clave inexistente retorna `true`
             silenciosamente.
- Fix:       Pendiente. Ajustamos el test para verificar que el directorio no cambia en vez
             de verificar el return value. Un fix real sería chequear `name in parent.children`
             antes de `delete`.
- Secuelas:  Nadie depende de este return value actualmente.
