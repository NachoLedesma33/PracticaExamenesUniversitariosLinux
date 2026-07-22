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

  {
    id: 'final-07', category: 'FINALES - Gestión de Procesos',
    instruction: `El servidor de aplicaciones presenta procesos que consumen recursos excesivos y se han detectado procesos zombies.

Tareas:
1) Diseñe un script con menú que permita: a) listar todos los procesos con PID, %CPU, %MEM y comando, b) buscar un proceso por nombre y mostrar su información, c) matar un proceso por PID (con confirmación), d) mostrar el top 5 de procesos por uso de CPU
2) Antes de matar un proceso debe pedir confirmación
3) Si el PID no existe, debe mostrar un mensaje de error
4) Al listar procesos, debe mostrar el total al final

💡 Creá el archivo con: cat > script.sh (luego pegar el código y presionar Ctrl+D)
💡 Ejecutalo con: bash script.sh`,
    hint: `Usá: ps aux, awk, grep -i, kill, head, sort -k3 -rn, wc -l, while, case, read. ${CREAR_EJECUTAR}`,
    solutionHint: `#!/bin/bash
pausar() {
  read -p "Presione [Enter] para continuar..."
}
while true; do
  clear
  echo "=== GESTIÓN DE PROCESOS ==="
  echo "a) Listar procesos"
  echo "b) Buscar proceso"
  echo "c) Matar proceso"
  echo "d) Top 5 CPU"
  echo "e) Salir"
  read -p "Opción: " op
  case $op in
    a|A)
      ps aux | tail -n+2 | awk '{print \$2, \$3"%", \$4"%", \$11}'
      echo "Total: \$(ps aux | tail -n+2 | wc -l)"
      ;;
    b|B)
      read -p "Nombre: " n
      ps aux | grep -i "\$n" | grep -v grep || echo "No encontrado"
      ;;
    c|C)
      read -p "PID: " p
      if ps aux | awk -v pid="\$p" '\$2 == pid' | grep -q .; then
        read -p "¿Matar PID \$p? (s/N): " c
        [ "\$c" = "s" ] && kill "\$p" && echo "Matado" || echo "Cancelado"
      else
        echo "El PID \$p no existe"
      fi
      ;;
    d|D)
      ps aux --sort=-%cpu | head -6
      ;;
    e|E) exit 0 ;;
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
  echo "      GESTIÓN DE PROCESOS - SERVIDOR          "
  echo "=============================================="
  echo "a. Listar todos los procesos"
  echo "b. Buscar proceso por nombre"
  echo "c. Matar un proceso por PID"
  echo "d. Top 5 procesos por uso de CPU"
  echo "e. Salir"
  echo "=============================================="
  read -p "Seleccione una opción [a-e]: " opcion

  case "$opcion" in
    a|A)
      echo ""
      echo "--- LISTADO DE PROCESOS ---"
      echo "PID   %CPU  %MEM  COMANDO"
      echo "----------------------------------------"
      ps aux | tail -n+2 | awk '{printf "%-5s %-5s %-5s %s\n", \$2, \$3, \$4, \$11}'
      echo ""
      echo "Total de procesos: $(ps aux | tail -n+2 | wc -l)"
      pausar
      ;;
    b|B)
      echo ""
      read -p "Ingrese el nombre del proceso: " nombre
      echo ""
      echo "--- PROCESOS QUE COINCIDEN CON '$nombre' ---"
      resultado=$(ps aux | grep -i "$nombre" | grep -v grep)
      if [ -z "$resultado" ]; then
        echo "No se encontraron procesos con el nombre '$nombre'"
      else
        echo "$resultado" | awk '{printf "PID: %-5s CPU: %-4s MEM: %-4s CMD: %s\n", \$2, \$3, \$4, \$11}'
      fi
      pausar
      ;;
    c|C)
      echo ""
      read -p "Ingrese el PID a matar: " pid
      existe=$(ps aux | awk -v p="$pid" '$2 == p {print}')
      if [ -n "$existe" ]; then
        proceso=$(echo "$existe" | awk '{print \$11}')
        echo "Proceso seleccionado: PID $pid ($proceso)"
        read -p "¿Está seguro de matar este proceso? (s/N): " conf
        if [ "$conf" = "s" ] || [ "$conf" = "S" ]; then
          kill "$pid" 2>/dev/null
          if [ $? -eq 0 ]; then
            echo "✅ Proceso $pid terminado exitosamente"
          else
            echo "❌ No se pudo terminar el proceso $pid"
          fi
        else
          echo "Cancelado."
        fi
      else
        echo "❌ Error: El PID $pid no existe"
      fi
      pausar
      ;;
    d|D)
      echo ""
      echo "--- TOP 5 PROCESOS POR CPU ---"
      echo "PID   %CPU  %MEM  COMANDO"
      echo "----------------------------------------"
      ps aux --sort=-%cpu | head -6 | tail -5 | awk '{printf "%-5s %-5s %-5s %s\n", \$2, \$3, \$4, \$11}'
      pausar
      ;;
    e|E)
      echo ""
      echo "Saliendo del monitor de procesos..."
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
      GESTIÓN DE PROCESOS - SERVIDOR
==============================================
a. Listar todos los procesos
b. Buscar proceso por nombre
c. Matar un proceso por PID
d. Top 5 procesos por uso de CPU
e. Salir
==============================================
Seleccione una opción [a-e]: a

--- LISTADO DE PROCESOS ---
PID   %CPU  %MEM  COMANDO
----------------------------------------
1     0.0   0.1   /sbin/init
1234  5.0   2.3   /usr/bin/python3
5678  1.2   0.8   /usr/bin/sshd
Total de procesos: 45

--- Opción b: Buscar proceso ---
PID: 1234   CPU: 5.0   MEM: 2.3   CMD: /usr/bin/python3

--- Opción c: Matar proceso ---
PID: 9999
❌ Error: El PID 9999 no existe

--- Opción d: Top 5 CPU ---
PID   %CPU  %MEM  COMANDO
1234  5.0   2.3   /usr/bin/python3
5678  1.2   0.8   /usr/bin/sshd`,
    initialState: goHome, validationType: 'text',
    expectedCommandRegex: /ps\s+aux|kill\s+"\$p"|kill\s+"\$pid"|grep.*-i.*"\$n"|head\s+-\d+|sort.*-%cpu|while\s+true.*case.*\$opcion/i,
    commands: ['ps', 'kill', 'grep', 'head', 'sort', 'wc', 'awk'],
    difficulty: 'difícil',
  },

  {
    id: 'final-08', category: 'FINALES - Monitoreo de Recursos',
    instruction: `El equipo de infraestructura necesita un monitor de recursos en tiempo real para el servidor.

Tareas:
1) Diseñe un script con menú que permita: a) mostrar uso de memoria RAM (total, usada, libre, swap), b) mostrar uso de discos (particiones, porcentaje de uso), c) mostrar estadísticas del sistema con vmstat, d) generar un reporte completo en /home/usuario/reporte_recursos.txt
2) Si una partición supera el 80% de uso, debe marcar una alerta
3) El reporte debe incluir: fecha, memoria, disco y vmstat
4) Cada sección debe tener un título descriptivo

💡 Creá el archivo con: cat > script.sh (luego pegar el código y presionar Ctrl+D)
💡 Ejecutalo con: bash script.sh`,
    hint: `Usá: free -h, df -h, vmstat, date, awk, sort, head, while, case, read. ${CREAR_EJECUTAR}`,
    solutionHint: `#!/bin/bash
REPORTE="/home/usuario/reporte_recursos.txt"
pausar() {
  read -p "Presione [Enter] para continuar..."
}
reporte() {
  {
    echo "REPORTE DE RECURSOS - \$(date)"
    echo "--- MEMORIA ---"
    free -h
    echo "--- DISCO ---"
    df -h
    echo "--- VMSTAT ---"
    vmstat
  } > "\$REPORTE"
  echo "Reporte generado en \$REPORTE"
}
while true; do
  clear
  echo "=== MONITOREO DE RECURSOS ==="
  echo "a) Memoria RAM"
  echo "b) Discos"
  echo "c) Estadísticas vmstat"
  echo "d) Generar reporte"
  echo "e) Salir"
  read -p "Opción: " op
  case $op in
    a|A)
      free -h
      echo ""
      echo "Swap total: \$(free -h | grep Swap | awk '{print \$2}')"
      ;;
    b|B)
      df -h | awk '{print \$1, \$5, \$6}'
      echo ""
      df -h | tail -n+2 | awk '{print \$5}' | cut -d% -f1 | while read p; do
        [ "\$p" -gt 80 ] && echo "ALERTA: Partición al \$p%"
      done
      ;;
    c|C)
      vmstat
      echo ""
      echo "Promedio de carga: \$(vmstat | tail -1 | awk '{print \$13, \$14, \$15}')"
      ;;
    d|D) reporte ;;
    e|E) exit 0 ;;
  esac
  pausar
done`,
    executionCommand: `#!/bin/bash
REPORTE="/home/usuario/reporte_recursos.txt"
pausar() {
  echo ""
  read -p "Presione [Enter] para continuar..."
}

reporte() {
  echo "Generando reporte de recursos..."
  {
    echo "=========================================="
    echo "   REPORTE DE RECURSOS DEL SISTEMA"
    echo "=========================================="
    echo "Generado: \$(date)"
    echo ""
    echo "--- MEMORIA RAM ---"
    free -h
    echo ""
    echo "--- ESPACIO EN DISCO ---"
    df -h
    echo ""
    echo "--- ESTADÍSTICAS VMSTAT ---"
    vmstat
    echo ""
    echo "=========================================="
  } > "\$REPORTE"
  echo "✅ Reporte generado: \$REPORTE"
}

while true; do
  clear
  echo "=============================================="
  echo "       MONITOREO DE RECURSOS - INFRA          "
  echo "=============================================="
  echo "a. Mostrar uso de memoria RAM"
  echo "b. Mostrar uso de discos"
  echo "c. Estadísticas del sistema (vmstat)"
  echo "d. Generar reporte completo"
  echo "e. Salir"
  echo "=============================================="
  read -p "Seleccione una opción [a-e]: " opcion

  case "$opcion" in
    a|A)
      echo ""
      echo "--- MEMORIA RAM ---"
      free -h
      echo ""
      echo "--- DETALLE DE SWAP ---"
      free -h | grep -i swap
      pausar
      ;;
    b|B)
      echo ""
      echo "--- PARTICIONES Y USO ---"
      echo "DISPOSITIVO    USO%    MONTADO"
      echo "----------------------------------------"
      df -h | tail -n+2 | awk '{printf "%-14s %-7s %s\n", \$1, \$5, \$6}'
      echo ""
      echo "--- ALERTAS ---"
      alertas=0
      df -h | tail -n+2 | awk '{print \$5, \$6}' | while read pct punto; do
        pct_n=\$(echo "\$pct" | cut -d% -f1)
        if [ "\$pct_n" -gt 80 ]; then
          echo "⚠️  ALERTA: \$punto al \$pct_n%"
          alertas=\$((alertas + 1))
        fi
      done
      [ "\$alertas" -eq 0 ] && echo "✅ No hay particiones críticas"
      pausar
      ;;
    c|C)
      echo ""
      echo "--- ESTADÍSTICAS DEL SISTEMA ---"
      echo "  procs  memoria    swap    io     system    cpu"
      vmstat
      echo ""
      echo "--- INTERPRETACIÓN ---"
      echo "  r: procesos en espera de CPU"
      echo "  b: procesos bloqueados"
      echo "  si/so: swap in/out (idealmente 0)"
      echo "  us/sy/id/wa: % usuario/sistema/idle/espera"
      pausar
      ;;
    d|D)
      echo ""
      reporte
      pausar
      ;;
    e|E)
      echo ""
      echo "Saliendo del monitor de recursos..."
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
       MONITOREO DE RECURSOS - INFRA
==============================================
a. Mostrar uso de memoria RAM
b. Mostrar uso de discos
c. Estadísticas del sistema (vmstat)
d. Generar reporte completo
e. Salir
==============================================
Seleccione una opción [a-e]: a

--- MEMORIA RAM ---
              total        used        free      shared  buff/cache
Mem:           7.7G        2.1G        3.2G        245M        2.4G
Swap:          2.0G        256M        1.8G

--- Opción b: Discos ---
/dev/sda1       45%    /
/dev/sdb1       85%    /var
⚠️  ALERTA: /var al 85%

--- Opción c: vmstat ---
  procs  memoria    swap    io     system    cpu
  0    0   512M   256M    10     5   5   0  85  10

--- Opción d: Reporte ---
✅ Reporte generado: /home/usuario/reporte_recursos.txt`,
    initialState: goHome, validationType: 'text',
    expectedCommandRegex: /free\s+-h|df\s+-h|vmstat|date|awk.*print.*\$5.*cut.*%|while\s+true.*case.*\$opcion|reporte\(\)/i,
    commands: ['free', 'df', 'vmstat', 'date', 'awk', 'cut', 'grep'],
    difficulty: 'difícil',
  },

  {
    id: 'final-09', category: 'FINALES - Análisis de Discos',
    instruction: `El servidor de archivos está quedándose sin espacio y necesitan un análisis detallado.

Tareas:
1) Diseñe un script con menú que permita: a) mostrar el espacio usado por cada directorio en /home (ordenado de mayor a menor), b) buscar archivos mayores a 10MB en todo el sistema, c) mostrar particiones montadas y sus tipos, d) mostrar inodos usados de cada partición
2) Los directorios deben mostrarse con tamaño legible (human-readable)
3) Al buscar archivos grandes, mostrar tamaño y ruta
4) Si no se encuentran archivos grandes, mostrar mensaje

💡 Creá el archivo con: cat > script.sh (luego pegar el código y presionar Ctrl+D)
💡 Ejecutalo con: bash script.sh`,
    hint: `Usá: du -sh /*, sort -rh, find -size +10M, df -hT, df -i, lsblk, while, case. ${CREAR_EJECUTAR}`,
    solutionHint: `#!/bin/bash
pausar() {
  read -p "Presione [Enter] para continuar..."
}
while true; do
  clear
  echo "=== ANÁLISIS DE DISCOS ==="
  echo "a) Espacio por directorio"
  echo "b) Archivos grandes (+10MB)"
  echo "c) Particiones montadas"
  echo "d) Inodos"
  echo "e) Salir"
  read -p "Opción: " op
  case $op in
    a|A)
      echo "Tamaño  Directorio"
      du -sh /* 2>/dev/null | sort -rh | head -10
      ;;
    b|B)
      echo "Archivos mayores a 10MB:"
      archivos=\$(find /home -type f -size +10M 2>/dev/null)
      if [ -n "\$archivos" ]; then
        echo "\$archivos" | while read f; do
          echo "\$(du -sh "\$f" 2>/dev/null | awk '{print \$1}') - \$f"
        done
      else
        echo "No se encontraron archivos grandes"
      fi
      ;;
    c|C)
      df -hT | awk '{print \$1, \$2, \$7}'
      ;;
    d|D)
      df -i | awk '{print \$1, \$5}'
      ;;
    e|E) exit 0 ;;
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
  echo "       ANÁLISIS DE DISCOS - SERVIDOR          "
  echo "=============================================="
  echo "a. Espacio usado por directorio (/home)"
  echo "b. Buscar archivos mayores a 10MB"
  echo "c. Particiones montadas y tipo"
  echo "d. Uso de inodos por partición"
  echo "e. Salir"
  echo "=============================================="
  read -p "Seleccione una opción [a-e]: " opcion

  case "$opcion" in
    a|A)
      echo ""
      echo "--- ESPACIO POR DIRECTORIO EN /home ---"
      echo "TAMAÑO    DIRECTORIO"
      echo "----------------------------------------"
      du -sh /home/* 2>/dev/null | sort -rh | head -10
      echo ""
      echo "Total en /home: $(du -sh /home 2>/dev/null | awk '{print \$1}')"
      pausar
      ;;
    b|B)
      echo ""
      echo "--- ARCHIVOS MAYORES A 10MB ---"
      archivos=$(find /home -type f -size +10M 2>/dev/null)
      if [ -n "$archivos" ]; then
        echo "$archivos" | while read archivo; do
          tamano=$(du -h "$archivo" 2>/dev/null | awk '{print \$1}')
          echo "  $tamano  $archivo"
        done
        echo ""
        echo "Total: $(echo "$archivos" | wc -l) archivo(s)"
      else
        echo "No se encontraron archivos mayores a 10MB."
      fi
      pausar
      ;;
    c|C)
      echo ""
      echo "--- PARTICIONES MONTADAS ---"
      df -hT | head -1
      df -hT | tail -n+2 | awk '{printf "%-15s %-6s %s\n", \$1, \$2, \$7}'
      pausar
      ;;
    d|D)
      echo ""
      echo "--- USO DE INODOS ---"
      echo "DISPOSITIVO    USO%"
      echo "----------------------------------------"
      df -i | tail -n+2 | awk '{printf "%-14s %s\n", \$1, \$5}'
      pausar
      ;;
    e|E)
      echo ""
      echo "Saliendo del análisis de discos..."
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
       ANÁLISIS DE DISCOS - SERVIDOR
==============================================
a. Espacio usado por directorio (/home)
b. Buscar archivos mayores a 10MB
c. Particiones montadas y tipo
d. Uso de inodos por partición
e. Salir
==============================================
Seleccione una opción [a-e]: a

--- ESPACIO POR DIRECTORIO EN /home ---
TAMAÑO    DIRECTORIO
----------------------------------------
2.3G    /home/usuario
450M    /home/proyectos
120M    /home/compartido
Total en /home: 2.9G

--- Opción b: Archivos grandes ---
  15M  /home/usuario/backup_2024.tar.gz
  12M  /home/usuario/base_datos.sql
Total: 2 archivo(s)

--- Opción c: Particiones ---
/dev/sda1       ext4    /
/dev/sdb1       ext4    /var

--- Opción d: Inodos ---
/dev/sda1       35%
/dev/sdb1       62%`,
    initialState: goHome, validationType: 'text',
    expectedCommandRegex: /du\s+-sh\s+\/\*|du\s+-sh\s+\/home\*|sort\s+-rh|find.*-size\s+\+10M|df\s+-hT|df\s+-i|while\s+true.*case.*\$opcion/i,
    commands: ['du', 'sort', 'find', 'df', 'wc', 'awk'],
    difficulty: 'difícil',
  },

  {
    id: 'final-10', category: 'FINALES - Planificación de Tareas',
    instruction: `El área de sistemas necesita automatizar tareas de mantenimiento en el servidor.

Tareas:
1) Diseñe un script con menú que permita: a) programar un backup diario con cron a las 2:30 AM, b) programar una tarea única con at para dentro de 5 minutos, c) listar las tareas programadas en cron y at, d) eliminar una tarea de cron o at
2) Al programar con cron, debe permitir elegir el script a ejecutar
3) Al listar tareas, debe mostrar origen (cron/at) y la hora programada
4) Validar que el script a programar exista antes de agregarlo

💡 Creá el archivo con: cat > script.sh (luego pegar el código y presionar Ctrl+D)
💡 Ejecutalo con: bash script.sh`,
    hint: `Usá: crontab -l, crontab -e, at, atq, atrm, date, echo, cat, while, case, read. ${CREAR_EJECUTAR}`,
    solutionHint: `#!/bin/bash
pausar() {
  read -p "Presione [Enter] para continuar..."
}
while true; do
  clear
  echo "=== PLANIFICACIÓN DE TAREAS ==="
  echo "a) Programar backup diario (cron)"
  echo "b) Programar tarea única (at)"
  echo "c) Listar tareas"
  echo "d) Eliminar tarea"
  echo "e) Salir"
  read -p "Opción: " op
  case $op in
    a|A)
      read -p "Ruta del script: " s
      if [ -f "\$s" ]; then
        (crontab -l 2>/dev/null; echo "30 2 * * * \$s") | crontab -
        echo "Backup diario programado a las 2:30"
      else
        echo "El script \$s no existe"
      fi
      ;;
    b|B)
      echo "echo 'Tarea única ejecutada' > /home/usuario/at_log.txt" | at now + 5 minutes 2>/dev/null
      echo "Tarea programada para dentro de 5 minutos"
      ;;
    c|C)
      echo "--- TAREAS CRON ---"
      crontab -l 2>/dev/null || echo "Sin tareas cron"
      echo ""
      echo "--- TAREAS AT ---"
      atq 2>/dev/null || echo "Sin tareas at"
      ;;
    d|D)
      read -p "Número de tarea a eliminar (dígito): " n
      atrm "\$n" 2>/dev/null && echo "Tarea \$n eliminada" || echo "No se pudo eliminar"
      ;;
    e|E) exit 0 ;;
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
  echo "     PLANIFICACIÓN DE TAREAS - SISTEMAS       "
  echo "=============================================="
  echo "a. Programar backup diario con cron (2:30 AM)"
  echo "b. Programar tarea única con at (+5 min)"
  echo "c. Listar todas las tareas programadas"
  echo "d. Eliminar tarea programada"
  echo "e. Salir"
  echo "=============================================="
  read -p "Seleccione una opción [a-e]: " opcion

  case "$opcion" in
    a|A)
      echo ""
      read -p "Ruta del script a ejecutar: " script_ruta
      if [ -f "$script_ruta" ]; then
        echo ""
        echo "Programando: 30 2 * * * $script_ruta"
        (crontab -l 2>/dev/null; echo "30 2 * * * $script_ruta") | crontab -
        if [ $? -eq 0 ]; then
          echo "✅ Backup diario programado: todos los días a las 2:30 AM"
          echo ""
          echo "--- CRON ACTUAL ---"
          crontab -l
        else
          echo "❌ Error al programar cron"
        fi
      else
        echo "❌ Error: El script '$script_ruta' no existe"
      fi
      pausar
      ;;
    b|B)
      echo ""
      echo "--- PROGRAMAR TAREA ÚNICA ---"
      read -p "Comando a ejecutar: " comando
      echo ""
      echo "Programando: $comando (dentro de 5 minutos)"
      echo "$comando" | at now + 5 minutes 2>/dev/null
      if [ $? -eq 0 ]; then
        echo "✅ Tarea programada para dentro de 5 minutos"
        echo ""
        echo "--- COLA DE AT ---"
        atq 2>/dev/null
      else
        echo "❌ Error al programar con at"
      fi
      pausar
      ;;
    c|C)
      echo ""
      echo "=========================================="
      echo "      TAREAS PROGRAMADAS"
      echo "=========================================="
      echo ""
      echo "--- CRON ---"
      echo "Origen: cron"
      tareas_cron=$(crontab -l 2>/dev/null)
      if [ -z "$tareas_cron" ]; then
        echo "  No hay tareas programadas en cron."
      else
        echo "$tareas_cron" | while read linea; do
          echo "  $linea"
        done
      fi
      echo ""
      echo "--- AT ---"
      echo "Origen: at"
      tareas_at=$(atq 2>/dev/null)
      if [ -z "$tareas_at" ]; then
        echo "  No hay tareas programadas en at."
      else
        echo "$tareas_at" | while read linea; do
          echo "  $linea"
        done
      fi
      pausar
      ;;
    d|D)
      echo ""
      echo "--- TAREAS AT ACTUALES ---"
      atq 2>/dev/null || echo "No hay tareas at."
      echo ""
      read -p "Ingrese el ID de la tarea a eliminar: " tarea_id
      atrm "$tarea_id" 2>/dev/null
      if [ $? -eq 0 ]; then
        echo "✅ Tarea '$tarea_id' eliminada"
      else
        echo "❌ No se pudo eliminar la tarea '$tarea_id'"
      fi
      pausar
      ;;
    e|E)
      echo ""
      echo "Saliendo del planificador..."
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
     PLANIFICACIÓN DE TAREAS - SISTEMAS
==============================================
a. Programar backup diario con cron (2:30 AM)
b. Programar tarea única con at (+5 min)
c. Listar todas las tareas programadas
d. Eliminar tarea programada
e. Salir
==============================================
Seleccione una opción [a-e]: a
Ruta del script a ejecutar: /home/usuario/backup.sh
Programando: 30 2 * * * /home/usuario/backup.sh
✅ Backup diario programado: todos los días a las 2:30 AM
--- CRON ACTUAL ---
30 2 * * * /home/usuario/backup.sh

--- Opción b: Tarea única ---
Comando a ejecutar: echo "mantenimiento" > /tmp/ok.log
✅ Tarea programada para dentro de 5 minutos

--- Opción c: Listar tareas ---
--- CRON ---
  30 2 * * * /home/usuario/backup.sh
--- AT ---
  5   Fri Jul 17 10:05:00 2026 a usuario

--- Opción d: Eliminar tarea ---
Tarea '5' eliminada`,
    initialState: goHome, validationType: 'text',
    expectedCommandRegex: /crontab\s+-l|crontab\s+-e|at\s+now|atq|atrm|date|while\s+true.*case.*\$opcion|echo.*\|.*at/i,
    commands: ['crontab', 'at', 'atq', 'atrm', 'echo', 'date'],
    difficulty: 'difícil',
  },

  {
    id: 'final-11', category: 'FINALES - Compresión y Archivado',
    instruction: `El departamento de diseño necesita gestionar la compresión y archivado de sus proyectos.

Tareas:
1) Diseñe un script con menú que permita: a) comprimir un directorio en tar.gz con fecha en el nombre, b) comprimir un directorio en zip con contraseña, c) extraer cualquier formato (tar.gz, tar.bz2, zip), d) listar el contenido de un archivo comprimido sin extraerlo
2) Cada archivo comprimido debe guardarse en /home/usuario/archivos/
3) Al comprimir, debe mostrar el tamaño original y comprimido (ratio)
4) Al extraer, debe detectar automáticamente el formato

💡 Creá el archivo con: cat > script.sh (luego pegar el código y presionar Ctrl+D)
💡 Ejecutalo con: bash script.sh`,
    hint: `Usá: tar czf, tar xzf, tar tzf, zip -r -P, unzip -P, du -sh, date +%Y%m%d, while, case. ${CREAR_EJECUTAR}`,
    solutionHint: `#!/bin/bash
DIR="/home/usuario/archivos"
mkdir -p "\$DIR"
pausar() {
  read -p "Presione [Enter] para continuar..."
}
while true; do
  clear
  echo "=== COMPRESIÓN Y ARCHIVADO ==="
  echo "a) Comprimir tar.gz"
  echo "b) Comprimir zip"
  echo "c) Extraer archivo"
  echo "d) Listar contenido"
  echo "e) Salir"
  read -p "Opción: " op
  case $op in
    a|A)
      read -p "Directorio: " d
      if [ -d "\$d" ]; then
        f="\$DIR/backup_\$(date +%Y%m%d_%H%M).tar.gz"
        orig=\$(du -sh "\$d" | awk '{print \$1}')
        tar czf "\$f" "\$d" 2>/dev/null
        comp=\$(du -sh "\$f" | awk '{print \$1}')
        echo "Original: \$orig | Comprimido: \$comp"
      else
        echo "No existe"
      fi
      ;;
    b|B)
      read -p "Directorio: " d
      if [ -d "\$d" ]; then
        f="\$DIR/backup_\$(date +%Y%m%d_%H%M).zip"
        read -s -p "Contraseña: " p
        echo
        zip -r -P "\$p" "\$f" "\$d" 2>/dev/null
        echo "Creado: \$f"
      else
        echo "No existe"
      fi
      ;;
    c|C)
      read -p "Archivo: " f
      if [ ! -f "\$f" ]; then echo "No existe"; continue; fi
      case "\$f" in
        *.tar.gz|*.tgz) tar xzf "\$f" 2>/dev/null && echo "Extraído tar.gz" ;;
        *.zip) read -s -p "Contraseña: " p; echo; unzip -P "\$p" "\$f" 2>/dev/null && echo "Extraído zip" ;;
        *) echo "Formato no soportado" ;;
      esac
      ;;
    d|D)
      read -p "Archivo: " f
      if [ ! -f "\$f" ]; then echo "No existe"; continue; fi
      case "\$f" in
        *.tar.gz|*.tgz) tar tzf "\$f" | head -20 ;;
        *.zip) unzip -l "\$f" 2>/dev/null | head -20 ;;
        *) echo "Formato no soportado" ;;
      esac
      ;;
    e|E) exit 0 ;;
  esac
  pausar
done`,
    executionCommand: `#!/bin/bash
ARCHIVOS="/home/usuario/archivos"
mkdir -p "$ARCHIVOS"
pausar() {
  echo ""
  read -p "Presione [Enter] para continuar..."
}

comprimir_tar() {
  read -p "Ingrese el directorio a comprimir: " directorio
  if [ ! -d "$directorio" ]; then
    echo "❌ Error: '$directorio' no existe"
    return
  fi
  fecha=$(date +%Y%m%d_%H%M)
  nombre_base=$(basename "$directorio")
  salida="$ARCHIVOS/\${nombre_base}_\$fecha.tar.gz"
  echo "📦 Comprimiendo $directorio ..."
  orig=$(du -sh "$directorio" | awk '{print \$1}')
  tar czf "$salida" "$directorio" 2>/dev/null
  if [ $? -eq 0 ]; then
    comp=$(du -sh "$salida" | awk '{print \$1}')
    echo "✅ Creado: $salida"
    echo "   Tamaño original: $orig"
    echo "   Tamaño comprimido: $comp"
  else
    echo "❌ Error al comprimir"
  fi
}

comprimir_zip() {
  read -p "Ingrese el directorio a comprimir: " directorio
  if [ ! -d "$directorio" ]; then
    echo "❌ Error: '$directorio' no existe"
    return
  fi
  fecha=$(date +%Y%m%d_%H%M)
  nombre_base=$(basename "$directorio")
  salida="$ARCHIVOS/\${nombre_base}_\$fecha.zip"
  read -s -p "Ingrese contraseña: " pass
  echo ""
  echo "📦 Comprimiendo $directorio ..."
  zip -r -P "$pass" "$salida" "$directorio" 2>/dev/null
  if [ $? -eq 0 ]; then
    echo "✅ ZIP creado: $salida (protegido)"
  else
    echo "❌ Error al comprimir en ZIP"
  fi
}

extraer() {
  read -p "Ingrese el archivo a extraer: " archivo
  if [ ! -f "$archivo" ]; then
    echo "❌ Error: '$archivo' no existe"
    return
  fi
  echo "📂 Detectando formato..."
  case "$archivo" in
    *.tar.gz|*.tgz)
      echo "   Formato: tar.gz"
      tar xzf "$archivo" 2>/dev/null
      [ $? -eq 0 ] && echo "✅ Extraído correctamente" || echo "❌ Error al extraer"
      ;;
    *.zip)
      echo "   Formato: zip"
      read -s -p "Contraseña (si tiene): " pass
      echo ""
      [ -z "$pass" ] && unzip "$archivo" 2>/dev/null || unzip -P "$pass" "$archivo" 2>/dev/null
      [ $? -eq 0 ] && echo "✅ Extraído correctamente" || echo "❌ Error al extraer"
      ;;
    *)
      echo "❌ Formato no soportado"
      ;;
  esac
}

listar() {
  read -p "Ingrese el archivo a inspeccionar: " archivo
  if [ ! -f "$archivo" ]; then
    echo "❌ Error: '$archivo' no existe"
    return
  fi
  echo ""
  echo "--- CONTENIDO ---"
  case "$archivo" in
    *.tar.gz|*.tgz)
      tar tzf "$archivo" 2>/dev/null | head -20
      ;;
    *.zip)
      unzip -l "$archivo" 2>/dev/null | head -20
      ;;
    *)
      echo "Formato no soportado"
      ;;
  esac
}

while true; do
  clear
  echo "=============================================="
  echo "     COMPRESIÓN Y ARCHIVADO - DISEÑO          "
  echo "=============================================="
  echo "a. Comprimir directorio en tar.gz"
  echo "b. Comprimir directorio en zip (con contraseña)"
  echo "c. Extraer archivo (auto-detecta formato)"
  echo "d. Listar contenido de un comprimido"
  echo "e. Salir"
  echo "=============================================="
  read -p "Seleccione una opción [a-e]: " opcion

  case "$opcion" in
    a|A) comprimir_tar ;;
    b|B) comprimir_zip ;;
    c|C) extraer ;;
    d|D) listar ;;
    e|E)
      echo ""
      echo "Saliendo..."
      exit 0
      ;;
    *)
      echo ""
      echo "Opción inválida."
      pausar
      ;;
  esac
  pausar
done`,
    expectedOutput: `$ bash script.sh
==============================================
     COMPRESIÓN Y ARCHIVADO - DISEÑO
==============================================
a. Comprimir directorio en tar.gz
b. Comprimir directorio en zip (con contraseña)
c. Extraer archivo (auto-detecta formato)
d. Listar contenido de un comprimido
e. Salir
==============================================
Seleccione una opción [a-e]: a
Ingrese el directorio a comprimir: /home/usuario/proyecto
📦 Comprimiendo /home/usuario/proyecto ...
✅ Creado: /home/usuario/archivos/proyecto_20240717_1000.tar.gz
   Tamaño original: 45M
   Tamaño comprimido: 12M

--- Opción b: ZIP con contraseña ---
📦 Comprimiendo /home/usuario/proyecto ...
✅ ZIP creado: /home/usuario/archivos/proyecto_20240717_1005.zip (protegido)

--- Opción d: Listar contenido ---
--- CONTENIDO de proyecto.tar.gz ---
proyecto/
proyecto/src/
proyecto/src/main.sh
proyecto/docs/
proyecto/docs/manual.pdf`,
    initialState: goHome, validationType: 'text',
    expectedCommandRegex: /tar\s+czf|tar\s+xzf|tar\s+tzf|zip\s+-r.*-P|unzip\s+-l|unzip.*-P|du\s+-sh|date.*%Y%m%d|while\s+true.*case.*\$opcion/i,
    commands: ['tar', 'gzip', 'zip', 'unzip', 'du', 'date', 'mkdir'],
    difficulty: 'difícil',
  },

  {
    id: 'final-12', category: 'FINALES - Seguridad y Auditoría',
    instruction: `El departamento de seguridad informática necesita reforzar los permisos del servidor.

Tareas:
1) Diseñe un script con menú que permita: a) escanear archivos con permisos inseguros (world-writable, setuid, setgid), b) cambiar propietario grupo de un archivo, c) crear un usuario con grupo secundario específico, d) generar un reporte de seguridad con todos los hallazgos
2) El escaneo debe diferenciar entre archivos world-writable y setuid/setgid
3) Al cambiar propietario, validar que el archivo exista
4) El reporte debe incluir fecha del análisis y resumen de hallazgos

💡 Creá el archivo con: cat > script.sh (luego pegar el código y presionar Ctrl+D)
💡 Ejecutalo con: bash script.sh`,
    hint: `Usá: find -perm /o+w, find -perm /4000, find -perm /2000, chown, chgrp, useradd -m, usermod -aG, date, while, case. ${CREAR_EJECUTAR}`,
    solutionHint: `#!/bin/bash
REPORTE="/home/usuario/reporte_seguridad.txt"
pausar() {
  read -p "Presione [Enter] para continuar..."
}
escanear() {
  echo "--- WORLD-WRITABLE ---"
  find /home -type f -perm /o+w -ls 2>/dev/null
  echo "--- SETUID ---"
  find /home -type f -perm /4000 -ls 2>/dev/null
  echo "--- SETGID ---"
  find /home -type f -perm /2000 -ls 2>/dev/null
}
while true; do
  clear
  echo "=== SEGURIDAD Y AUDITORÍA ==="
  echo "a) Escanear inseguros"
  echo "b) Cambiar propietario/grupo"
  echo "c) Crear usuario con grupo"
  echo "d) Generar reporte"
  echo "e) Salir"
  read -p "Opción: " op
  case $op in
    a|A)
      escanear
      echo ""
      echo "Total world-writable: \$(find /home -type f -perm /o+w 2>/dev/null | wc -l)"
      echo "Total setuid: \$(find /home -type f -perm /4000 2>/dev/null | wc -l)"
      echo "Total setgid: \$(find /home -type f -perm /2000 2>/dev/null | wc -l)"
      ;;
    b|B)
      read -p "Archivo: " f
      if [ -f "\$f" ]; then
        read -p "Nuevo dueño:grupo (ej: admin:seguridad): " d
        chown "\$d" "\$f" 2>/dev/null && echo "Cambiado" || echo "Error"
      else
        echo "No existe"
      fi
      ;;
    c|C)
      read -p "Usuario: " u
      useradd -m "\$u" 2>/dev/null && echo "Usuario \$u creado" || echo "Ya existe o error"
      read -p "Grupo secundario: " g
      groupadd "\$g" 2>/dev/null
      usermod -aG "\$g" "\$u" 2>/dev/null && echo "Asignado a \$g" || echo "Error al asignar grupo"
      ;;
    d|D)
      {
        echo "REPORTE DE SEGURIDAD - \$(date)"
        escanear
        echo ""
        echo "World-writable: \$(find /home -type f -perm /o+w 2>/dev/null | wc -l)"
        echo "Setuid: \$(find /home -type f -perm /4000 2>/dev/null | wc -l)"
        echo "Setgid: \$(find /home -type f -perm /2000 2>/dev/null | wc -l)"
      } > "\$REPORTE"
      echo "Reporte generado en \$REPORTE"
      ;;
    e|E) exit 0 ;;
  esac
  pausar
done`,
    executionCommand: `#!/bin/bash
REPORTE="/home/usuario/reporte_seguridad.txt"
pausar() {
  echo ""
  read -p "Presione [Enter] para continuar..."
}

escanear() {
  echo ""
  echo "=========================================="
  echo "     ANÁLISIS DE PERMISOS INSEGUROS       "
  echo "=========================================="
  echo ""
  
  echo "1. ARCHIVOS WORLD-WRITABLE (escritura para otros):"
  ww=$(find /home -type f -perm /o+w 2>/dev/null)
  if [ -n "$ww" ]; then
    echo "$ww" | while read f; do
      ls -la "$f" 2>/dev/null | awk '{printf "   %s %s\n", \$1, \$NF}'
    done
  else
    echo "   No se encontraron archivos world-writable."
  fi
  echo ""
  
  echo "2. ARCHIVOS CON SETUID (permiso 4000):"
  suid=$(find /home -type f -perm /4000 2>/dev/null)
  if [ -n "$suid" ]; then
    echo "$suid" | while read f; do
      ls -la "$f" 2>/dev/null | awk '{printf "   %s %s\n", \$1, \$NF}'
    done
  else
    echo "   No se encontraron archivos SUID."
  fi
  echo ""
  
  echo "3. ARCHIVOS CON SETGID (permiso 2000):"
  sgid=$(find /home -type f -perm /2000 2>/dev/null)
  if [ -n "$sgid" ]; then
    echo "$sgid" | while read f; do
      ls -la "$f" 2>/dev/null | awk '{printf "   %s %s\n", \$1, \$NF}'
    done
  else
    echo "   No se encontraron archivos SGID."
  fi
}

cambiar_duenio() {
  read -p "Ingrese la ruta del archivo: " archivo
  if [ ! -f "$archivo" ]; then
    echo "❌ Error: el archivo '$archivo' no existe"
    return
  fi
  echo ""
  echo "Dueño actual: $(ls -la "$archivo" | awk '{print \$3":"\$4}')"
  read -p "Nuevo dueño y grupo (formato: usuario:grupo): " duenio
  chown "$duenio" "$archivo" 2>/dev/null
  if [ $? -eq 0 ]; then
    echo "✅ Propietario cambiado a '$duenio'"
    ls -la "$archivo" | awk '{print "   " \$1, \$3":"\$4, \$NF}'
  else
    echo "❌ Error: usuario o grupo inválido"
  fi
}

crear_usuario() {
  read -p "Nombre del nuevo usuario: " usuario
  useradd -m "$usuario" 2>/dev/null
  if [ $? -eq 0 ]; then
    echo "✅ Usuario '$usuario' creado con home"
    read -p "Grupo secundario para '$usuario': " grupo
    groupadd "$grupo" 2>/dev/null && echo "   Grupo '$grupo' creado"
    usermod -aG "$grupo" "$usuario" 2>/dev/null
    if [ $? -eq 0 ]; then
      echo "✅ Usuario '$usuario' asignado al grupo '$grupo'"
      groups "$usuario"
    fi
  else
    echo "❌ Error: el usuario '$usuario' ya existe"
  fi
}

generar_reporte() {
  echo ""
  echo "Generando reporte de seguridad..."
  {
    echo "=========================================="
    echo "   REPORTE DE SEGURIDAD - AUDITORÍA"
    echo "=========================================="
    echo "Fecha: $(date)"
    echo "Sistema: $(hostname 2>/dev/null || echo 'localhost')"
    echo "Usuario: $(whoami)"
    echo ""
    
    echo "--- ARCHIVOS WORLD-WRITABLE ---"
    find /home -type f -perm /o+w 2>/dev/null | while read f; do
      ls -la "$f" 2>/dev/null
    done
    ww_count=$(find /home -type f -perm /o+w 2>/dev/null | wc -l)
    echo "Total: $ww_count"
    echo ""
    
    echo "--- ARCHIVOS SETUID ---"
    find /home -type f -perm /4000 2>/dev/null | while read f; do
      ls -la "$f" 2>/dev/null
    done
    suid_count=$(find /home -type f -perm /4000 2>/dev/null | wc -l)
    echo "Total: $suid_count"
    echo ""
    
    echo "--- ARCHIVOS SETGID ---"
    find /home -type f -perm /2000 2>/dev/null | while read f; do
      ls -la "$f" 2>/dev/null
    done
    sgid_count=$(find /home -type f -perm /2000 2>/dev/null | wc -l)
    echo "Total: $sgid_count"
    echo ""
    
    echo "=========================================="
    echo "RESUMEN:"
    echo "  World-writable: $ww_count"
    echo "  SUID: $suid_count"
    echo "  SGID: $sgid_count"
    echo "=========================================="
  } > "$REPORTE"
  echo "✅ Reporte generado: $REPORTE"
}

while true; do
  clear
  echo "=============================================="
  echo "     SEGURIDAD Y AUDITORÍA - SERVIDOR         "
  echo "=============================================="
  echo "a. Escanear permisos inseguros"
  echo "b. Cambiar propietario y grupo"
  echo "c. Crear usuario con grupo secundario"
  echo "d. Generar reporte de seguridad"
  echo "e. Salir"
  echo "=============================================="
  read -p "Seleccione una opción [a-e]: " opcion

  case "$opcion" in
    a|A) escanear; pausar ;;
    b|B) cambiar_duenio; pausar ;;
    c|C) crear_usuario; pausar ;;
    d|D) generar_reporte; pausar ;;
    e|E)
      echo ""
      echo "Saliendo de la auditoría..."
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
     SEGURIDAD Y AUDITORÍA - SERVIDOR
==============================================
a. Escanear permisos inseguros
b. Cambiar propietario y grupo
c. Crear usuario con grupo secundario
d. Generar reporte de seguridad
e. Salir
==============================================
Seleccione una opción [a-e]: a

--- ANÁLISIS DE PERMISOS ---
1. ARCHIVOS WORLD-WRITABLE:
   -rwxrwxrwx  /home/usuario/documentos/informe.txt
2. ARCHIVOS SUID:
   No se encontraron archivos SUID.
3. ARCHIVOS SGID:
   No se encontraron archivos SGID.

--- Opción b: Cambiar propietario ---
Archivo: /home/usuario/script.sh
Dueño actual: usuario:usuarios
Nuevo dueño y grupo (formato: usuario:grupo): admin:seguridad
✅ Propietario cambiado a 'admin:seguridad'

--- Opción c: Crear usuario ---
✅ Usuario 'jperez' creado con home
✅ Usuario 'jperez' asignado al grupo 'ventas'

--- Opción d: Reporte ---
✅ Reporte generado: /home/usuario/reporte_seguridad.txt`,
    initialState: goHome, validationType: 'text',
    expectedCommandRegex: /find.*-perm.*\/o\+w|find.*-perm.*\/4000|find.*-perm.*\/2000|chown|chgrp|useradd\s+-m|usermod\s+-aG|groupadd|while\s+true.*case.*\$opcion/i,
    commands: ['find', 'chown', 'chgrp', 'useradd', 'usermod', 'groupadd', 'date', 'wc'],
    difficulty: 'difícil',
  },

  // ============================
  // FINAL - Script con menú y gestión de directorios
  // ============================
  {
    id: 'final-dirmenu', category: 'FINALES - Script Menú Directorios',
    instruction: `Se pide:

1) Crear un script Bash que reciba como único parámetro un directorio. El script debe validar que el parámetro fue proporcionado y que es un directorio válido. Si no se cumple, mostrar un mensaje de error y salir.

El script debe presentar un menú con las siguientes opciones:

A) Mostrar la cantidad de archivos regulares del directorio recibido.
B) Mostrar la cantidad de archivos cuyos nombres comiencen con la letra "b" (case-insensitive).
C) Copiar el contenido del directorio a un directorio destino solicitado al usuario. Si el directorio destino no existe, crearlo automáticamente.
D) Comprimir y empaquetar el directorio recibido como parámetro, generando un archivo en formato .tgz con el nombre "<directorio>.tgz" en la ubicación actual.
E) Salir.

El menú debe repetirse hasta que el usuario elija la opción E.

2) Responder brevemente:
a) ¿Qué hace el comando "free -m"? ¿Qué significan las columnas "used" y "available"?
b) ¿Qué hace el comando "mount"? Mencione un ejemplo de uso.
c) ¿Cuál es la diferencia entre "rm -r" y "rm -rf"?
d) ¿Qué hace el comando "chmod 755 archivo.sh"? Explique los permisos resultantes.
e) ¿Qué significa el operador "|" (pipe) en Linux? Dé un ejemplo.`,
    hint: `Usá: if [ $# -eq 1 ], if [ -d "$1" ], find "$dir" -maxdepth 1 -type f | wc -l, find "$dir" -maxdepth 1 -type f -iname "b*" | wc -l, cp -r, tar czf. ${CREAR_EJECUTAR}`,
    solutionHint: `#!/bin/bash
if [ $# -ne 1 ]; then
  echo "Uso: $0 <directorio>"
  exit 1
fi
if [ ! -d "$1" ]; then
  echo "Error: '$1' no es un directorio válido."
  exit 1
fi
DIR="$1"
while true; do
  echo ""
  echo "=== GESTIÓN DE DIRECTORIOS ==="
  echo "A) Cantidad de archivos regulares"
  echo "B) Archivos que comienzan con 'b'"
  echo "C) Copiar contenido a directorio destino"
  echo "D) Comprimir en .tgz"
  echo "E) Salir"
  echo -n "Seleccione una opción: "
  read op
  case $op in
    a|A)
      cant=$(find "$DIR" -maxdepth 1 -type f | wc -l)
      echo "El directorio '$DIR' tiene $cant archivos regulares."
      ;;
    b|B)
      cant=$(find "$DIR" -maxdepth 1 -type f -iname "b*" | wc -l)
      echo "Hay $cant archivos que comienzan con 'b' en '$DIR'."
      ;;
    c|C)
      echo -n "Ingrese directorio destino: "
      read destino
      mkdir -p "$destino"
      cp -r "$DIR"/* "$destino"/
      echo "Contenido copiado a '$destino'."
      ;;
    d|D)
      tar czf "$(basename "$DIR").tgz" "$DIR"
      echo "Archivo '$(basename "$DIR").tgz' generado."
      ;;
    e|E)
      echo "Saliendo..."
      exit 0
      ;;
    *)
      echo "Opción inválida."
      ;;
  esac
done`,
    expectedOutput: `$ bash dirmenu.sh /home/usuario/dire
Error: falta el parámetro directorio.

$ bash dirmenu.sh /home/usuario/noexiste
Error: '/home/usuario/noexiste' no es un directorio válido.

$ bash dirmenu.sh /home/usuario/dire

=== GESTIÓN DE DIRECTORIOS ===
A) Cantidad de archivos regulares
B) Archivos que comienzan con 'b'
C) Copiar contenido a directorio destino
D) Comprimir en .tgz
E) Salir
Seleccione una opción: A
El directorio '/home/usuario/dire' tiene 5 archivos regulares.

Seleccione una opción: B
Hay 1 archivos que comienzan con 'b' en '/home/usuario/dire'.

Seleccione una opción: C
Ingrese directorio destino: /home/usuario/backup
Contenido copiado a '/home/usuario/backup'.

Seleccione una选项: D
Archivo 'dire.tgz' generado.

Seleccione una opción: E
Saliendo...`,
    initialState: goHome, validationType: 'text',
    expectedCommandRegex: /if\s+\[\s+\$#.*-ne\s+1\s+\]|if\s+\[\s+!.*-d|find.*-maxdepth.*-type\s+f.*wc\s+-l|find.*-iname.*wc\s+-l|cp\s+-r|mkdir\s+-p|tar\s+czf|free\s+-m|mount|rm\s+-[r]+f|chmod\s+7[0-7]{2}\|/i,
    commands: ['find', 'wc', 'cp', 'mkdir', 'tar', 'free', 'mount', 'chmod', 'rm'],
    difficulty: 'difícil',
  },

];

