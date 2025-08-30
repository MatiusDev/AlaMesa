# Guía de Despliegue y Entornos

Este documento describe el flujo de trabajo para el desarrollo, la integración continua y el despliegue de la aplicación AlaMesa.

## 1. Flujo de Desarrollo Local

Para el desarrollo local, la aplicación se orquesta con Docker Compose para asegurar la paridad con el entorno de producción.

### Variables de Entorno (`.env`)

La configuración local se gestiona en un archivo `.env` en la raíz del proyecto. **Este archivo está en `.gitignore` y no debe subirse al repositorio.**

Un nuevo desarrollador debe crear su propio archivo `.env` basándose en la siguiente plantilla:

```env
# Endpoints y Puertos
SERVER_HOST=0.0.0.0
SERVER_PORT=8000

# Base de Datos - PostgreSQL
POSTGRES_HOST=postgresql
POSTGRES_DB=alamesa_db
POSTGRES_USER=alamesa_user
POSTGRES_PASSWORD=alamesa_password

# Base de Datos - MongoDB
MONGODB_URI=mongodb://mongodb:27017/alamesa_db
MONGO_INITDB_ROOT_USERNAME=alamesa_user
MONGO_INITDB_ROOT_PASSWORD=alamesa_password

# Servicios de Terceros
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx

# Variable de Entorno (dev/prod)
ENVIRONMENT=dev
```

### Ejecución Local

Para levantar todo el entorno de desarrollo (backend, frontend y bases de datos), ejecuta:

```bash
docker compose up
```

Gracias a los volúmenes definidos, cualquier cambio en el código fuente se reflejará al instante en los contenedores.

## 2. Pipelines de CI/CD (GitHub Actions)

El repositorio utiliza GitHub Actions para la integración y el despliegue continuo.

### a. Workflow de Desarrollo (`development.yml`)

- **Disparador:** Se activa en cada `push` a la rama `development`.
- **Acción:** Construye las imágenes de Docker para el `backend` y el `frontend` y las publica en el registro de contenedores de GitHub (`ghcr.io`) con la etiqueta `development`.

### b. Workflow de Producción (`production.yml`)

- **Disparador:** Se activa en cada `push` a la rama `production`.
- **Acción:** Despliega la última versión de la aplicación en el servidor de producción (VPS).

## 3. Configuración para Despliegue en Producción

Esta sección es una guía completa para configurar un servidor VPS desde cero y desplegar la aplicación.

### 3.1. Secretos de Repositorio en GitHub

El pipeline de producción necesita los siguientes secretos configurados en **Settings > Secrets and variables > Actions** (en el entorno `production`):

- `PRODUCTION_HOST`: La dirección IP del servidor VPS.
- `PRODUCTION_USER`: El nombre de usuario para conectarse por SSH (ej. `ubuntu`, `root`).
- `PRODUCTION_SSH_KEY`: La clave SSH privada para acceder al servidor.
- `WEB_ROOT`: La ruta absoluta en el servidor donde se alojarán los archivos del frontend (ej. `/var/www/reservasalamesa.shop`).
- `MONGODB_URI`, `POSTGRES_DB`, etc.: Todas las demás variables de la aplicación para el entorno de producción.

### 3.2. Configuración Inicial del Servidor (VPS)

#### a. Firewall

Se deben configurar las siguientes reglas de **entrada (Incoming)** en el firewall del servidor para permitir el tráfico web:

1.  **Permitir HTTP (Puerto 80):**
    - **Uso:** Necesario para la validación inicial de Let's Encrypt y para redirigir a los usuarios a la versión segura del sitio.
    - **Regla:** Permitir tráfico de **entrada** por `TCP` en el puerto `80` desde `Cualquier Origen`.

2.  **Permitir HTTPS (Puerto 443):**
    - **Uso:** Permite el acceso al sitio web de forma segura.
    - **Regla:** Permitir tráfico de **entrada** por `TCP` en el puerto `443` desde `Cualquier Origen`.

Adicionalmente, asegúrate de que el tráfico de **salida (Outgoing)** por `TCP` en el puerto `443` esté permitido para que el servidor pueda clonar el repositorio desde GitHub.

#### b. Software Requerido

Asegúrate de que en el servidor estén instalados:
- **Docker**
- **Docker Compose** (V2, se invoca con `docker compose`)
- **Nginx**

#### c. Configuración de Nginx

Crea o edita el archivo de configuración del sitio (ej. `/etc/nginx/sites-enabled/default`) para que apunte a la carpeta del frontend y gestione correctamente las rutas de la SPA (React).

```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    # Ruta donde el pipeline copia los archivos del frontend
    root /var/www/reservasalamesa.shop; # <- Reemplazar con tu WEB_ROOT

    index index.html;

    server_name reservasalamesa.shop www.reservasalamesa.shop; # <- Reemplazar con tu dominio

    location / {
        # Redirige todas las peticiones a index.html para que React Router funcione
        try_files $uri $uri/ /index.html;
    }
}
```
Después de editar, verifica y recarga la configuración:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 3.3. Configuración de DNS

En tu proveedor de dominio, crea **dos registros de tipo "A"** que apunten a la IP de tu servidor:

1.  **Registro Raíz:**
    - **Tipo:** `A`
    - **Host:** `@`
    - **Valor:** La IP de tu VPS.

2.  **Registro `www`:**
    - **Tipo:** `A`
    - **Host:** `www`
    - **Valor:** La IP de tu VPS.

### 3.4. Certificado SSL (HTTPS) con Certbot

Para asegurar el sitio con `https://`, se usa Let's Encrypt y Certbot.

1.  **Instalar Certbot:**
    ```bash
    sudo snap install core; sudo snap refresh core
    sudo snap install --classic certbot
    sudo ln -s /snap/bin/certbot /usr/bin/certbot
    ```

2.  **Obtener y Configurar el Certificado:**
    Este comando obtiene el certificado, lo instala y modifica Nginx automáticamente para usarlo y forzar la redirección a HTTPS.
    ```bash
    sudo certbot --nginx -d reservasalamesa.shop -d www.reservasalamesa.shop # <- Reemplazar con tu dominio
    ```
    - Sigue las instrucciones: proporciona un email y acepta los términos.
    - Cuando pregunte si deseas redirigir HTTP a HTTPS, **selecciona la opción 2 (Redirect)**.

3.  **Verificar Renovación Automática:**
    Certbot se encarga de renovar el certificado automáticamente. Puedes verificar que el proceso de renovación está bien configurado con:
    ```bash
    sudo certbot renew --dry-run
    ```
    Si no hay errores, no necesitas hacer nada más.