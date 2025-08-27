// frontend/src/components/App.js
import Navbar from '@layout/Navbar.js';
import Router from '@components/Router.js';
import { renderComponent } from '@utils/renderComponent.js';

/**
 * @description
 * Componente raíz y de layout. Es "tonto", solo compone a sus hijos.
 */
const App = () => {
  const navbarComponent = Navbar();
  const routerComponent = Router();

  const view = () => {
    return `
      <main id="container" class="mx-auto p-4">
        ${renderComponent(navbarComponent)}
        ${renderComponent(routerComponent)}
      </main>
    `;
  };

  return {
    view,
    children: [navbarComponent, routerComponent, ...routerComponent.children]
  };
};

export default App;