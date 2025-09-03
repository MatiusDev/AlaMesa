import { updateDOM } from '@core/dom-diff.js';

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

  // Flag para controlar el primer renderizado.
  let isFirstRender = true;

  return {
    /**
     * @method render
     * @description Renderiza un componente raíz y hace que su estado sea reactivo.
     * @param {Function} RootComponentFactory - La función que crea el componente raíz (App).
     */
    render(RootComponentFactory) {
      let _render;

      const makeStateReactive = (state, renderCallback) => {
        Object.keys(state).forEach(key => {
          let internalValue = state[key];
          Object.defineProperty(state, key, {
            get() {
              return internalValue;
            },
            set(newValue) {
              if (internalValue !== newValue) {
                internalValue = newValue;
                renderCallback();
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

      const allActions = {};
      allComponents.forEach(component => {
        if (component.actions) {
            Object.assign(allActions, component.actions);
        }
      });

      const bindEvents = (targetNode) => {
        const eventTypes = ['click', 'submit', 'change', 'keyup', 'keydown', 'input', 'focus', 'blur'];
        eventTypes.forEach(eventType => {
          targetNode.querySelectorAll(`[data-on${eventType}]`).forEach(element => {
            const actionName = element.dataset[`on${eventType}`];
            const action = allActions[actionName];
            
            const listenerKey = `_listener_${eventType}`;

            if (action) {
              // Si ya hay un listener del mismo tipo, lo removemos antes de añadir el nuevo
              // para evitar duplicados en re-renders parciales.
              if (element[listenerKey]) {
                element.removeEventListener(eventType, element[listenerKey]);
              }
              element[listenerKey] = (event) => action(event);
              element.addEventListener(eventType, element[listenerKey]);
            }
          });
        });
      };

      _render = () => {
        const newHtml = view();

        if (isFirstRender) {
          container.innerHTML = newHtml;
          isFirstRender = false;
        } else {
          updateDOM(container, newHtml);
        }

        bindEvents(container);

        allComponents.forEach(component => {
          if (component.onRender) {
            component.onRender();
          }
        });
      };

      allComponents.forEach(component => {
        if (component.state) {
          makeStateReactive(component.state, _render);
        }
      });

      _render();
    },
  };
};
