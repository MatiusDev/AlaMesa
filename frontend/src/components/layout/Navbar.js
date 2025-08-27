// frontend/src/components/layout/Navbar.js
import { clearUserData } from '@utils/localStorage.js';

const Navbar = () => {
  const state = { query: '', location: '', cuisine: '', date: '', menuOpen: false };

  const actions = {
    updateQuery: (e) => { state.query = e.target.value; },
    updateLocation: (e) => { state.location = e.target.value; },
    updateCuisine: (e) => { state.cuisine = e.target.value; },
    updateDate: (e) => { state.date = e.target.value; },
    submitSearch: (e) => {
      e.preventDefault();
      window.location.hash = '#/restaurants';
    },
    toggleMenu: () => { state.menuOpen = !state.menuOpen; },
    gotoAuth: () => { window.location.hash = '#/auth'; },
    gotoHome: () => { window.location.hash = '#/'; },
    gotoRestaurants: () => { window.location.hash = '#/restaurants'; },
  };

  const view = () => `
    <header class="fixed inset-x-0 top-0 z-50 bg-white backdrop-blur border-b border-neutral-200/60">
      <div class="mx-auto max-w-7xl px-4 h-20 flex items-center gap-6">
        <div class="relative">
          <button class="flex items-center gap-2" data-onclick="toggleMenu" title="Abrir menú">
            <img src="/assets/AlaMesa.jpeg" alt="AlaMesa" class="h-9 w-9 rounded-full" />
            <span class="hidden sm:inline text-lg font-semibold">AlaMesa</span>
            <i class="fa-solid fa-chevron-down text-neutral-500 text-sm"></i>
          </button>
          ${state.menuOpen ? `
          <nav class="absolute left-0 mt-2 w-56 rounded-[var(--am-radius)] border border-neutral-200 bg-white shadow-soft p-2">
            <a class="block rounded px-3 py-2 hover:bg-neutral-100" href="#/" data-onclick="gotoHome">Inicio</a>
            <a class="block rounded px-3 py-2 hover:bg-neutral-100" href="#/restaurants" data-onclick="gotoRestaurants">Restaurantes</a>
          </nav>` : ''}
        </div>

        <form data-onsubmit="submitSearch" class="flex-1">
          <div class="mx-auto w-full md:w-[760px] rounded-full border border-neutral-200 bg-white shadow-soft overflow-hidden">
            <div class="grid grid-cols-[1fr_1fr_1fr_auto] divide-x divide-neutral-200">
              <input class="px-4 py-3 bg-transparent placeholder-neutral-400 focus:outline-none" placeholder="Restaurante" value="${state.query}" data-onchange="updateQuery" />
              <input class="px-4 py-3 bg-transparent placeholder-neutral-400 focus:outline-none" placeholder="Ubicación" value="${state.location}" data-onchange="updateLocation" />
              <input class="px-4 py-3 bg-transparent placeholder-neutral-400 focus:outline-none" placeholder="Tipo de comida" value="${state.cuisine}" data-onchange="updateCuisine" />
              <div class="flex">
                <input type="date" class="flex-1 px-4 py-3 bg-transparent placeholder-neutral-400 focus:outline-none" value="${state.date}" data-onchange="updateDate" />
                <button class="px-5 m-1 rounded-full bg-am-600 hover:bg-am-700 text-white font-medium" data-onclick="submitSearch">Buscar</button>
              </div>
            </div>
          </div>
        </form>

        <div class="flex items-center gap-2">
          <button class="h-10 w-10 grid place-items-center rounded-full hover:bg-neutral-100" title="Cuenta" data-onclick="gotoAuth">
            <i class="fa-solid fa-user"></i>
          </button>
        </div>
      </div>
    </header>
  `;

  return { state, actions, view };
};

export default Navbar;