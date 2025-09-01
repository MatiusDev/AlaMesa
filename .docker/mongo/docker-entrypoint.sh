#!/bin/bash
set -e

# Establecer permisos seguros para el keyfile
if [ -f "/etc/mongo/keyfile" ]; then
    echo "Estableciendo permisos para el keyfile..."
    chmod 400 /etc/mongo/keyfile
    chown mongodb:mongodb /etc/mongo/keyfile
fi

# Ejecutar el entrypoint original de la imagen de MongoDB,
# pasándole todos los argumentos que nosotros recibimos.
# Esto asegura que la creación del usuario y otras inicializaciones se ejecuten correctamente.
echo "Cediendo control al entrypoint original de MongoDB..."
exec /usr/local/bin/docker-entrypoint.sh "$@"
