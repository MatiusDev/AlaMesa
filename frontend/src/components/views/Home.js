import RestaurantCard from '@components/ui/RestaurantCard.js';
import CategoryCard from '@components/ui/CategoryCard.js';
import { renderGoogleMaps, initGoogleMapsComponent } from '@components/ui/Maps.js';

const Home = () => {
  const state = {};
  const actions = {};

  const sampleRestaurants = [
    { name: 'Morado Bistro', cuisine: 'Fusión', rating: 4.7, price: '$$$', image: 'https://picsum.photos/seed/morado-bistro/800/600' },
    { name: 'Blanco & Uvas', cuisine: 'Alta cocina', rating: 4.8, price: '$$$$', image: 'https://picsum.photos/seed/blanco-uvas/800/600' },
    { name: 'Café Orquídea', cuisine: 'Cafetería', rating: 4.5, price: '$$', image: 'https://picsum.photos/seed/cafe-orquidea/800/600' },
    { name: 'Puerta 87', cuisine: 'Internacional', rating: 4.6, price: '$$$', image: 'https://picsum.photos/seed/puerta-87/800/600' },
  ];

  const categories = [
    { name: 'Comida rápida', subtitle: 'Hamburguesas, pizzas y más', icon: 'fa-burger' },
    { name: 'Alta cocina', subtitle: 'Experiencias gourmet', icon: 'fa-utensils' },
    { name: 'Internacional', subtitle: 'Sabores del mundo', icon: 'fa-earth-americas' },
    { name: 'Típica', subtitle: 'Comida local', icon: 'fa-plate-wheat' },
    { name: 'Cafés', subtitle: 'Brunch y especialidad', icon: 'fa-mug-saucer' },
  ];

  const view = () => `
    <section class="mx-auto max-w-7xl px-4 pt-28 pb-10">
      <div class="text-center">
        <img src="/assets/AlaMesa.jpeg" alt="AlaMesa" class="mx-auto h-12 w-auto rounded-full shadow-soft" />
        <h1 class="mt-6 text-4xl font-bold tracking-tight">Reserva tu mesa con estilo</h1>
        <p class="mt-2 text-neutral-600">Explora restaurantes, descubre experiencias y reserva en segundos.</p>
      </div>

      <div class="mt-10">
        <div class="flex gap-4 overflow-x-auto pb-2">
          ${sampleRestaurants.map(r => `<div class="min-w-[280px]">${RestaurantCard(r)}</div>`).join('')}
        </div>
      </div>

      <div class="mt-12">
        <h2 class="text-xl font-semibold mb-4">Categorías</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          ${categories.map(CategoryCard).join('')}
        </div>
      </div>

      <div class="mt-12">
        <h2 class="text-xl font-semibold mb-4">Mejores calificados</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          ${[...sampleRestaurants].sort((a,b)=>b.rating-a.rating).slice(0,3).map(RestaurantCard).join('')}
        </div>
      </div>

      <div class="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        <div>
          <h2 class="text-2xl font-bold mb-3">Sobre AlaMesa</h2>
          <p class="text-neutral-600">Nuestra misión es conectar a comensales con experiencias memorables y ayudar a los restaurantes a llenar sus mesas. Con una interfaz moderna y herramientas simples, facilitamos la búsqueda, el descubrimiento y las reservas en pocos clics.</p>
        </div>
        <div class="rounded-[var(--am-radius)] border border-neutral-200 bg-white p-6 shadow-soft">
          <h3 class="text-lg font-semibold">¿Tienes un restaurante?</h3>
          <p class="mt-1 text-neutral-600">Únete a AlaMesa y llega a más clientes. Administra disponibilidad, destaca tu propuesta y recibe reservas en tiempo real.</p>
          <div class="mt-4 flex flex-wrap gap-3">
            <a href="#/auth" class="rounded-full bg-am-600 hover:bg-am-700 text-white px-5 py-2">Regístrate</a>
            <a href="#/auth" class="rounded-full border border-neutral-300 hover:border-neutral-400 px-5 py-2">Inicia sesión</a>
          </div>
        </div>
      </div>

      ${renderGoogleMaps()}
    </section>
  `;

  // Inicializar el componente del mapa después de renderizar
  setTimeout(() => {
    initGoogleMapsComponent();
  }, 300);

  return { state, actions, view };
};

export default Home; 