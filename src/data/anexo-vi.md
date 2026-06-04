# ANEXO - Editor vi

## ¿Cómo iniciar vi?

vi facilita 20 líneas en pantalla para realizar la edición. vi es un editor que, en un momento dado, se encuentra en uno de dos modos básicos de operación: modo de comandos y modo de edición.

El modo por defecto es el modo de comandos. En este modo no se puede realizar la edición del texto. vi espera al comando apropiado antes de realizar una operación. En general, vi volverá al modo de comandos después de ejecutar un comando.

La ventaja de este modo de trabajar es que se pueden ejecutar comandos desde ficheros, y los documentos pueden ser formateados o reestructurados simplemente ejecutando comandos de vi.

Si al presionar ESC el terminal emite un pitido quiere decir que estamos en modo de comandos.

### Iniciando vi

Para comenzar a usar vi, teclear:
```
vi nuevo_fichero
```
Este comando inicia el editor y, como el fichero no existe todavía, lo crea para ser editado. El editor está ahora en modo de comandos esperando por un comando.

```
vi +5 nombre_fichero    # Comienza la edición en la línea 5
vi + nombre_fichero     # Comienza la edición en la última línea
```

## Moviendo el cursor

Las siguientes teclas controlan el movimiento del cursor:

- `k` — arriba
- `j` — abajo
- `h` — izquierda
- `l` — derecha

Cuando se carga vi con un nuevo fichero, el cursor está en la esquina superior izquierda de la pantalla, y no puede ser movido con las teclas de cursor.

## Modo de entrada de texto (añadir, insertar)

- `a` — añade texto a partir del carácter en que está situado el cursor
- `A` — añade texto al final de la línea actual
- `i` — inserta texto a partir de la posición del cursor
- `I` — inserta texto al principio de la línea actual
- `o` — inserta una línea debajo de la posición del cursor
- `O` — inserta una línea encima de la posición del cursor
- `:r fich` — permite insertar el fichero `fich` tras la línea actual

## Borrando y cambiando texto

- `x` — borra el carácter en el cursor
- `nx` — borra n caracteres hacia la derecha, incluido el que está sobre el cursor
- `nX` — borra n caracteres hacia la izquierda
- `r` — sustituye el carácter en el cursor
- `dd` — borra la línea en la que está el cursor
- `ndd` — borra n líneas hacia abajo incluyendo la que contiene el cursor

Estos tres comandos son ejecutados en el modo de comandos, y vuelven al modo de comandos después de ejecutarse.

## Deshaciendo cambios

- `u` — deshace el comando previo
- `U` — deshace todos los cambios realizados en la línea actual

## Guardando cambios y permaneciendo en vi

```
:w                      # Guarda los cambios en el fichero actual
:w nuevo_fichero2       # Guarda los cambios como un fichero nuevo
```

## Abandonando vi

- `ZZ` — Guarda los cambios en el fichero original, y vuelve al intérprete de comandos
- `:wq` — Igual que ZZ
- `:q!` — Abandona el editor, no guarda los cambios, y vuelve al intérprete de comandos

## Comandos adicionales para posicionamiento del cursor

- `b` — mueve el cursor al comienzo de la palabra anterior
- `e` — mueve el cursor al final de la palabra siguiente
- `0` — mueve el cursor al comienzo de la línea (cero)
- `$` — mueve el cursor al final de la línea

## Scroll de pantalla

- `ctrl+d` — una pantalla abajo (12 líneas)
- `ctrl+u` — una pantalla arriba (12 líneas)

Para ficheros muy largos, se puede ir a una línea del texto:

- `3000G` — va a la línea número 3000
- `G` — posiciona el cursor en la última línea del fichero
- `1G` — posiciona el cursor al comienzo del fichero
- `ctrl+g` — muestra el número de línea actual

## Búsqueda

- `/cadena` — busca hacia adelante la cadena especificada. El cursor se posiciona en la primera ocurrencia.
- `n` — busca hacia adelante la siguiente ocurrencia
- `?cadena` — busca hacia atrás

## Borrar texto (avanzado)

- `dw` — borra la palabra actual (comienza con `d`, seguido del ámbito: `d` para línea, `w` para palabra)

## Quitar y poner (cortar y pegar)

Cuando se borra algo, es almacenado en un buffer temporal. El contenido de este buffer puede ser accedido y pegado en cualquier sitio del texto.

- `p` — recupera el último texto borrado
- `nyw` — guarda en la memoria intermedia n palabras desde la posición del cursor
- `y$` — guarda desde la posición del cursor hasta el final de la línea
- `yy` — guarda la línea entera en la que se encuentra el cursor
- `yn` — guarda n+1 líneas desde la línea actual
