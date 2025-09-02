// frontend/src/core/renderer.js

/**
 * @function createRoot
 * @description Crea una raíz de renderizado vinculada a un contenedor del DOM.
 * @param {HTMLElement} container - El elemento del DOM donde se montará la aplicación.
 * @returns {{render: Function}} Un objeto con un método para renderizar un componente.
 */
export const createRoot = (container) => {
  if (!container) {
    throw new Error('createRoot requiere un elemento contenedor válido.');
  }

  return {
    /**
     * @method render
     * @description Renderiza un componente raíz y hace que su estado sea reactivo.
     * @param {Function} RootComponentFactory - La función que crea el componente raíz (App).
     */
    render(RootComponentFactory) {
      let _render;

      /**
       * @function makeStateReactive
       * @description Modifica un objeto de estado "in-place" para hacerlo reactivo,
       *              respetando las clausuras (closures) de JavaScript.
       * @param {object} state - El objeto de estado original del componente.
       * @param {Function} renderCallback - La función a llamar cuando el estado cambia.
       */
      const makeStateReactive = (state, renderCallback) => {
        // Itera sobre cada propiedad del objeto de estado original.
        Object.keys(state).forEach(key => {
          let internalValue = state[key]; // Guarda el valor inicial en una clausura.

          // Reemplaza la propiedad original con un getter y un setter.
          Object.defineProperty(state, key, {
            get() {
              return internalValue;
            },
            set(newValue) {
              if (internalValue !== newValue) {
                internalValue = newValue; // Actualiza el valor.
                renderCallback(); // Dispara el re-renderizado.
              }
            },
            enumerable: true,
            configurable: true,
          });
        });
      };

      const rootInstance = RootComponentFactory();
      const view = rootInstance.view;
      const children = rootInstance.children || [];
      const allComponents = [rootInstance, ...children];

      _render = () => {
        container.innerHTML = view();
        bindEvents();

        // Llama al ciclo de vida onRender de todos los componentes después de pintar el DOM.
        allComponents.forEach(component => {
          if (component.onRender) {
            component.onRender();
          }
        });
      };

      // Hace reactivo el estado de todos los componentes, modificando el objeto original.
      allComponents.forEach(component => {
        if (component.state) {
          makeStateReactive(component.state, _render);
        }
      });

      const allActions = {};
      allComponents.forEach(component => {
        Object.assign(allActions, component.actions);
      });

      const bindEvents = () => {
        const eventTypes = ['onclick', 'onsubmit', 'onchange', 'onkeyup'];
        eventTypes.forEach(eventType => {
          const attribute = `data-${eventType}`;
          const elements = container.querySelectorAll(`[${attribute}]`);
          elements.forEach(element => {
            const actionName = element.getAttribute(attribute);
            const action = allActions[actionName];
            if (action) {
              element.removeEventListener(eventType.substring(2), element._listener);
              element._listener = (event) => action(event);
              element.addEventListener(eventType.substring(2), element._listener);
            }
          });
        });
      };

      _render();
    },
  };
};
