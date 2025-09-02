import { renderComponent } from '@utils/renderComponent.js';
import routes from '@router';

import NotFound from '@views/NotFound.js'

/**
 * @description
 * Un componente que maneja la lógica de enrutamiento de la aplicación.
 */
const Router = () => {
  // 1. Se instancian todas las vistas posibles a partir de la configuración de rutas.
  // Esto es crucial para que sus acciones puedan ser registradas por el renderer.
  const viewInstances = {};
  for (const path in routes) {
    const ComponentFactory = routes[path];
    viewInstances[path] = ComponentFactory();
  }
  const notFoundInstance = NotFound();

  // Se define el componente como un objeto para que sus propiedades (como `actions`)
  // puedan ser sobreescritas por el renderer. De esta forma, el listener de `hashchange`
  // puede invocar la acción `navigate` ya "proxificada" y disparar un re-renderizado.
  const component = {
    // ... (state y otras propiedades)
    onReady: ({ render }) => {
      // Guardamos la función de renderizado para usarla en la navegación.
      component.render = render;
    },
    // 2. El estado del Router contiene la ruta activa.
    state: {
      currentPath: window.location.hash || '#/',
    },

    // 3. La acción `navigate` actualiza el estado con la nueva ruta.
    actions: {
      navigate: () => {
        const oldPath = component.state.currentPath.split('?')[0];
        const oldViewInstance = viewInstances[oldPath] || notFoundInstance;

        // Si el componente que estamos dejando tiene una función de limpieza, la ejecutamos
        // y reiniciamos su estado de inicialización para que `onInit` se vuelva a llamar.
        if (oldViewInstance) {
          if (typeof oldViewInstance.onUnmount === 'function') {
            oldViewInstance.onUnmount();
          }
          oldViewInstance._initialized = false;
        }

        // Actualiza la ruta, lo que dispara el re-renderizado reactivo.
        component.state.currentPath = window.location.hash || '#/';
      },
    },

    // 5. La vista del Router decide qué componente hijo renderizar.
    view: () => {
      // Extraer la ruta base sin parámetros de query
      const basePath = component.state.currentPath.split('?')[0];
      const activeViewInstance = viewInstances[basePath] || notFoundInstance;

      // Llama al ciclo de vida onInit de la vista activa si existe y no se ha ejecutado antes.
      if (activeViewInstance.onInit && !activeViewInstance._initialized) {
        activeViewInstance.onInit();
        activeViewInstance._initialized = true; // Se marca para no reinicializar en futuras navegaciones.
      }

      return renderComponent(activeViewInstance);
    },

    // 6. Se exponen todas las posibles vistas como "hijos" para el registro de acciones.
    children: [...Object.values(viewInstances), notFoundInstance],
  };

  // 4. Se añade un listener para que `navigate` se dispare en cada cambio de URL.
  // Cuando el evento ocurre, se llama a `component.actions.navigate()`.
  // Para ese momento, el renderer ya habrá reemplazado `component.actions` con un proxy
  // que se encarga de disparar el re-renderizado después de ejecutar la acción.
  window.addEventListener('hashchange', () => component.actions.navigate());

  return component;
};

export default Router;
