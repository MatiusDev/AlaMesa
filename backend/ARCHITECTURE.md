# Arquitectura del Backend de AlaMesa

## 1. Introducción

El backend de AlaMesa es una API moderna y robusta construida con Python y el framework **FastAPI**. Sigue una arquitectura limpia en capas, diseñada para ser escalable, mantenible y fácil de probar. El sistema utiliza un enfoque de base de datos híbrido para manejar datos tanto estructurados como no estructurados de manera eficiente.

## 2. Tecnologías Principales

-   **Framework**: FastAPI
-   **Servidor ASGI**: Uvicorn
-   **ORM y Validación de Datos**: SQLModel y Pydantic
-   **Base de Datos Relacional**: PostgreSQL (para datos de usuarios, restaurantes, reservas, etc.)
-   **Base de Datos NoSQL**: MongoDB (para almacenar resultados de scraping y datos semi-estructurados)
-   **Contenerización**: Docker y Docker Compose
-   **CI/CD**: GitHub Actions

## 3. Estructura de Directorios

El código fuente se organiza dentro de la carpeta `core/` para mantener una estructura limpia y modular.

```
/core
├── controllers/  # Capa de API: Define los endpoints HTTP.
├── database/     # Gestiona la conexión a PostgreSQL y MongoDB.
├── domain/       # Define los datos de la aplicación.
│   ├── models/   # Modelos de la base de datos (SQLModel).
│   └── schemas/  # Esquemas de datos para la API (Pydantic).
├── services/     # Capa de Lógica de Negocio.
│   └── scrapers/ # Módulos específicos para web scraping.
└── utils/        # Utilidades y constantes.
```

## 4. Arquitectura en Capas

La aplicación sigue un patrón de arquitectura en capas, lo que asegura una clara separación de responsabilidades. El flujo de una petición típica es el siguiente:

`Router -> Controller -> Service -> Model/Schema -> Database`

#### a. Capa de Controladores (`/controllers`)

-   **Responsabilidad**: Es el punto de entrada de la API. Define los endpoints HTTP (ej: `/restaurants`, `/users`).
-   **Funcionamiento**: Recibe las peticiones HTTP, valida los datos de entrada usando los **esquemas Pydantic**, y llama al servicio correspondiente para ejecutar la lógica de negocio. Utiliza el sistema de **Inyección de Dependencias** de FastAPI para obtener las instancias de los servicios que necesita.

#### b. Capa de Servicios (`/services`)

-   **Responsabilidad**: Contiene toda la lógica de negocio de la aplicación. Es el "cerebro" de la API.
-   **Funcionamiento**: Orquesta las operaciones. Por ejemplo, el `ReservationService` puede llamar al `RestaurantService` y al `DinerService` para validar que tanto el restaurante como el comensal existan antes de crear una reserva. Esta capa no sabe nada sobre HTTP; solo ejecuta lógica de negocio pura.

#### c. Capa de Dominio (`/domain`)

-   **Responsabilidad**: Define la estructura de los datos de la aplicación.
-   **`models/`**: Contiene los modelos **SQLModel** que mapean directamente a las tablas de la base de datos PostgreSQL. Define las relaciones, tipos de datos y restricciones a nivel de base de datos.
-   **`schemas/`**: Contiene los esquemas **Pydantic** que definen la forma de los datos en la API (los "DTOs"). Se usan para la validación de datos de entrada (`Create` schemas) y para formatear los datos de salida (`Read` schemas).

#### d. Capa de Base de Datos (`/database`)

-   **Responsabilidad**: Gestiona las conexiones a las bases de datos.
-   `connection.py`: Configura el motor de **SQLAlchemy** para PostgreSQL y proporciona una dependencia `get_session` para que los servicios puedan interactuar con la base de datos relacional.
-   `mongodb_driver.py`: Implementa un patrón Singleton para gestionar una única conexión a **MongoDB** con `motor`, proporcionando una dependencia `get_mongodb_db`.

## 5. Características Notables

-   **Inyección de Dependencias**: La aplicación hace un uso extensivo del sistema de dependencias de FastAPI (`Depends`). Esto desacopla las capas, facilita las pruebas (permitiendo "mockear" servicios o bases de datos) y hace que el código sea más legible.
-   **Bases de Datos Híbridas**: El uso de PostgreSQL para datos transaccionales y relacionales (usuarios, reservas) y MongoDB para datos más volátiles o no estructurados (como los resultados del scraping) permite a la aplicación aprovechar lo mejor de ambos mundos.
-   **Scraping y IA Dinámicos**: El subsistema de scraping en `/services/scrapers` utiliza un patrón **Factory** (`factory.py`) para instanciar el scraper correcto según la URL. Además, integra un servicio de IA (`agentai_service.py`) que utiliza `gpt-5-nano` para analizar el texto extraído y convertirlo en un JSON estructurado, demostrando una capacidad de procesamiento de datos muy avanzada.

---

## 6. DevOps

#### a. Contenerización (Docker)

-   **`Dockerfile`**: El backend está completamente contenerizado. El `Dockerfile` está optimizado para la producción: utiliza una imagen `slim` de Python, aprovecha el caché de capas de Docker para las dependencias y configura Uvicorn para ser accesible desde fuera del contenedor.
-   **`docker-compose.yml`**: Orquesta el entorno de desarrollo local, levantando el backend, el frontend y las bases de datos (PostgreSQL, MongoDB) con un solo comando.
-   **`docker-compose.prod.yml`**: Define la configuración específica para un entorno de producción.

#### b. Integración y Despliegue Continuo (CI/CD)

El proyecto utiliza **GitHub Actions** para automatizar los flujos de trabajo, basándose en los archivos encontrados en `.github/workflows/`.

-   **`pull-request.yml`**: 
    -   **Disparador**: Se ejecuta en cada Pull Request a las ramas principales.
    -   **Objetivo**: Actúa como un guardián de la calidad del código. Su función principal es ejecutar pruebas automatizadas (unitarias, de integración) y linters para asegurar que el nuevo código cumple con los estándares del proyecto antes de ser fusionado.

-   **`development.yml`**:
    -   **Disparador**: Se ejecuta cuando se fusiona código a la rama `develop`.
    -   **Objetivo**: Automatiza el despliegue a un **entorno de Staging o Desarrollo**. Los pasos típicos incluyen: construir las imágenes de Docker, etiquetarlas con una versión de desarrollo, subirlas a un registro de contenedores (como Docker Hub o GCR) y desplegar esta nueva versión en el servidor de staging.

-   **`production.yml`**:
    -   **Disparador**: Se ejecuta cuando se fusiona código a la rama `main` (o `master`), o al crear un nuevo *tag* o *release*.
    -   **Objetivo**: Automatiza el despliegue a **Producción**. Es el pipeline más crítico. Realiza los mismos pasos que el de desarrollo, pero utilizando las configuraciones de producción (secrets, variables de entorno, etc.) para desplegar la versión final que verán los usuarios.
