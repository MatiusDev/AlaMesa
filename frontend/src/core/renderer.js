// frontend/src/core/renderer.js

/**
 * @function createRoot
 * @description Crea una raíz de renderizado vinculada a un contenedor del DOM.
 * Imita la API de `react-dom/client` para un punto de entrada más limpio.
 * @param {HTMLElement} container - El elemento del DOM donde se montará la aplicación.
 * @returns {{render: Function}} Un objeto con un método para renderizar un componente.
 */
export const createRoot = (container) => {
  if (!container) {
    throw new Error('createRoot requiere un elemento contenedor válido.');
  }

  /**
   * El objeto que se devuelve, exponiendo la API pública.
   */
  return {
    /**
     * @method render
     * @description Renderiza un componente raíz dentro del contenedor.
     * @param {Function} RootComponentFactory - La función que crea el componente raíz (App).
     */
    render(RootComponentFactory) {
      const rootInstance = RootComponentFactory();
      const view = rootInstance.view;
      const children = rootInstance.children || [];

      const allActions = { ...(rootInstance.actions || {}) };
      children.forEach(child => {
        Object.assign(allActions, child.actions);
      });

      let _render;

      const proxiedActions = new Proxy(allActions, {
        get: (target, prop) => {
          return (...args) => {
            const result = target[prop](...args);
            _render(); // Llama al render interno después de cada acción.
            return result;
          };
        }
      });

      rootInstance.actions = proxiedActions;
      children.forEach(child => {
        child.actions = proxiedActions;
      });

      const bindEvents = () => {
        const eventTypes = ['onclick', 'onsubmit', 'onchange', 'onkeyup'];
        eventTypes.forEach(eventType => {
          const attribute = `data-${eventType}`;
          const elements = container.querySelectorAll(`[${attribute}]`);
          elements.forEach(element => {
            const actionName = element.getAttribute(attribute);
            const action = proxiedActions[actionName];
            if (action) {
              element.removeEventListener(eventType.substring(2), element._listener);
              element._listener = (event) => action(event);
              element.addEventListener(eventType.substring(2), element._listener);
            }
          });
        });
      };

      _render = () => {
        container.innerHTML = view();
        bindEvents();
      };

      _render(); // Primer renderizado.
    },
  };
};
