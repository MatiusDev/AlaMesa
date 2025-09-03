// --- Google Maps: Lógica 100% revertida al estilo de old/Maps.js para estabilidad y velocidad ---

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

let mapInstance = null;
let currentMarker = null;
let infoWindow = null;
let mapInitialized = false;
let isInitializing = false;

function loadGoogleMaps() {
  if (window.google && window.google.maps) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error('No se pudo cargar el script de Google Maps.'));
    document.head.appendChild(script);
  });
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

function initMap() {
  if (isInitializing || mapInitialized) return;
  const mapContainer = document.getElementById('restaurant-search-map');
  if (!mapContainer) return;
  isInitializing = true;
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
    mapInitialized = true;
  } catch (e) { console.error('Error al inicializar mapa:', e); } finally { isInitializing = false; }
}

function setupMap() {
  if (mapInitialized || isInitializing) return;
  const mapContainer = document.getElementById('restaurant-search-map');
  if (mapContainer && !mapInstance) {
    loadGoogleMaps().then(() => { setTimeout(initMap, 500); });
  }
}

export function initGoogleMapsComponent() {
  if (mapInitialized || isInitializing) return;
  setTimeout(setupMap, 300);
}

export function destroyGoogleMap() {
  if (currentMarker) currentMarker.setMap(null);
  mapInstance = null; currentMarker = null; infoWindow = null; mapInitialized = false; isInitializing = false;
  const mapContainer = document.getElementById('restaurant-search-map');
  if (mapContainer) mapContainer.innerHTML = '';
}

export function renderGoogleMaps() {
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
        <div id="restaurant-search-map" class="h-[400px] w-full rounded-lg overflow-hidden border border-gray-200 shadow-inner relative">
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
