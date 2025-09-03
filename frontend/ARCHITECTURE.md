# Arquitectura del Micro-Framework Frontend de AlaMesa

## Introducción

El frontend de AlaMesa funciona sobre un micro-framework reactivo personalizado, escrito en Vanilla JavaScript. Su diseño está inspirado en los principios de librerías modernas como React, pero con un enfoque minimalista y directo. El objetivo es tener un código modular, predecible y fácil de mantener, sin dependencias externas pesadas.

## Conceptos Clave

La arquitectura se basa en tres conceptos fundamentales que definen cada **Componente**.

1.  **`state` (Estado)**: Un objeto JavaScript simple que contiene todos los datos que un componente necesita para funcionar y renderizarse. Es la "única fuente de verdad" para ese componente.

2.  **`actions` (Acciones)**: Un objeto que contiene todas las funciones que pueden modificar el `state` de un componente. Es la única vía permitida para cambiar el estado, asegurando un flujo de datos predecible.

3.  **`view` (Vista)**: Una función que, basándose en el `state` actual, devuelve un string de texto con el HTML que representa al componente.

```javascript
// Ejemplo de un componente simple
const Counter = () => {
  // 1. El estado inicial
  const state = {
    count: 0
  };

  // 2. Las acciones que modifican el estado
  const actions = {
    increment: () => {
      state.count++;
    }
  };

  // 3. La vista que se renderiza basada en el estado
  const view = () => {
    return `
      <div>
        <p>Contador: ${state.count}</p>
        <button data-onclick="increment">Incrementar</button>
      </div>
    `;
  };

  return { state, actions, view };
};
```

## El Ciclo de Renderizado Reactivo

El corazón del framework reside en `/src/core/renderer.js`. Este archivo orquesta el ciclo de vida completo de la aplicación.

#### 1. Inicialización (`createRoot`)

Todo comienza en `index.js` con `createRoot(document.getElementById('root')).render(App)`. La función `render` recibe el componente principal (`App`) y registra todos sus componentes hijos, recolectando sus `state` y `actions`.

#### 2. Reactividad del Estado (`makeStateReactive`)

Para cada propiedad del `state` de cada componente, el `renderer` utiliza `Object.defineProperty`. Esto convierte cada propiedad en un "espía" con un `get` y un `set`. Cuando una acción modifica una propiedad (ej: `state.count = 1`), el `set` se activa.

#### 3. El Motor de "DOM Diffing" (`updateDOM`)

Aquí reside la mayor mejora de nuestro framework. Cuando el `set` de una propiedad de estado se activa, se dispara un re-renderizado.

-   **Antes (Método Destructivo)**: Se usaba `container.innerHTML = newHTML`. Esto era como demoler y reconstruir toda la casa solo para cambiar un cuadro. Era ineficiente y destruía el estado de elementos complejos como los mapas.

-   **Ahora (Método Quirúrgico)**: Se utiliza la función `updateDOM(container, newHTML)` de `/src/core/dom-diff.js`. Esta función es mucho más inteligente:
    1.  Genera el nuevo HTML en memoria.
    2.  Recorre el DOM real y el nuevo HTML de forma simultánea, nodo por nodo.
    3.  Compara atributos, contenido de texto y la estructura de los hijos.
    4.  Aplica **únicamente** los cambios necesarios al DOM real: actualiza un atributo, cambia un texto, añade un `div`, etc.

Este método es increíblemente eficiente y mantiene intactas las partes del DOM que no han cambiado.

#### 4. La "Caja Negra" (`data-no-diff`)

Para integrar librerías de terceros que manipulan su propio DOM (como Google Maps), hemos introducido una regla especial.

Si nuestro motor `updateDOM` encuentra un elemento con el atributo `data-no-diff="true"`, actualizará los atributos de ese elemento, pero **no intentará comparar ni modificar sus hijos**. Esto le cede el control total de esa parte del DOM a la librería externa, evitando que nuestro framework interfiera con ella.

```javascript
// Ejemplo en Maps.js
export function renderGoogleMaps() {
  return `
    <div id="restaurant-search-map" data-no-diff="true" ...>
      // ... spinner de carga ...
    </div>
  `;
}
```

## Flujo Completo de una Interacción

1.  Un usuario hace clic en un `<button data-onclick="increment">`.
2.  El `renderer` intercepta el clic y ejecuta la acción `increment` correspondiente.
3.  La acción `increment` ejecuta `state.count++`.
4.  El `set` de la propiedad `count` se dispara y llama a la función `_render`.
5.  `_render` genera el nuevo string de HTML para toda la aplicación.
6.  `updateDOM` es llamado. Compara el DOM actual con el nuevo HTML.
7.  Detecta que el único cambio es el texto dentro de una etiqueta `<p>`.
8.  Actualiza **únicamente** el contenido de esa etiqueta `<p>` en el DOM real.
9.  La UI se actualiza de forma instantánea y eficiente, sin afectar al resto de la página.
