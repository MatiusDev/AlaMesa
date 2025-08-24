// frontend/src/components/App.js
import Navbar from '@layout/Navbar.js';
import Router from '@components/Router.js';
import { renderComponent } from '@utils/renderComponent.js';

/**
 * @description
 * Componente raíz y de layout. Es "tonto", solo compone a sus hijos.
 */
const App = () => {
  // 1. Se instancian los componentes hijos que App va a utilizar.
  const navbarComponent = Navbar();
  const routerComponent = Router(); // Se instancia el nuevo Router

  // 2. La vista de App simplemente renderiza el Navbar y el Router.
  const view = () => {
    return `
      <main id="container mx-auto p-4">
        ${renderComponent(navbarComponent)}
        ${renderComponent(routerComponent)}
      </main>
    `;
  };

  // 3. Se exponen los hijos (Navbar y Router) y los hijos de los hijos (las vistas del Router)
  // para que el Renderer pueda acceder a todas las acciones de la aplicación.
  return {
    view,
    children: [navbarComponent, routerComponent, ...routerComponent.children]
  };
};

export default App;