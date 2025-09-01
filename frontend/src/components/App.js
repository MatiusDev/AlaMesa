// frontend/src/components/App.js
import Navbar from '@layout/Navbar.js';
import Footer from '@layout/Footer.js';
import Router from '@components/Router.js';
import { renderComponent } from '@utils/renderComponent.js';

/**
 * @description
 * Componente raíz y de layout. Es "tonto", solo compone a sus hijos.
 */
const App = () => {
  const navbarComponent = Navbar();
  const footerComponent = Footer();
  const routerComponent = Router();

  const view = () => {
    return `
      <main id="container" class="mx-auto p-4">
        ${renderComponent(navbarComponent)}
        ${renderComponent(routerComponent)}
      </main>
      ${renderComponent(footerComponent)}
    `;
  };

  return {
    view,
    children: [navbarComponent, footerComponent, routerComponent, ...routerComponent.children]
  };
};

export default App;