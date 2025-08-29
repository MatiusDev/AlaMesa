import RestaurantCard from '@components/ui/RestaurantCard.js';
import CategoryCard from '@components/ui/CategoryCard.js';
import { renderGoogleMaps, initGoogleMapsComponent } from '@components/ui/Maps.js';

// --- Google Maps helpers (carga perezosa y segura) ---
const HOME_MAP_ID = 'home-map';
const ABURRA_CENTER = { lat: 6.244203, lng: -75.581211 }; // Medellín centro
const FAMOUS_ABURRA_RESTAURANTS = [
  // Medellín - El Poblado
  { name: 'Carmen (El Poblado)', lat: 6.2098, lng: -75.5672 },
  { name: 'OCI.mde', lat: 6.2068, lng: -75.5652 },
  { name: 'Alambique', lat: 6.2085, lng: -75.5673 },
  { name: 'Mondongo’s (Poblado)', lat: 6.2062, lng: -75.5651 },
  // Laureles
  { name: 'Mondongo’s (Laureles)', lat: 6.2422, lng: -75.5944 },
  { name: 'Naturalia Café', lat: 6.2449, lng: -75.5928 },
  // Envigado
  { name: 'Herbario (Envigado)', lat: 6.1756, lng: -75.5918 },
  // Sabaneta
  { name: 'Aves María (Sabaneta)', lat: 6.1477, lng: -75.6155 },
  // Bello
  { name: 'Parque de Bello (zona gastronómica)', lat: 6.3345, lng: -75.5577 },
  // Itagüí
  { name: 'Zona Miami (Itagüí)', lat: 6.1714, lng: -75.6139 },
];

function appendGoogleMapsScriptOnce() {
  if (window.__gmapsLoading || window.google?.maps) return Promise.resolve();
  window.__gmapsLoading = true;
  return new Promise((resolve) => {
    const script = document.createElement('script');
    const apiKey = ((typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GOOGLE_MAPS_API_KEY) || window.GOOGLE_MAPS_API_KEY || '');
    // Cargar con librería Places para poder obtener detalles
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
}

function appendLeafletOnce() {
  if (window.__leafletLoading || window.L) return Promise.resolve();
  window.__leafletLoading = true;
  return new Promise((resolve) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    document.body.appendChild(script);
  });
}

function getMapsApiKey() {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
      return import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    }
  } catch (_) {}
  return window.GOOGLE_MAPS_API_KEY || '';
}

async function tryInitHomeMap() {
  const container = document.getElementById(HOME_MAP_ID);
  if (!container || container.dataset.ready === '1') return;
  const apiKey = getMapsApiKey();
  if (!apiKey) {
    // Fallback: Leaflet + OpenStreetMap sin API key
    await appendLeafletOnce();
    if (!window.L) return;
    const leafletMap = window.L.map(container).setView([ABURRA_CENTER.lat, ABURRA_CENTER.lng], 11);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(leafletMap);
    FAMOUS_ABURRA_RESTAURANTS.forEach((r) => {
      window.L.marker([r.lat, r.lng]).addTo(leafletMap).bindPopup(`<strong>${r.name}</strong>`);
    });
    container.dataset.ready = '1';
    return;
  }
  await appendGoogleMapsScriptOnce();
  if (!window.google?.maps) return;
  const map = new window.google.maps.Map(container, {
    center: ABURRA_CENTER,
    zoom: 6,
    disableDefaultUI: false,
    mapTypeControl: false,
    fullscreenControl: false,
  });
  // Zoom más cercano al Valle de Aburrá
  map.setZoom(11);

  const places = new window.google.maps.places.PlacesService(map);

  const buildInfoHtml = (baseName, details) => {
    const name = details?.name || baseName;
    const addr = details?.formatted_address || '';
    const rating = (details?.rating || '').toString();
    const phone = details?.formatted_phone_number || '';
    const website = details?.website ? `<a href="${details.website}" target="_blank" rel="noopener">Sitio web</a>` : '';
    return `
      <div style="min-width:220px">
        <div style="font-weight:600;margin-bottom:4px">${name}</div>
        ${addr ? `<div style=\"color:#6b7280;font-size:12px\">${addr}</div>` : ''}
        ${rating ? `<div style=\"margin-top:6px;font-size:12px\">⭐ ${rating}</div>` : ''}
        ${phone ? `<div style=\"margin-top:6px;font-size:12px\">📞 ${phone}</div>` : ''}
        ${website ? `<div style=\"margin-top:6px\">${website}</div>` : ''}
      </div>
    `;
  };

  const fields = ['name','formatted_address','rating','formatted_phone_number','website'];

  FAMOUS_ABURRA_RESTAURANTS.forEach((r) => {
    const position = { lat: r.lat, lng: r.lng };
    const marker = new window.google.maps.Marker({ position, map, title: r.name });
    const info = new window.google.maps.InfoWindow({ content: `<strong>${r.name}</strong>` });

    // Buscar placeId cercano por nombre para luego traer detalles
    places.textSearch({ query: r.name, location: position, radius: 1500 }, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results[0]) {
        const placeId = results[0].place_id;
        places.getDetails({ placeId, fields }, (detail, s2) => {
          if (s2 === window.google.maps.places.PlacesServiceStatus.OK && detail) {
            info.setContent(buildInfoHtml(r.name, detail));
          } else {
            info.setContent(buildInfoHtml(r.name, null));
          }
        });
      } else {
        info.setContent(buildInfoHtml(r.name, null));
      }
    });

    marker.addListener('click', () => info.open({ anchor: marker, map }));
  });
  container.dataset.ready = '1';
}

// Intento de inicialización cuando la ruta es Home
if (!window.__homeMapListenersAdded) {
  window.__homeMapListenersAdded = true;
  const startRetries = () => {
    let tries = 0;
    clearInterval(window.__homeMapRetry);
    window.__homeMapRetry = setInterval(() => {
      tries += 1;
      tryInitHomeMap();
      if (document.getElementById(HOME_MAP_ID)?.dataset.ready === '1' || tries > 30) {
        clearInterval(window.__homeMapRetry);
      }
    }, 150);
  };
  window.addEventListener('load', startRetries);
  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#/' || window.location.hash === '' || window.location.hash === '#') startRetries();
  });
}

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