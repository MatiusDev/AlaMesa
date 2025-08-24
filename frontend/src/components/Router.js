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
    // 2. El estado del Router contiene la ruta activa.
    state: {
      currentPath: window.location.hash || '#/',
    },

    // 3. La acción `navigate` actualiza el estado con la nueva ruta.
    actions: {
      navigate: () => {
        component.state.currentPath = window.location.hash || '#/';
      },
    },

    // 5. La vista del Router decide qué componente hijo renderizar.
    view: () => {
      const activeViewInstance = viewInstances[component.state.currentPath] || notFoundInstance;
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
