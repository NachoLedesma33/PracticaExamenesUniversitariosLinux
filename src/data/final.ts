import type { Challenge } from '../types';

const HOME = '/home/usuario';

function goHome(s: any) { s.setCwd(HOME); }

const CREAR_EJECUTAR = "Crea el script con: cat > script.sh << 'EOF' ... EOF  |  Luego: chmod +x script.sh  |  Ejecutá con: ./script.sh";

export const EXAMEN_FINAL_CHALLENGES: Challenge[] = [

  {
    id: 'final-01', category: 'FINALES - Backup y Seguridad',
    instruction: `La empresa Studios SA ha sufrido varias pérdidas de datos y robo de información.

Tareas:
1) Diseñe un script con menú que permita: a) hacer Backup de un archivo o directorio en /home/usuario/resguardo, b) ver la bitácora de backups, c) validar una contraseña segura (8+ chars, mayúscula, número, símbolo), d) mostrar los grupos del usuario actual
2) Planificar el Backup con cron los sábados a las 9hs
3) Asignar al usuario "finanzas" una clave que cumpla requisitos de seguridad
4) Crear el grupo "seguridad", agregar a "usuario" y "finanzas", y dar permiso de ejecución del script solo al grupo seguridad

💡 Creá el archivo con: cat > script.sh (luego pegar el código y presionar Ctrl+D)
💡 Ejecutalo con: bash script.sh`,
    hint: `Usá: mkdir -p, cp -r, date, whoami, read -s, grep -q, groups, chmod 750, chgrp. ${CREAR_EJECUTAR}`,
    solutionHint: `#!/bin/bash
pausar() {
  read -p "Presione [Enter] para continuar..."
}
while true; do
  clear
  echo "=== MENÚ DE SEGURIDAD ==="
  echo "a) Backup"
  echo "b) Ver bitácora"
  echo "c) Validar contraseña"
  echo "d) Grupos"
  echo "e) Salir"
  read -p "Opción: " op
  case $op in
    a|A)
      read -p "Archivo/dir: " r
      mkdir -p /home/usuario/resguardo
      cp -r "$r" /home/usuario/resguardo/
      echo "\$(date) Backup de \$r por \$(whoami)" >> /home/usuario/bitacora.txt
      ;;
    b|B)
      cat /home/usuario/bitacora.txt 2>/dev/null || echo "Sin registros"
      ;;
    c|C)
      read -s -p "Pass: " p
      echo
      [ \${#p} -ge 8 ] && echo "OK long" || echo "Faltan chars"
      echo "\$p" | grep -q [A-Z] && echo "OK mayús" || echo "Falta mayús"
      echo "\$p" | grep -q [0-9] && echo "OK num" || echo "Falta num"
      echo "\$p" | grep -q '[@#\$%]' && echo "OK símbolo" || echo "Falta símbolo"
      ;;
    d|D)
      groups
      id
      ;;
    e|E) exit 0 ;;
  esac
  pausar
done
# Cron: 0 9 * * 6 /home/usuario/script.sh
# Grupo: groupadd seguridad
# usermod -aG seguridad usuario
# usermod -aG seguridad finanzas
# chgrp seguridad script.sh
# chmod 750 script.sh`,
    executionCommand: `#!/bin/bash
pausar() {
  echo ""
  read -p "Presione [Enter] para continuar..."
}

while true; do
  clear
  echo "=============================================="
  echo "       MENÚ DE SEGURIDAD - STUDIOS SA         "
  echo "=============================================="
  echo "a. Realizar Backup de archivo/directorio"
  echo "b. Ver bitácora de backups"
  echo "c. Validar seguridad de una contraseña"
  echo "d. Mostrar grupos e información del usuario"
  echo "e. Salir"
  echo "=============================================="
  read -p "Seleccione una opción [a-e]: " opcion

  case "$opcion" in
    a|A)
      echo ""
      read -p "Ruta del archivo o directorio a respaldar: " ruta
      if [ -e "$ruta" ]; then
        mkdir -p /home/usuario/resguardo
        cp -r "$ruta" /home/usuario/resguardo/
        echo "Backup de $ruta realizado por $(whoami) el $(date)" >> /home/usuario/bitacora.txt
        echo "✅ Backup completado exitosamente"
      else
        echo "❌ Error: '$ruta' no existe"
      fi
      pausar
      ;;
    b|B)
      echo ""
      echo "--- BITÁCORA DE BACKUPS ---"
      if [ -f /home/usuario/bitacora.txt ]; then
        cat /home/usuario/bitacora.txt
      else
        echo "No hay registros de backups aún."
      fi
      pausar
      ;;
    c|C)
      echo ""
      echo "--- VALIDADOR DE CONTRASEÑAS ---"
      echo "Requisitos: 8+ caracteres, 1 mayúscula, 1 número, 1 símbolo"
      read -s -p "Ingrese la contraseña a validar: " pass
      echo ""
      ok=true
      [ \${#pass} -ge 8 ] && echo "✅ Longitud: \${#pass} caracteres" || { echo "❌ Longitud: \${#pass} caracteres (mín 8)"; ok=false; }
      echo "$pass" | grep -q [A-Z] && echo "✅ Contiene mayúscula" || { echo "❌ Falta mayúscula"; ok=false; }
      echo "$pass" | grep -q [0-9] && echo "✅ Contiene número" || { echo "❌ Falta número"; ok=false; }
      echo "$pass" | grep -q '[@#\$%^&+=]' && echo "✅ Contiene símbolo" || { echo "❌ Falta símbolo"; ok=false; }
      $ok && echo "✅ CONTRASEÑA SEGURA" || echo "❌ CONTRASEÑA DÉBIL"
      pausar
      ;;
    d|D)
      echo ""
      echo "--- INFORMACIÓN DEL USUARIO ---"
      echo "Usuario: $(whoami)"
      echo "ID: $(id)"
      echo ""
      echo "Grupos:"
      groups
      pausar
      ;;
    e|E)
      echo ""
      echo "Saliendo del menú. Recuerde:"
      echo "  • Programar en cron: 0 9 * * 6 /home/usuario/script.sh"
      echo "  • groupadd seguridad"
      echo "  • usermod -aG seguridad usuario finanzas"
      echo "  • chgrp seguridad script.sh && chmod 750 script.sh"
      exit 0
      ;;
    *)
      echo ""
      echo "Opción inválida."
      pausar
      ;;
  esac
done`,
    expectedOutput: `$ bash script.sh
==============================================
       MENÚ DE SEGURIDAD - STUDIOS SA
==============================================
a. Realizar Backup de archivo/directorio
b. Ver bitácora de backups
c. Validar seguridad de una contraseña
d. Mostrar grupos e información del usuario
e. Salir
==============================================
Seleccione una opción [a-e]: a
Ruta del archivo o directorio a respaldar: /home/usuario/documentos
Backup de /home/usuario/documentos realizado por usuario el jue 01 ene 2024 10:00:00 ART
✅ Backup completado exitosamente

--- Opción b: Ver bitácora ---
BACKUP INICIADO - jue 01 ene 2024 10:00:00 ART
Backup de /home/usuario/documentos completado exitosamente

--- Opción c: Validar contraseña ---
Requisitos: 8+ caracteres, 1 mayúscula, 1 número, 1 símbolo
✅ Longitud: 12 caracteres
✅ Contiene mayúscula
✅ Contiene número
✅ Contiene símbolo
✅ CONTRASEÑA SEGURA

--- Opción d: Información del usuario ---
Usuario: usuario
ID: uid=1000(usuario) gid=1000(usuarios) groups=1000(usuarios),1001(seguridad)

Grupos:
usuario adm seguridad`,
    initialState: goHome, validationType: 'text',
    expectedCommandRegex: /mkdir.*-p.*resguardo|cp.*-r.*resguardo|>>.*bitacora\.txt|read\s+-s.*pass|\$\{#pass\}.*-ge\s+8|grep.*-q\s+\[A-Z\]|groups.*id|chgrp.*seguridad|chmod\s+750|groupadd.*seguridad|usermod.*-aG.*seguridad/i,
    commands: ['mkdir', 'cp', 'whoami', 'date', 'read', 'grep', 'groups', 'id', 'chmod', 'chgrp'],
    difficulty: 'difícil',
  },

  {
    id: 'final-02', category: 'FINALES - Monitoreo del Sistema',
    instruction: `El servidor de la empresa ha estado presentando problemas de rendimiento.

Tareas:
1) Diseñe un script con menú que monitoree: a) estadísticas generales (uptime, memoria, disco), b) top 5 procesos por uso de CPU, c) alerta de particiones con más del 80% de uso, d) buscar archivos .txt modificados en las últimas 24 horas
2) Genere un reporte completo en /home/usuario/reporte.txt con toda la información
3) El script debe pedir confirmación antes de sobrescribir el reporte si ya existe
4) Cada opción debe mostrar la salida formateada con títulos

💡 Creá el archivo con: cat > script.sh (luego pegar el código y presionar Ctrl+D)
💡 Ejecutalo con: bash script.sh`,
    hint: `Usá: uptime, free -h, df -h, ps aux --sort=-%cpu, find -mtime -1, while, case, read -p. ${CREAR_EJECUTAR}`,
    solutionHint: `#!/bin/bash
pausar() {
  read -p "Presione [Enter] para continuar..."
}
reporte() {
  if [ -f reporte.txt ]; then
    read -p "¿Sobrescribir? (s/N): " c
    [ "$c" != "s" ] && echo "Cancelado" && return
  fi
  {
    echo "REPORTE - \$(date)"
    uptime
    free -h
    df -h
    ps aux --sort=-%cpu | head -6
    find /home -name "*.txt" -mtime -1 -ls 2>/dev/null
  } > reporte.txt
  echo "Reporte generado"
}
while true; do
  clear
  echo "=== MONITOREO ==="
  echo "a) Estadísticas"
  echo "b) Top 5 CPU"
  echo "c) Alerta disco"
  echo "d) Buscar .txt recientes"
  echo "e) Generar reporte"
  echo "f) Salir"
  read -p "Opción: " op
  case $op in
    a|A)
      uptime
      free -h
      df -h
      ;;
    b|B) ps aux --sort=-%cpu | head -6 ;;
    c|C)
      df -h | tail -n+2 | while read l; do
        u=\$(echo "\$l" | awk '{print \$5}' | cut -d% -f1)
        [ "\$u" -gt 80 ] && echo "ALERTA: \$l"
      done
      ;;
    d|D) find /home -name "*.txt" -mtime -1 -ls 2>/dev/null ;;
    e|E) reporte ;;
    f|F) exit 0 ;;
  esac
  pausar
done`,
    executionCommand: `#!/bin/bash
pausar() {
  echo ""
  read -p "Presione [Enter] para continuar..."
}

reporte() {
  REPORTE="/home/usuario/reporte.txt"
  if [ -f "$REPORTE" ]; then
    read -p "El reporte ya existe. ¿Sobrescribir? (s/N): " conf
    [ "$conf" != "s" ] && [ "$conf" != "S" ] && echo "Cancelado." && return
  fi
  {
    echo "=========================================="
    echo "      REPORTE DEL SISTEMA"
    echo "=========================================="
    echo "Generado el: $(date)"
    echo ""
    echo "--- UPTIME ---"
    uptime
    echo ""
    echo "--- MEMORIA ---"
    free -h
    echo ""
    echo "--- DISCO ---"
    df -h
    echo ""
    echo "--- TOP 5 CPU ---"
    ps aux --sort=-%cpu | head -6
    echo ""
    echo "--- ARCHIVOS .txt RECIENTES (24hs) ---"
    find /home -name "*.txt" -mtime -1 -ls 2>/dev/null
  } > "$REPORTE"
  echo "✅ Reporte generado: $REPORTE"
}

while true; do
  clear
  echo "=============================================="
  echo "      MONITOREO DEL SISTEMA - SERVIDOR        "
  echo "=============================================="
  echo "a. Estadísticas generales (uptime/mem/disco)"
  echo "b. Top 5 procesos por uso de CPU"
  echo "c. Alerta de particiones (>80% uso)"
  echo "d. Buscar archivos .txt modificados en 24hs"
  echo "e. Generar reporte completo"
  echo "f. Salir"
  echo "=============================================="
  read -p "Seleccione una opción [a-f]: " opcion

  case "$opcion" in
    a|A)
      echo ""
      echo "--- TIEMPO DE ACTIVIDAD ---"
      uptime
      echo ""
      echo "--- MEMORIA RAM ---"
      free -h
      echo ""
      echo "--- ESPACIO EN DISCO ---"
      df -h /
      pausar
      ;;
    b|B)
      echo ""
      echo "--- TOP 5 PROCESOS POR CPU ---"
      ps aux --sort=-%cpu | head -6
      pausar
      ;;
    c|C)
      echo ""
      echo "--- ALERTA DE PARTICIONES ---"
      alertas=0
      df -h | tail -n+2 | while read linea; do
        uso=$(echo "$linea" | awk '{print $5}' | cut -d'%' -f1)
        particion=$(echo "$linea" | awk '{print $6}')
        if [ "$uso" -gt 80 ]; then
          echo "⚠️  ALERTA: $particion al \${uso}%"
        fi
      done
      echo "Análisis completado."
      pausar
      ;;
    d|D)
      echo ""
      echo "--- ARCHIVOS .txt MODIFICADOS EN 24HS ---"
      echo "Buscando en /home ..."
      archivos=$(find /home -name "*.txt" -mtime -1 -ls 2>/dev/null)
      if [ -z "$archivos" ]; then
        echo "No se encontraron archivos .txt recientes."
      else
        echo "$archivos"
      fi
      pausar
      ;;
    e|E)
      echo ""
      reporte
      pausar
      ;;
    f|F)
      echo "Saliendo del monitor..."
      exit 0
      ;;
    *)
      echo ""
      echo "Opción inválida."
      pausar
      ;;
  esac
done`,
    expectedOutput: `$ bash script.sh
==============================================
      MONITOREO DEL SISTEMA - SERVIDOR
==============================================
a. Estadísticas generales (uptime/mem/disco)
b. Top 5 procesos por uso de CPU
c. Alerta de particiones (>80% uso)
d. Buscar archivos .txt modificados en 24hs
e. Generar reporte completo
f. Salir
==============================================
Seleccione una opción [a-f]: a

--- TIEMPO DE ACTIVIDAD ---
 10:00:00 up 3 days,  2:30,  1 user,  load average: 0.5, 0.3, 0.2

--- MEMORIA RAM ---
              total        used        free      shared  buff/cache
Mem:           7.7G        2.1G        3.2G        245M        2.4G

--- ESPACIO EN DISCO ---
Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1       100G   45G   55G  45% /

--- Opción b: Top 5 CPU ---
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.0  0.1  12345  1234 ?        Ss   Jan01   0:00 init
usuario   1234  5.0  2.3  45678  5678 pts/0    Rl+  10:00   0:05 bash

--- Opción c: Alerta de particiones ---
⚠️  ALERTA: /var al 85%

--- Opción d: Archivos .txt recientes ---
Buscando en /home ...
No se encontraron archivos .txt recientes.

--- Opción e: Generar reporte ---
El reporte ya existe. ¿Sobrescribir? (s/N): s
✅ Reporte generado: /home/usuario/reporte.txt`,
    initialState: goHome, validationType: 'text',
    expectedCommandRegex: /uptime|free\s+-h|df\s+-h|ps\s+aux.*--sort=-%cpu.*head.*6|find.*-name.*"\*\.txt".*-mtime\s+-1|awk.*print.*\$5.*cut.*-d%|reporte\(\)|while\s+true.*case.*\$opcion/i,
    commands: ['uptime', 'free', 'df', 'ps', 'find', 'awk', 'cut'],
    difficulty: 'difícil',
  },

  {
    id: 'final-03', category: 'FINALES - Administración de Usuarios',
    instruction: `El departamento de RRHH necesita un sistema de administración de usuarios.

Tareas:
1) Diseñe un script con menú que permita: a) crear un usuario con directorio home, b) asignar un usuario a un grupo secundario, c) mostrar información completa de un usuario (UID, GID, grupos, home, shell), d) listar todos los usuarios del sistema, e) validar seguridad de una contraseña
2) Cada creación de usuario debe solicitar también la contraseña
3) Al listar usuarios, debe mostrar el total al final
4) Al mostrar info de un usuario, validar que exista antes de consultar

💡 Creá el archivo con: cat > script.sh (luego pegar el código y presionar Ctrl+D)
💡 Ejecutalo con: bash script.sh`,
    hint: `Usá: useradd -m, passwd, usermod -aG, id, cut -d: -f1 /etc/passwd, read -s, grep -q. ${CREAR_EJECUTAR}`,
    solutionHint: `#!/bin/bash
pausar() {
  read -p "Presione [Enter] para continuar..."
}
while true; do
  clear
  echo "=== ADMIN USUARIOS ==="
  echo "a) Crear usuario"
  echo "b) Asignar grupo"
  echo "c) Info usuario"
  echo "d) Listar usuarios"
  echo "e) Validar pass"
  echo "f) Salir"
  read -p "Opción: " op
  case $op in
    a|A)
      read -p "Usuario: " u
      useradd -m "$u"
      passwd "$u"
      ;;
    b|B)
      read -p "Usuario: " u
      read -p "Grupo: " g
      usermod -aG "$g" "$u"
      echo "Asignado"
      groups "$u"
      ;;
    c|C)
      read -p "Usuario: " u
      id "$u" 2>/dev/null || echo "No existe"
      grep "^$u:" /etc/passwd 2>/dev/null || echo "No existe"
      ;;
    d|D)
      cut -d: -f1 /etc/passwd
      echo "Total: \$(wc -l < /etc/passwd)"
      ;;
    e|E)
      read -s -p "Pass: " p
      echo
      [ \${#p} -ge 8 ] && echo "OK long" || echo "Faltan chars"
      echo "\$p" | grep -q [A-Z] && echo "OK mayús" || echo "Falta mayús"
      echo "\$p" | grep -q [0-9] && echo "OK num" || echo "Falta num"
      echo "\$p" | grep -q '[@#\$%]' && echo "OK símbolo" || echo "Falta símbolo"
      ;;
    f|F) exit 0 ;;
  esac
  pausar
done`,
    executionCommand: `#!/bin/bash
pausar() {
  echo ""
  read -p "Presione [Enter] para continuar..."
}

while true; do
  clear
  echo "=============================================="
  echo "    ADMINISTRACIÓN DE USUARIOS - RRHH         "
  echo "=============================================="
  echo "a. Crear un usuario nuevo (con home)"
  echo "b. Asignar usuario a un grupo"
  echo "c. Mostrar información de un usuario"
  echo "d. Listar todos los usuarios"
  echo "e. Validar seguridad de contraseña"
  echo "f. Salir"
  echo "=============================================="
  read -p "Seleccione una opción [a-f]: " opcion

  case "$opcion" in
    a|A)
      echo ""
      read -p "Nombre del nuevo usuario: " usuario
      useradd -m "$usuario" 2>/dev/null
      if [ $? -eq 0 ]; then
        echo "✅ Usuario '$usuario' creado con home en /home/$usuario"
        passwd "$usuario"
      else
        echo "❌ Error: el usuario '$usuario' ya existe o hubo un problema"
      fi
      pausar
      ;;
    b|B)
      echo ""
      read -p "Nombre del usuario: " usuario
      if id "$usuario" > /dev/null 2>&1; then
        read -p "Nombre del grupo: " grupo
        usermod -aG "$grupo" "$usuario" 2>/dev/null
        if [ $? -eq 0 ]; then
          echo "✅ Usuario '$usuario' agregado al grupo '$grupo'"
          groups "$usuario"
        else
          echo "❌ Error: el grupo '$grupo' no existe"
        fi
      else
        echo "❌ Error: el usuario '$usuario' no existe"
      fi
      pausar
      ;;
    c|C)
      echo ""
      read -p "Nombre del usuario: " usuario
      if id "$usuario" > /dev/null 2>&1; then
        echo "--- Información de '$usuario' ---"
        id "$usuario"
        echo ""
        echo "Home: $(grep "^$usuario:" /etc/passwd | cut -d: -f6)"
        echo "Shell: $(grep "^$usuario:" /etc/passwd | cut -d: -f7)"
      else
        echo "❌ Error: el usuario '$usuario' no existe"
      fi
      pausar
      ;;
    d|D)
      echo ""
      echo "--- USUARIOS DEL SISTEMA ---"
      cut -d: -f1 /etc/passwd
      echo ""
      echo "Total: $(wc -l < /etc/passwd) usuarios"
      pausar
      ;;
    e|E)
      echo ""
      echo "--- VALIDADOR DE CONTRASEÑAS ---"
      echo "Requisitos: 8+ chars, mayúscula, número, símbolo"
      read -s -p "Ingrese la contraseña: " pass
      echo ""
      ok=true
      [ \${#pass} -ge 8 ] && echo "✅ Longitud: \${#pass}" || { echo "❌ Longitud: \${#pass} (mín 8)"; ok=false; }
      echo "$pass" | grep -q [A-Z] && echo "✅ Tiene mayúscula" || { echo "❌ Falta mayúscula"; ok=false; }
      echo "$pass" | grep -q [0-9] && echo "✅ Tiene número" || { echo "❌ Falta número"; ok=false; }
      echo "$pass" | grep -q '[@#\$%^&+=]' && echo "✅ Tiene símbolo" || { echo "❌ Falta símbolo"; ok=false; }
      $ok && echo "✅ CONTRASEÑA SEGURA" || echo "❌ CONTRASEÑA DÉBIL"
      pausar
      ;;
    f|F)
      echo "Saliendo..."
      exit 0
      ;;
    *)
      echo "Opción inválida."
      pausar
      ;;
  esac
done`,
    expectedOutput: `$ bash script.sh
==============================================
     ADMINISTRACIÓN DE USUARIOS - RRHH
==============================================
a. Crear un usuario nuevo (con home)
b. Asignar usuario a un grupo
c. Mostrar información de un usuario
d. Listar todos los usuarios
e. Validar seguridad de contraseña
f. Salir
==============================================
Seleccione una opción [a-f]: a
Nombre del nuevo usuario: jperez
✅ Usuario 'jperez' creado con home en /home/jperez
Cambiando la contraseña para jperez
Nueva contraseña: 
Vuelva a escribir la nueva contraseña: 
passwd: contraseña actualizada correctamente

--- Opción c: Información de usuario ---
Nombre del usuario: jperez
--- Información de 'jperez' ---
uid=1001(jperez) gid=1001(jperez) groups=1001(jperez)
Home: /home/jperez
Shell: /bin/bash

--- Opción d: Listar usuarios ---
root
daemon
usuario
jperez
Total: 4 usuarios

--- Opción e: Validar contraseña ---
Requisitos: 8+ chars, mayúscula, número, símbolo
✅ Longitud: 12
✅ Tiene mayúscula
✅ Tiene número
✅ Tiene símbolo
✅ CONTRASEÑA SEGURA`,
    initialState: goHome, validationType: 'text',
    expectedCommandRegex: /useradd\s+-m|usermod\s+-aG|id\s+"\$usuario"|cut\s+-d:.*-f1.*\/etc\/passwd|read\s+-s.*pass|\$\{#pass\}.*-ge\s+8|grep.*-q\s+\[A-Z\]|while\s+true.*case.*\$opcion/i,
    commands: ['useradd', 'passwd', 'usermod', 'id', 'cut', 'grep', 'wc', 'read'],
    difficulty: 'difícil',
  },

  {
    id: 'final-04', category: 'FINALES - Análisis de Logs',
    instruction: `Se ha detectado un posible intento de intrusión en el servidor.

Tareas:
1) Diseñe un script con menú que analice /var/log/auth.log y muestre: a) cantidad de accesos exitosos y fallidos, b) top 5 usuarios con más intentos fallidos, c) top 5 IPs con más intentos fallidos, d) generar un reporte completo en /home/usuario/reporte_seguridad.txt
2) Si el archivo auth.log no existe, debe mostrar un mensaje de error
3) El reporte debe incluir fecha del análisis, todas las estadísticas y los tops
4) Validar que grep devuelva resultados antes de procesar los tops

💡 Creá el archivo con: cat > script.sh (luego pegar el código y presionar Ctrl+D)
💡 Ejecutalo con: bash script.sh`,
    hint: `Usá: grep -c, grep "Failed" | awk '{print $9}' | sort | uniq -c | sort -rn, while, case, if [ -f ]. ${CREAR_EJECUTAR}`,
    solutionHint: `#!/bin/bash
LOG="/var/log/auth.log"
if [ ! -f "\$LOG" ]; then
  echo "No existe \$LOG"
  exit 1
fi
pausar() {
  read -p "Presione [Enter] para continuar..."
}
reporte() {
  {
    echo "REPORTE SEGURIDAD - \$(date)"
    echo "Exitosos: \$(grep -c Accepted \$LOG)"
    echo "Fallidos: \$(grep -c Failed \$LOG)"
    echo "Top usuarios:"
    grep Failed "\$LOG" 2>/dev/null | awk '{print \$9}' | sort | uniq -c | sort -rn | head -5
    echo "Top IPs:"
    grep Failed "\$LOG" 2>/dev/null | awk '{print \$11}' | sort | uniq -c | sort -rn | head -5
  } > /home/usuario/reporte_seguridad.txt
  echo "Reporte generado"
}
while true; do
  clear
  echo "=== ANÁLISIS DE LOGS ==="
  echo "a) Estadísticas"
  echo "b) Top usuarios fallidos"
  echo "c) Top IPs fallidos"
  echo "d) Generar reporte"
  echo "e) Salir"
  read -p "Opción: " op
  case $op in
    a|A)
      echo "Exitosos: \$(grep -c Accepted \$LOG)"
      echo "Fallidos: \$(grep -c Failed \$LOG)"
      ;;
    b|B) grep Failed "\$LOG" 2>/dev/null | awk '{print \$9}' | sort | uniq -c | sort -rn | head -5 ;;
    c|C) grep Failed "\$LOG" 2>/dev/null | awk '{print \$11}' | sort | uniq -c | sort -rn | head -5 ;;
    d|D) reporte ;;
    e|E) exit 0 ;;
  esac
  pausar
done`,
    executionCommand: `#!/bin/bash
LOG="/var/log/auth.log"

if [ ! -f "$LOG" ]; then
  echo "❌ Error: No se encuentra $LOG"
  echo "Ejecute: sudo touch /var/log/auth.log"
  exit 1
fi

pausar() {
  echo ""
  read -p "Presione [Enter] para continuar..."
}

reporte() {
  REPORTE="/home/usuario/reporte_seguridad.txt"
  echo "Generando reporte de seguridad..."
  {
    echo "=========================================="
    echo "   REPORTE DE SEGURIDAD - ANÁLISIS DE LOGS"
    echo "=========================================="
    echo "Fecha del análisis: $(date)"
    echo "Archivo analizado: $LOG"
    echo ""

    exitos=$(grep -c "Accepted" "$LOG" 2>/dev/null || echo 0)
    fallidos=$(grep -c "Failed" "$LOG" 2>/dev/null || echo 0)
    echo "--- ESTADÍSTICAS GENERALES ---"
    echo "Intentos exitosos: $exitos"
    echo "Intentos fallidos: $fallidos"
    echo ""

    echo "--- TOP 5 USUARIOS CON MÁS FALLOS ---"
    grep "Failed" "$LOG" 2>/dev/null | awk '{print $9}' | sort | uniq -c | sort -rn | head -5 || echo "Sin datos"
    echo ""

    echo "--- TOP 5 IPs CON MÁS FALLOS ---"
    grep "Failed" "$LOG" 2>/dev/null | awk '{print $11}' | sort | uniq -c | sort -rn | head -5 || echo "Sin datos"
    echo ""

    echo "=========================================="
  } > "$REPORTE"
  echo "✅ Reporte generado: $REPORTE"
}

while true; do
  clear
  echo "=============================================="
  echo "      ANÁLISIS DE LOGS - SEGURIDAD            "
  echo "=============================================="
  echo "a. Estadísticas generales (exitosos/fallidos)"
  echo "b. Top 5 usuarios con más intentos fallidos"
  echo "c. Top 5 IPs con más intentos fallidos"
  echo "d. Generar reporte completo de seguridad"
  echo "e. Salir"
  echo "=============================================="
  read -p "Seleccione una opción [a-e]: " opcion

  case "$opcion" in
    a|A)
      echo ""
      exitos=$(grep -c "Accepted" "$LOG" 2>/dev/null || echo 0)
      fallidos=$(grep -c "Failed" "$LOG" 2>/dev/null || echo 0)
      total=$((exitos + fallidos))
      echo "--- ESTADÍSTICAS GENERALES ---"
      echo "Total de intentos: $total"
      echo "✅ Exitosos: $exitos"
      echo "❌ Fallidos: $fallidos"
      pausar
      ;;
    b|B)
      echo ""
      echo "--- TOP 5 USUARIOS CON MÁS FALLOS ---"
      grep "Failed" "$LOG" 2>/dev/null | awk '{print $9}' | sort | uniq -c | sort -rn | head -5
      if [ $? -ne 0 ]; then
        echo "No se encontraron datos de intentos fallidos."
      fi
      pausar
      ;;
    c|C)
      echo ""
      echo "--- TOP 5 IPs CON MÁS FALLOS ---"
      grep "Failed" "$LOG" 2>/dev/null | awk '{print $11}' | sort | uniq -c | sort -rn | head -5
      if [ $? -ne 0 ]; then
        echo "No se encontraron datos de IPs."
      fi
      pausar
      ;;
    d|D)
      echo ""
      reporte
      pausar
      ;;
    e|E)
      echo "Saliendo del análisis..."
      exit 0
      ;;
    *)
      echo ""
      echo "Opción inválida."
      pausar
      ;;
  esac
done`,
    expectedOutput: `$ bash script.sh
==============================================
       ANÁLISIS DE LOGS - SEGURIDAD
==============================================
a. Estadísticas generales (exitosos/fallidos)
b. Top 5 usuarios con más intentos fallidos
c. Top 5 IPs con más intentos fallidos
d. Generar reporte completo de seguridad
e. Salir
==============================================
Seleccione una opción [a-e]: a
--- ESTADÍSTICAS GENERALES ---
Total de intentos: 150
✅ Exitosos: 120
❌ Fallidos: 30

--- Opción b: Top 5 usuarios fallidos ---
     15 root
      8 admin
      5 nobody
      3 guest
      2 test

--- Opción c: Top 5 IPs fallidos ---
     45 192.168.1.100
     12 10.0.0.50
      8 172.16.0.1

--- Opción d: Generar reporte ---
Generando reporte de seguridad...
✅ Reporte generado: /home/usuario/reporte_seguridad.txt`,
    initialState: goHome, validationType: 'text',
    expectedCommandRegex: /grep.*-c.*Accepted|grep.*-c.*Failed|grep.*Failed.*awk.*'\$9'.*sort.*uniq.*-c.*sort.*-rn|grep.*Failed.*awk.*'\$11'.*sort.*uniq.*reporte_seguridad|while\s+true.*case.*\$opcion/i,
    commands: ['grep', 'awk', 'sort', 'uniq'],
    difficulty: 'difícil',
  },

  {
    id: 'final-05', category: 'FINALES - Automatización de Backups',
    instruction: `El sector Ventas necesita automatizar los backups de su documentación.

Tareas:
1) Diseñe un script con menú que permita: a) crear backup comprimido tar.gz de un directorio (con fecha en el nombre), b) listar los backups existentes con su tamaño, c) verificar la integridad de un backup, d) restaurar un backup, e) mostrar la línea de crontab para ejecución diaria a las 2:30
2) Los backups deben guardarse en /home/usuario/backups/
3) Mantener solo los últimos 5 backups (rotación automática al crear uno nuevo)
4) Al verificar, debe indicar si el archivo está íntegro o dañado

💡 Creá el archivo con: cat > script.sh (luego pegar el código y presionar Ctrl+D)
💡 Ejecutalo con: bash script.sh`,
    hint: `Usá: tar czf, tar xzf, tar tzf, date +%Y%m%d, ls -lh, du -h, tail -n +6, while, case. ${CREAR_EJECUTAR}`,
    solutionHint: `#!/bin/bash
BDIR="/home/usuario/backups"
mkdir -p "\$BDIR"
pausar() {
  read -p "Presione [Enter] para continuar..."
}
backup() {
  read -p "Directorio: " d
  f="\$BDIR/backup_\$(basename "\$d")_\$(date +%Y%m%d_%H%M).tar.gz"
  tar czf "\$f" "\$d" 2>/dev/null && echo "Creado: \$f" || echo "Error"
  ls -t "\$BDIR"/backup_*.tar.gz 2>/dev/null | tail -n +6 | while read x; do
    rm -f "\$x"
  done
}
while true; do
  clear
  echo "=== BACKUPS VENTAS ==="
  echo "a) Crear backup"
  echo "b) Listar backups"
  echo "c) Verificar"
  echo "d) Restaurar"
  echo "e) Cron"
  echo "f) Salir"
  read -p "Opción: " op
  case $op in
    a|A) backup ;;
    b|B) ls -lh "\$BDIR"/backup_*.tar.gz 2>/dev/null || echo "No hay backups" ;;
    c|C)
      read -p "Archivo: " f
      tar tzf "\$f" > /dev/null 2>&1 && echo "Integro" || echo "Daniado"
      ;;
    d|D)
      read -p "Archivo: " f
      tar xzf "\$f" 2>/dev/null && echo "Restaurado" || echo "Error"
      ;;
    e|E) echo "30 2 * * * /home/usuario/script.sh" ;;
    f|F) exit 0 ;;
  esac
  pausar
done`,
    executionCommand: `#!/bin/bash
BDIR="/home/usuario/backups"
mkdir -p "$BDIR"

pausar() {
  echo ""
  read -p "Presione [Enter] para continuar..."
}

hacer_backup() {
  read -p "Ingrese el directorio a respaldar: " dir
  if [ ! -d "$dir" ]; then
    echo "❌ Error: '$dir' no existe o no es un directorio"
    return
  fi
  fecha=$(date +%Y%m%d_%H%M)
  nombre="backup_$(basename "$dir")_$fecha.tar.gz"
  ruta="$BDIR/$nombre"
  echo "📦 Comprimiendo $dir ..."
  tar czf "$ruta" "$dir" 2>/dev/null
  if [ $? -eq 0 ]; then
    echo "✅ Backup creado: $ruta"
    echo "   Tamaño: $(du -h "$ruta" | cut -f1)"
    echo ""
    echo "🔄 Rotando backups (manteniendo últimos 5)..."
    ls -t "$BDIR/backup_"*.tar.gz 2>/dev/null | tail -n +6 | while read f; do
      rm -f "$f"
      echo "   Eliminado: $f"
    done
  else
    echo "❌ Error al crear el backup"
  fi
}

listar_backups() {
  echo ""
  echo "--- BACKUPS DISPONIBLES ---"
  archivos=$(ls -lh "$BDIR/backup_"*.tar.gz 2>/dev/null)
  if [ -z "$archivos" ]; then
    echo "No hay backups aún."
  else
    echo "$archivos" | awk '{print "  " $NF " - " $5}'
  fi
}

verificar_backup() {
  read -p "Ingrese la ruta del archivo .tar.gz: " archivo
  if [ ! -f "$archivo" ]; then
    echo "❌ El archivo no existe"
    return
  fi
  echo "🔍 Verificando integridad..."
  tar tzf "$archivo" > /dev/null 2>&1
  if [ $? -eq 0 ]; then
    echo "✅ El backup está ÍNTEGRO"
    echo "   Contiene $(tar tzf "$archivo" | wc -l) archivos"
  else
    echo "❌ El backup está DAÑADO o no es un tar válido"
  fi
}

restaurar_backup() {
  read -p "Ingrese la ruta del archivo .tar.gz a restaurar: " archivo
  if [ ! -f "$archivo" ]; then
    echo "❌ El archivo no existe"
    return
  fi
  echo "📦 Restaurando $archivo ..."
  tar xzf "$archivo" 2>/dev/null
  if [ $? -eq 0 ]; then
    echo "✅ Restauración completada"
    echo "   Archivos extraídos:"
    tar tzf "$archivo" | head -5
  else
    echo "❌ Error al restaurar"
  fi
}

while true; do
  clear
  echo "=============================================="
  echo "      BACKUPS AUTOMÁTICOS - VENTAS            "
  echo "=============================================="
  echo "a. Crear backup comprimido de un directorio"
  echo "b. Listar backups disponibles"
  echo "c. Verificar integridad de un backup"
  echo "d. Restaurar un backup"
  echo "e. Mostrar línea para cron (diario 2:30)"
  echo "f. Salir"
  echo "=============================================="
  read -p "Seleccione una opción [a-f]: " opcion

  case "$opcion" in
    a|A) hacer_backup ;;
    b|B) listar_backups ;;
    c|C) verificar_backup ;;
    d|D) restaurar_backup ;;
    e|E)
      echo ""
      echo "--- PROGRAMACIÓN EN CRON ---"
      echo "Para ejecutar el backup diario a las 2:30 AM:"
      echo "  30 2 * * * /home/usuario/script.sh"
      echo ""
      echo "Para agregarlo: crontab -e  |  (luego pegar la línea)"
      pausar
      ;;
    f|F)
      echo "Saliendo..."
      exit 0
      ;;
    *)
      echo "Opción inválida."
      pausar
      ;;
  esac
done`,
    expectedOutput: `$ bash script.sh
==============================================
       BACKUPS AUTOMÁTICOS - VENTAS
==============================================
a. Crear backup comprimido de un directorio
b. Listar backups disponibles
c. Verificar integridad de un backup
d. Restaurar un backup
e. Mostrar línea para cron (diario 2:30)
f. Salir
==============================================
Seleccione una opción [a-f]: a
Ingrese el directorio a respaldar: /home/usuario/documentos
📦 Comprimiendo /home/usuario/documentos ...
✅ Backup creado: /home/usuario/backups/backup_documentos_20240101_1000.tar.gz
   Tamaño: 2.3M

🔄 Rotando backups (manteniendo últimos 5)...

--- Opción b: Listar backups ---
  /home/usuario/backups/backup_documentos_20240101_1000.tar.gz - 2.3M

--- Opción c: Verificar integridad ---
Ingrese la ruta del archivo .tar.gz: /home/usuario/backups/backup_documentos_20240101_1000.tar.gz
🔍 Verificando integridad...
✅ El backup está ÍNTEGRO
   Contiene 15 archivos

--- Opción e: Línea de cron ---
Para ejecutar el backup diario a las 2:30 AM:
  30 2 * * * /home/usuario/script.sh`,
    initialState: goHome, validationType: 'text',
    expectedCommandRegex: /tar\s+czf|tar\s+xzf|tar\s+tzf|date.*%Y%m%d|ls\s+-t.*backup.*tail.*\++6.*while.*rm|du\s+-h|30\s+2\s+\*\s+\*\s+\*|while\s+true.*case.*\$opcion/i,
    commands: ['tar', 'gzip', 'date', 'ls', 'du', 'rm', 'mkdir'],
    difficulty: 'difícil',
  },

  {
    id: 'final-06', category: 'FINALES - Auditoría de Permisos',
    instruction: `Se requiere una auditoría de seguridad en los archivos del servidor.

Tareas:
1) Diseñe un script con menú que: a) escanee /home/usuario en busca de archivos world-writable (escritura para otros), b) corrija los permisos inseguros cambiándolos a 750, c) muestre el reporte de auditoría, d) muestre un resumen con total de archivos inseguros y corregidos
2) El reporte debe incluir fecha del análisis, lista de archivos inseguros y acciones tomadas
3) Antes de corregir, debe preguntar al usuario si está seguro
4) Al final debe mostrar cuántos archivos se corrigieron

💡 Creá el archivo con: cat > script.sh (luego pegar el código y presionar Ctrl+D)
💡 Ejecutalo con: bash script.sh`,
    hint: `Usá: find -perm /o+w, -exec ls -la, chmod 750, wc -l, date, while, case. ${CREAR_EJECUTAR}`,
    solutionHint: `#!/bin/bash
AUDIT="/home/usuario"
REPORTE="/home/usuario/auditoria.txt"
pausar() {
  read -p "Presione [Enter] para continuar..."
}
escanear() {
  find "\$AUDIT" -type f -perm /o+w -ls 2>/dev/null
}
while true; do
  clear
  echo "=== AUDITORÍA ==="
  echo "a) Escanear inseguros"
  echo "b) Corregir permisos"
  echo "c) Ver reporte"
  echo "d) Resumen"
  echo "e) Salir"
  read -p "Opción: " op
  case $op in
    a|A)
      echo "Archivos world-writable:"
      escanear
      echo "Total: \$(escanear | wc -l)"
      ;;
    b|B)
      read -p "Corregir todos a 750? (s/N): " c
      [ "$c" != "s" ] && echo "Cancelado" && continue
      escanear | awk '{print \$NF}' | while read f; do
        chmod 750 "\$f"
      done
      echo "Corregidos"
      ;;
    c|C) cat "\$REPORTE" 2>/dev/null || echo "Sin reporte" ;;
    d|D) echo "Inseguros: \$(escanear | wc -l)" ;;
    e|E) exit 0 ;;
  esac
  pausar
done`,
    executionCommand: `#!/bin/bash
AUDIT_DIR="/home/usuario"
REPORTE="/home/usuario/auditoria.txt"

pausar() {
  echo ""
  read -p "Presione [Enter] para continuar..."
}

escanear() {
  find "$AUDIT_DIR" -type f -perm /o+w 2>/dev/null
}

generar_reporte() {
  echo "==========================================" > "$REPORTE"
  echo "   AUDITORÍA DE SEGURIDAD - PERMISOS" >> "$REPORTE"
  echo "==========================================" >> "$REPORTE"
  echo "Fecha: $(date)" >> "$REPORTE"
  echo "Directorio auditado: $AUDIT_DIR" >> "$REPORTE"
  echo "" >> "$REPORTE"

  inseguros=$(escanear)
  cantidad=$(echo "$inseguros" | grep -c . 2>/dev/null || echo 0)

  echo "Archivos con permisos world-writable:" >> "$REPORTE"
  echo "-------------------------------------" >> "$REPORTE"
  if [ "$cantidad" -gt 0 ] && [ -n "$inseguros" ]; then
    echo "$inseguros" >> "$REPORTE"
  else
    echo "No se encontraron archivos inseguros." >> "$REPORTE"
  fi
  echo "" >> "$REPORTE"
  echo "Total de archivos inseguros: $cantidad" >> "$REPORTE"
  echo "==========================================" >> "$REPORTE"
  echo "✅ Reporte generado: $REPORTE"
}

while true; do
  clear
  echo "=============================================="
  echo "     AUDITORÍA DE PERMISOS - SEGURIDAD        "
  echo "=============================================="
  echo "a. Escanear archivos world-writable"
  echo "b. Corregir permisos inseguros (a 750)"
  echo "c. Mostrar reporte de auditoría"
  echo "d. Resumen de la auditoría"
  echo "e. Salir"
  echo "=============================================="
  read -p "Seleccione una opción [a-e]: " opcion

  case "$opcion" in
    a|A)
      echo ""
      echo "--- ARCHIVOS WORLD-WRITABLE ---"
      inseguros=$(escanear)
      cantidad=$(echo "$inseguros" | grep -c . 2>/dev/null || echo 0)
      if [ "$cantidad" -gt 0 ] && [ -n "$inseguros" ]; then
        echo "$inseguros" | while read archivo; do
          ls -la "$archivo" 2>/dev/null | awk '{print "  " $1 " " $NF}'
        done
        echo ""
        echo "⚠️  Total: $cantidad archivo(s) inseguro(s)"
      else
        echo "✅ No se encontraron archivos con permisos inseguros."
      fi
      pausar
      ;;
    b|B)
      echo ""
      inseguros=$(escanear)
      cantidad=$(echo "$inseguros" | grep -c . 2>/dev/null || echo 0)
      if [ "$cantidad" -eq 0 ] || [ -z "$inseguros" ]; then
        echo "✅ No hay archivos inseguros para corregir."
        pausar
        continue
      fi
      echo "Archivos a corregir:"
      echo "$inseguros" | while read f; do echo "  - $f"; done
      echo ""
      read -p "¿Está seguro de cambiar permisos a 750? (s/N): " conf
      if [ "$conf" != "s" ] && [ "$conf" != "S" ]; then
        echo "Cancelado."
        pausar
        continue
      fi
      corregidos=0
      echo "$inseguros" | while read archivo; do
        chmod 750 "$archivo" 2>/dev/null && echo "✅ Corregido: $archivo" || echo "❌ Error: $archivo"
        corregidos=$((corregidos + 1))
      done
      echo ""
      echo "✅ Se corrigieron $corregidos archivo(s)"
      pausar
      ;;
    c|C)
      echo ""
      generar_reporte
      echo ""
      echo "--- CONTENIDO DEL REPORTE ---"
      cat "$REPORTE" 2>/dev/null || echo "No se pudo leer el reporte"
      pausar
      ;;
    d|D)
      echo ""
      inseguros=$(escanear)
      cantidad=$(echo "$inseguros" | grep -c . 2>/dev/null || echo 0)
      echo "--- RESUMEN DE AUDITORÍA ---"
      echo "Directorio auditado: $AUDIT_DIR"
      echo "Fecha: $(date)"
      echo "Archivos inseguros encontrados: $cantidad"
      if [ "$cantidad" -gt 0 ]; then
        echo "⚠️  Se recomienda corregir con la opción b)"
      else
        echo "✅ Sistema seguro"
      fi
      pausar
      ;;
    e|E)
      echo "Saliendo de la auditoría..."
      exit 0
      ;;
    *)
      echo "Opción inválida."
      pausar
      ;;
  esac
done`,
    expectedOutput: `$ bash script.sh
==============================================
      AUDITORÍA DE PERMISOS - SEGURIDAD
==============================================
a. Escanear archivos world-writable
b. Corregir permisos inseguros (a 750)
c. Mostrar reporte de auditoría
d. Resumen de la auditoría
e. Salir
==============================================
Seleccione una opción [a-e]: a
--- ARCHIVOS WORLD-WRITABLE ---
  -rwxrwxrwx  /home/usuario/documentos/informe.txt
  -rw-rw-rw-  /home/usuario/documentos/datos.csv
⚠️  Total: 2 archivo(s) inseguro(s)

--- Opción b: Corregir permisos ---
Archivos a corregir:
  - /home/usuario/documentos/informe.txt
  - /home/usuario/documentos/datos.csv

¿Está seguro de cambiar permisos a 750? (s/N): s
✅ Corregido: /home/usuario/documentos/informe.txt
✅ Corregido: /home/usuario/documentos/datos.csv

--- Opción d: Resumen ---
Directorio auditado: /home/usuario
Fecha: jue 01 ene 2024 10:00:00 ART
Archivos inseguros encontrados: 0
✅ Sistema seguro`,
    initialState: goHome, validationType: 'text',
    expectedCommandRegex: /find.*-perm.*\/o\+w|chmod\s+750|find.*-ls|ls\s+-la.*awk.*'\$NF'|while\s+true.*case.*\$opcion|grep.*-c/i,
    commands: ['find', 'chmod', 'ls', 'wc', 'date'],
    difficulty: 'medio',
  },

];

