// frontend/src/components/layout/Navbar.js
import { clearUserData } from '@utils/localStorage.js';

const Navbar = () => {
  const actions = {
    logout: () => {
      clearUserData();
      window.location.hash = '#/';
    },
    toggleMenu: () => {
      const burger = document.querySelector('.navbar-burger');
      const menu = document.querySelector('.navbar-menu');
      burger.classList.toggle('is-active');
      menu.classList.toggle('is-active');
    }
  };

  const view = () => `
    <nav class="bg-gray-800 text-white p-4 shadow-md" role="navigation" aria-label="main navigation">
      <div class="container mx-auto flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <a class="hover:text-gray-300" href="#/">
            Counter
          </a>
          <a class="hover:text-gray-300" href="#/restaurants">
            Restaurants
          </a>
        </div>
        <div class="flex items-center">
            <a class="bg-gray-200 text-gray-800 hover:bg-gray-300 px-4 py-2 rounded-md text-sm font-medium cursor-pointer" data-onclick="logout">Log out</a>
        </div>
      </div>
    </nav>
  `;

  return {
    state: {},
    actions,
    view
  };
};

export default Navbar;