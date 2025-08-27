# Guía de Despliegue y Entornos

Este documento describe el flujo de trabajo para el desarrollo, la integración continua y el despliegue de la aplicación AlaMesa.

## 1. Gestión de Variables de Entorno

La configuración de la aplicación se gestiona a través de variables de entorno para mantener los secretos fuera del control de versiones y facilitar la configuración en diferentes ambientes.

### Archivo `.env`

Para el desarrollo local, todas las variables de entorno se definen en un archivo `.env` ubicado en la raíz del proyecto. **Este archivo está incluido en el `.gitignore` y no debe ser subido al repositorio.**

Un nuevo desarrollador debe crear su propio archivo `.env` basándose en la siguiente plantilla:

```
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

## 2. Flujo de Desarrollo Local

La forma recomendada para desarrollar es utilizando Docker Compose para asegurar la paridad entre el entorno de desarrollo y el de producción.

### Archivos de Compose

Se utilizan dos archivos para gestionar el entorno:

- **`docker-compose.yml`**: Contiene la configuración base y común para todos los entornos (definición de servicios, redes, dependencias).
- **`docker-compose.override.yml`**: Contiene la configuración **exclusiva para desarrollo**. Este archivo es ignorado por Git y no se usa en producción. Activa la recarga automática del backend y establece `ENVIRONMENT=dev`.

### Ejecución

Para levantar todo el entorno de desarrollo (backend, frontend y bases de datos), simplemente ejecuta:

```bash
docker-compose up
```

Docker Compose leerá y combinará automáticamente ambos archivos. Gracias a los volúmenes definidos en el `override`, cualquier cambio en el código fuente se reflejará al instante en los contenedores.

## 3. Pipeline de CI/CD con GitHub Actions

El repositorio está configurado con un pipeline de Integración Continua definido en `.github/workflows/ci.yml`.

### Disparadores (Triggers)

El workflow se ejecuta automáticamente en los siguientes eventos:

- `push` a la rama `development`.
- `pull_request` que apunta a la rama `development`.

### Registro de Contenedores: ghcr.io

Este proyecto utiliza **GitHub Container Registry (`ghcr.io`)** para almacenar las imágenes de Docker, en lugar de Docker Hub.

- **Autenticación Automática:** El pipeline se autentica de forma segura y automática utilizando un `GITHUB_TOKEN` que GitHub Actions genera en cada ejecución. No es necesario gestionar secretos de Docker Hub.
- **Nomenclatura de Imágenes:** Las imágenes se nombran siguiendo el patrón `ghcr.io/PROPIETARIO_DEL_REPO/NOMBRE_DEL_REPO/NOMBRE_IMAGEN:latest`.

### Funcionamiento

El pipeline realiza los siguientes pasos:

1.  Inicia sesión en `ghcr.io`.
2.  Construye las imágenes de Docker para el `backend` y el `frontend`.
3.  Publica (hace `push`) de las imágenes construidas en `ghcr.io`.

Una vez finalizado, las imágenes estarán disponibles en la sección **"Packages"** de la página del repositorio en GitHub.
