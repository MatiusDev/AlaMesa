import RestaurantCard from '@components/ui/RestaurantCard.js';
import CategoryCard from '@components/ui/CategoryCard.js';
import { renderGoogleMaps, initGoogleMapsComponent, destroyGoogleMap } from '@components/ui/Maps.js';
import { getRestaurants } from '@api/restaurantService.js';

const Home = () => {
  const state = {
    restaurants: [],
    loading: true,
    error: null,
    categories: [
      { name: 'Colombiana', subtitle: 'Sabores tradicionales', icon: 'fa-plate-wheat' },
      { name: 'Italiana', subtitle: 'Pasta y pizza auténtica', icon: 'fa-utensils' },
      { name: 'Japonesa', subtitle: 'Sushi y ramen', icon: 'fa-bowl-food' },
      { name: 'Fusión', subtitle: 'Cocina creativa', icon: 'fa-star' },
      { name: 'Hamburguesas', subtitle: 'Fast food gourmet', icon: 'fa-burger' },
      { name: 'Pizza', subtitle: 'Las mejores pizzas', icon: 'fa-pizza-slice' },
      { name: 'Cafés', subtitle: 'Brunch y especialidad', icon: 'fa-mug-saucer' },
      { name: 'Alta cocina', subtitle: 'Experiencias gourmet', icon: 'fa-crown' }
    ]
  };

  const actions = {
    loadRestaurants: async () => {
      try {
        state.loading = true;
        state.error = null;
        const data = await getRestaurants();
        state.restaurants = data || [];
        state.loading = false;
      } catch (error) {
        console.error('Error cargando restaurantes para Home:', error);
        state.error = 'Error al cargar los restaurantes destacados.';
        state.loading = false;
      }
    },
    getFeaturedRestaurants: () => {
      if (!state.restaurants.length) return [];
      return [...state.restaurants]
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 3);
    },
    getHorizontalRestaurants: () => {
      if (!state.restaurants.length) return [];
      return state.restaurants.slice(0, 4);
    },
    viewRestaurantDetails: (e) => {
      const restaurantId = e.currentTarget.dataset.restaurantId;
      if (restaurantId) {
        window.location.hash = `#/restaurant/${restaurantId}`;
      } else {
        window.location.hash = '#/restaurants';
      }
    }
  };

  const onInit = () => {
    actions.loadRestaurants();
  };

  const onRender = () => {
    initGoogleMapsComponent();
  };

  const onUnmount = () => {
    destroyGoogleMap();
  };

  const view = () => {
    const featuredRestaurants = actions.getFeaturedRestaurants();
    const horizontalRestaurants = actions.getHorizontalRestaurants();

    return `
      <section class="mx-auto max-w-7xl px-4 pt-28 pb-10">
        <div class="text-center">
          <img src="/assets/AlaMesa.jpeg" alt="AlaMesa" class="mx-auto h-12 w-auto rounded-full shadow-soft" />
          <h1 class="mt-6 text-4xl font-bold tracking-tight">Reserva tu mesa con estilo</h1>
          <p class="mt-2 text-neutral-600">Explora restaurantes, descubre experiencias y reserva en segundos.</p>
        </div>

        <div class="mt-10">
          <h2 class="text-xl font-semibold mb-4 text-center">Restaurantes Destacados</h2>
          ${ state.loading ? `<p class="text-center">Cargando...</p>` : horizontalRestaurants.length > 0 ? `
            <div class="flex gap-4 overflow-x-auto pb-2">
              ${horizontalRestaurants.map(r => `<div class="min-w-[280px]">${RestaurantCard(r)}</div>`).join('')}
            </div>
          ` : `<p class="text-center">No hay restaurantes disponibles.</p>`}
        </div>

        <div class="mt-12">
          <h2 class="text-xl font-semibold mb-4 text-center">Categorías</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            ${state.categories.map(CategoryCard).join('')}
          </div>
        </div>

        <div class="mt-12">
          <h2 class="text-xl font-semibold mb-4 text-center">Mejores Calificados</h2>
          ${ state.loading ? `<p class="text-center">Cargando...</p>` : featuredRestaurants.length > 0 ? `
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              ${featuredRestaurants.map(RestaurantCard).join('')}
            </div>
          ` : `<p class="text-center">No hay restaurantes calificados.</p>`}
        </div>

        <div class="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          <div>
            <h2 class="text-2xl font-bold mb-3">Sobre AlaMesa</h2>
            <p class="text-neutral-600">Nuestra misión es conectar a comensales con experiencias memorables y ayudar a los restaurantes a llenar sus mesas. Con una interfaz moderna y herramientas simples, facilitamos la búsqueda, el descubrimiento y las reservas en pocos clics.</p>
          </div>
          <div class="rounded-[var(--am-radius)] border border-neutral-200/60 bg-white/80 backdrop-blur-sm p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-am-300/60">
            <h3 class="text-lg font-semibold">¿Tienes un restaurante?</h3>
            <p class="mt-1 text-neutral-600">Únete a AlaMesa y llega a más clientes. Administra disponibilidad, destaca tu propuesta y recibe reservas en tiempo real.</p>
            <div class="mt-4 flex flex-wrap gap-3 justify-center">
              <a href="#/auth" class="rounded-full bg-gradient-to-r from-am-600 to-am-700 hover:from-am-700 hover:to-am-800 text-white px-5 py-2.5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95">
                <span class="flex items-center gap-2">
                  <i class="fa-solid fa-user-plus text-sm"></i>
                  Regístrate
                </span>
              </a>
              <a href="#/auth" class="rounded-full border border-neutral-300/60 bg-white/80 backdrop-blur-sm hover:border-am-300/80 hover:bg-am-50/80 hover:text-am-700 px-5 py-2.5 text-neutral-700 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105">
                <span class="flex items-center gap-2">
                  <i class="fa-solid fa-sign-in-alt text-sm"></i>
                  Inicia sesión
                </span>
              </a>
            </div>
          </div>
        </div>

        <!-- Mapa de Google -->
        ${renderGoogleMaps()}
      </section>
    `;
  };

  return { state, actions, view, onInit, onRender, onUnmount };
};

export default Home;
