// --- Google Maps: Lógica robusta y autónoma ---

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

if (!GOOGLE_MAPS_API_KEY) {
  console.error("FATAL: La API Key de Google Maps no fue encontrada. El mapa no puede ser cargado.");
}

// Variables del mapa - singleton pattern
let mapInstance = null;
let currentMarker = null;
let infoWindow = null;
let googleApiPromise = null;

function loadGoogleMaps() {
  if (!googleApiPromise) {
    googleApiPromise = new Promise((resolve, reject) => {
      if (window.google?.maps) {
        return resolve();
      }
      if (!GOOGLE_MAPS_API_KEY) {
        return reject(new Error('La API Key de Google Maps es obligatoria.'));
      }
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`;
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = () => {
        googleApiPromise = null; // Permitir reintentos
        reject(new Error('No se pudo cargar el script de Google Maps.'));
      };
      document.head.appendChild(script);
    });
  }
  return googleApiPromise;
}

function showPlaceInfo(place) {
  if (!mapInstance || !currentMarker) return;
  const content = `
    <div style="font-family: inherit; max-width: 320px; padding: 0;">
      <div style="padding: 20px;">
        <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #1f2937; line-height: 1.4;">${place.name}</h3>
        ${place.formatted_address ? `<p style="margin: 0 0 12px 0; font-size: 14px; color: #374151; line-height: 1.5;">📍 ${place.formatted_address}</p>` : ''}
        ${place.rating ? `<p style="margin: 0 0 20px 0; font-size: 14px; color: #374151; line-height: 1.5;">⭐ ${place.rating}/5</p>` : ''}
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <button onclick="window.searchInAlaMesa('${place.name}')" style="width: 100%; background: #7c3aed; color: white; border: none; padding: 12px 16px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;">🔍 Buscar en AlaMesa</button>
          <button onclick="window.getDirections(${place.geometry.location.lat()}, ${place.geometry.location.lng()})" style="width: 100%; background: #4b5563; color: white; border: none; padding: 12px 16px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;">🗺️ Cómo llegar</button>
        </div>
      </div>
    </div>
  `;
  infoWindow.setContent(content);
  infoWindow.open(mapInstance, currentMarker);
}

function initMap(mapContainer) {
  try {
    mapContainer.innerHTML = ''; // Limpiamos el spinner
    mapInstance = new google.maps.Map(mapContainer, {
      center: { lat: 6.244203, lng: -75.581211 },
      zoom: 12, mapTypeControl: false, fullscreenControl: false, streetViewControl: false, zoomControl: true, gestureHandling: 'greedy'
    });
    infoWindow = new google.maps.InfoWindow({ pixelOffset: new google.maps.Size(0, -10) });
    const input = document.getElementById('restaurant-search-input');
    if (input) {
      const autocomplete = new google.maps.places.Autocomplete(input, { types: ['establishment', 'geocode'], componentRestrictions: { country: 'co' } });
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) return;
        if (currentMarker) currentMarker.setMap(null);
        mapInstance.setCenter(place.geometry.location);
        mapInstance.setZoom(16);
        currentMarker = new google.maps.Marker({ position: place.geometry.location, map: mapInstance, title: place.name });
        showPlaceInfo(place);
      });
    }
  } catch (e) { 
    console.error('Error al inicializar mapa:', e); 
  }
}

export function initGoogleMapsComponent() {
  const mapContainer = document.getElementById('restaurant-search-map');
  
  // 1. Si no hay contenedor, no hacemos nada.
  if (!mapContainer) return;

  // 2. Si el mapa ya está renderizado dentro del contenedor, no hacemos nada.
  // La clase .gm-style es un indicador fiable de que la API de Google ya ha actuado.
  if (mapContainer.querySelector('.gm-style')) {
    return;
  }

  // 3. Si llegamos aquí, el contenedor existe pero está vacío o con el spinner.
  // Procedemos a inicializar.
  loadGoogleMaps()
    .then(() => {
      // Un pequeño delay puede ayudar a asegurar que el DOM esté completamente listo.
      setTimeout(() => initMap(mapContainer), 100);
    })
    .catch(error => {
      console.error(error);
      mapContainer.innerHTML = `<p style="text-align: center; color: red;">${error.message}</p>`;
    });
}

export function destroyGoogleMap() {
  if (currentMarker) currentMarker.setMap(null);
  mapInstance = null; 
  currentMarker = null; 
  infoWindow = null;
  // Ya no necesitamos limpiar el contenedor, el motor de renderizado se encarga.
}

export function renderGoogleMaps() {
  // Esta función ahora solo devuelve el HTML estático. La inteligencia está en initGoogleMapsComponent.
  return `
    <div class="mt-16">
      <div class="text-center mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-3">Explora Lugares</h2>
        <p class="text-gray-600 max-w-2xl mx-auto">Descubre restaurantes y puntos de interés.</p>
      </div>
      <div class="rounded-[var(--am-radius)] border border-neutral-200 shadow-soft bg-white p-6">
        <div class="relative mb-4">
          <input id="restaurant-search-input" type="text" placeholder="Busca un lugar en Google Maps..." class="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-am-600 focus:border-transparent"/>
          <i class="fas fa-map-marker-alt absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
        </div>
        <div id="restaurant-search-map" data-no-diff="true" class="h-[400px] w-full rounded-lg overflow-hidden border border-gray-200 shadow-inner relative">
          <div id="map-loading" class="absolute inset-0 h-full w-full flex items-center justify-center bg-gray-50 z-10">
            <div class="text-center">
              <div class="animate-spin rounded-full h-12 w-12 border-4 border-am-200 border-t-am-600 mx-auto mb-4"></div>
              <p class="font-medium text-gray-600">Cargando mapa...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

window.searchInAlaMesa = (name) => alert(`Buscar "${name}" en AlaMesa.`);
window.getDirections = (lat, lng) => window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
