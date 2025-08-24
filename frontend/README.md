# AlaMesa Frontend

Este directorio contiene todo el código fuente para la interfaz de usuario del proyecto AlaMesa. La aplicación está construida con Vite, Tailwind CSS y un pequeño framework reactivo personalizado escrito en Vanilla JS.

## Core Concepts

La arquitectura de esta aplicación se basa en un patrón de **componentes reactivos** con un **flujo de datos unidireccional**, inspirado en librerías como React. El objetivo es tener un código modular, predecible y fácil de mantener.

Los conceptos clave son:
1.  **Estado (State)**: Cada componente maneja su propio estado, que es un objeto JavaScript simple que contiene los datos que necesita para renderizarse.
2.  **Acciones (Actions)**: El estado es inmutable desde el exterior. La única forma de modificar el estado de un componente es a través de sus `actions`.
3.  **Vista (View)**: Es una función pura que, basándose en el estado actual, devuelve una cadena de texto con el HTML que representa al componente.
4.  **Renderizado Reactivo**: Gracias a un "renderer" central, cada vez que se ejecuta una acción, el estado se actualiza y la aplicación se vuelve a renderizar automáticamente para reflejar los nuevos datos.

## Estructura del Proyecto

```
/src
├── api/         # Lógica para conectar con el backend.
├── components/  # Componentes reutilizables de la UI.
│   ├── layout/  # Componentes de estructura (Navbar, Modal).
│   └── views/   # Vistas principales de la aplicación (Counter, Restaurants).
├── core/        # El núcleo del framework (renderer.js).
├── router/      # Configuración de las rutas de la aplicación.
└── utils/       # Funciones de utilidad (localStorage, sanitización, etc.).
```

## Estilos e Iconos

La aplicación utiliza **Tailwind CSS** para todo el estilizado. La configuración se encuentra en `tailwind.config.js` y los estilos base se importan en `src/index.css`.

Para los iconos, se utiliza **Font Awesome**, que está instalado como una dependencia de `npm` (`@fortawesome/fontawesome-free`). Los estilos de los iconos se importan globalmente en `src/index.js`, por lo que puedes usar sus clases (ej: `fa-solid fa-utensils`) en cualquier componente.

## ¿Cómo funciona?

El corazón de la aplicación reside en `/src/core/renderer.js`. Este archivo se encarga de todo el ciclo de vida de la aplicación:

1.  **Inicialización**: En `index.js`, se llama a `createRoot().render(App)`.
2.  **Recolección de Acciones**: El `renderer` toma el componente `App` y todos sus `children` (incluyendo las vistas del router) y recolecta todas las `actions` en un solo lugar.
3.  **Proxy Reactivo**: Se crea un `Proxy` sobre el objeto de acciones. Este Proxy intercepta cualquier llamada a una acción.
4.  **Ciclo de Actualización**: Cuando se ejecuta una acción (por ejemplo, a través de un `data-onclick` en el HTML):
    a. El Proxy ejecuta la función de la acción original, la cual modifica el `state` del componente correspondiente.
    b. Inmediatamente después, el Proxy dispara una función de re-renderizado (`_render`).
    c. La función `_render` vuelve a generar el HTML de toda la aplicación a partir del nuevo estado y lo inyecta en el DOM.
    d. Se vuelven a vincular los eventos (`data-onclick`, etc.) a los nuevos elementos del DOM.

Este ciclo (`Acción -> Cambio de Estado -> Re-render`) asegura que la UI siempre sea un reflejo fiel del estado de la aplicación.

## Cómo añadir una nueva vista

Crear una nueva sección en la aplicación es muy sencillo si sigues el patrón establecido.

**Ejemplo: Crear una vista "Reservas"**

1.  **Crear el archivo del componente**:
    Crea el archivo `@views/Reservations/Reservations.js`.

2.  **Escribir el componente**:
    Usa la estructura `state`, `actions`, `view`.

    ```javascript
    // src/components/views/Reservations/Reservations.js
    const Reservations = () => {
      // 1. Define el estado inicial
      const state = {
        reservations: [],
        isLoading: true,
      };

      // 2. Define las acciones para modificar el estado
      const actions = {
        loadReservations: (data) => {
          state.reservations = data;
          state.isLoading = false;
        },
        addReservation: (newReservation) => {
            state.reservations.push(newReservation);
        }
      };

      // 3. Define la vista basada en el estado
      const view = () => {
        if (state.isLoading) {
          return `<p>Cargando reservas...</p>`;
        }

        return `
          <section>
            <h1 class="text-4xl font-bold">Mis Reservas</h1>
            <ul>
              ${state.reservations.map(r => `<li>${r.name}</li>`).join('')}
            </ul>
            <button data-onclick="addReservation">Añadir Reserva Falsa</button>
          </section>
        `;
      };

      return { state, actions, view };
    };

    export default Reservations;
    ```

3.  **Añadir la ruta**:
    Abre `@router/index.js` y añade la nueva vista.

    ```javascript
    import Counter from '@views/Counter.js';
    import Restaurants from '@views/Restaurants.js';
    import Reservations from '@views/Reservations/Reservations.js'; // <-- Importar

    export default {
      '#/': Counter,
      '#/restaurants': Restaurants,
      '#/reservations': Reservations, // <-- Añadir ruta
    };
    ```

4.  **Añadir enlace en el Navbar** (Opcional):
    Abre `@layout/Navbar.js` y añade el enlace en la vista.

    ```html
     <a class="hover:text-gray-300" href="#/restaurants">Restaurants</a>
     <a class="hover:text-gray-300" href="#/reservations">Reservas</a> <!-- <-- Añadir enlace -->
    ```

¡Y eso es todo! El `Router` y el `renderer` se encargarán del resto.

## Alias de Ruta

Para facilitar las importaciones, el proyecto está configurado en `vite.config.js` con los siguientes alias:

-   `@`: `src/`
-   `@components`: `src/components/`
-   `@layout`: `src/components/layout/`
-   `@views`: `src/components/views/`
-   `@api`: `src/api/`
-   `@core`: `src/core/`
-   `@router`: `src/router/`
-   `@utils`: `src/utils/`
