# Tareas Pendientes (Technical Debt)

## Seguridad y CI/CD

- [ ] **Refactorizar la Gestión de Secretos de Producción**
  - **Estado Actual:** Los secretos de producción se están leyendo desde el nivel de "Repository Secrets" como una medida temporal para agilizar el primer despliegue.
  - **Por qué cambiarlo:** Mover los secretos a un "Environment" de GitHub (`production`) es una práctica de seguridad estándar que sigue el Principio de Menor Privilegio. Esto aísla las credenciales de producción y permite usar reglas de protección avanzadas, como requerir aprobación manual para los despliegues.
  - **Pasos a seguir:**
    1. En la configuración del repositorio de GitHub, ir a `Settings > Environments` y asegurarse de que el entorno `production` existe.
    2. Mover todos los secretos necesarios para el despliegue (ej. `PRODUCTION_HOST`, `PRODUCTION_USER`, `PRODUCTION_SSH_KEY`, `MONGODB_URI`, etc.) desde `Settings > Secrets and variables > Actions` a la sección de "Environment secrets" que se encuentra **dentro** del entorno `production`.
    3. Una vez movidos, se recomienda eliminar los secretos del nivel de Repositorio para evitar confusión.
    4. En el archivo `.github/workflows/production.yml`, dentro del job `deploy-production`, descomentar la línea `environment: production`.
    5. Finalmente, ajustar el mensaje de error en el script de despliegue para que vuelva a hacer referencia a los "Environment secrets", revirtiendo el último cambio que hicimos.
