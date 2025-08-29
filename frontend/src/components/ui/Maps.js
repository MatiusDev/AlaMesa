// --- Google Maps simple para mostrar información del lugar ---
const GOOGLE_MAPS_API_KEY = 'AIzaSyC3lKjXeWD9LVoh6rtBoofI-B1Nqo4K_V0';

// Variables del mapa
let mapInstance = null;
let searchBox = null;
let currentMarker = null;
let infoWindow = null;
let mapContainer = null;
let mapInitialized = false;

// Cargar Google Maps
function loadGoogleMaps() {
  if (window.google?.maps) return Promise.resolve();
  
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps'));
    document.head.appendChild(script);
  });
}

// Verificar que la API esté funcionando
function checkAPIHealth() {
  if (!window.google?.maps) {
    console.log('API de Google Maps no disponible, recargando...');
    reloadGoogleMaps();
    return false;
  }
  
  if (!mapInstance) {
    console.log('Instancia del mapa perdida, reinicializando...');
    initMap();
    return false;
  }
  
  return true;
}

// Recargar Google Maps si es necesario
function reloadGoogleMaps() {
  console.log('Recargando Google Maps...');
  
  // Limpiar variables
  mapInstance = null;
  searchBox = null;
  currentMarker = null;
  infoWindow = null;
  mapInitialized = false;
  
  // Recargar script
  loadGoogleMaps().then(() => {
    console.log('Google Maps recargado, reinicializando...');
    setTimeout(() => {
      initMap();
    }, 1000);
  }).catch(error => {
    console.error('Error al recargar Google Maps:', error);
  });
}

// Inicializar mapa simple
function initMap() {
  mapContainer = document.getElementById('restaurant-search-map');
  if (!mapContainer || mapInstance) return;
  
  try {
    // Verificar que la API esté disponible
    if (!window.google?.maps) {
      console.log('API no disponible, esperando...');
      setTimeout(initMap, 500);
      return;
    }
    
    // Limpiar contenedor
    mapContainer.innerHTML = '';
    
    // Crear mapa centrado en Medellín
    mapInstance = new google.maps.Map(mapContainer, {
      center: { lat: 6.244203, lng: -75.581211 },
      zoom: 12,
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      zoomControl: true
    });

    // Crear InfoWindow con estilos personalizados
    infoWindow = new google.maps.InfoWindow({
      pixelOffset: new google.maps.Size(0, -10)
    });

    console.log('Mapa creado, configurando búsqueda...');
    
    // Configurar SearchBox
    const input = document.getElementById('restaurant-search-input');
    if (input) {
      searchBox = new google.maps.places.SearchBox(input);
      
      // Evento cuando se selecciona un lugar
      searchBox.addListener('places_changed', () => {
        // Verificar que la API esté funcionando
        if (!checkAPIHealth()) return;
        
        const places = searchBox.getPlaces();
        if (places.length === 0) return;

        // Limpiar marcador anterior
        if (currentMarker) {
          currentMarker.setMap(null);
        }
        
        // Obtener el lugar seleccionado
        const place = places[0];
        
        if (!place.geometry || !place.geometry.location) {
          console.log("No se encontró información de ubicación para este lugar.");
          return;
        }

        // Centrar mapa en el lugar
        mapInstance.setCenter(place.geometry.location);
        mapInstance.setZoom(16);

        // Crear marcador del lugar
        currentMarker = new google.maps.Marker({
          position: place.geometry.location,
          map: mapInstance,
          title: place.name,
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
            scaledSize: new google.maps.Size(32, 32)
          }
        });

        // Mostrar información del lugar
        showPlaceInfo(place);
      });
      
      console.log('Búsqueda configurada correctamente');
    }

    mapInitialized = true;
    console.log('Mapa inicializado correctamente');
    
  } catch (error) {
    console.error('Error al inicializar el mapa:', error);
    // Si hay error, intentar recargar
    setTimeout(() => {
      reloadGoogleMaps();
    }, 2000);
  }
}

// Mostrar información del lugar con tipografía consistente
function showPlaceInfo(place) {
  if (!mapInstance || !currentMarker) return;
  
  const content = `
    <div style="font-family: inherit; max-width: 320px; padding: 0;">
      <div style="padding: 20px;">
        <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #1f2937; line-height: 1.4; font-family: inherit;">
          ${place.name}
        </h3>
        
        ${place.formatted_address ? `
          <p style="margin: 0 0 12px 0; font-size: 14px; color: #374151; line-height: 1.5; font-family: inherit; font-weight: 600;">
            📍 ${place.formatted_address}
          </p>
        ` : ''}
        
        ${place.rating ? `
          <p style="margin: 0 0 20px 0; font-size: 14px; color: #374151; line-height: 1.5; font-family: inherit; font-weight: 600;">
            ⭐ ${place.rating}/5
          </p>
        ` : ''}
        
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <button onclick="searchInAlaMesa('${place.name}')" style="width: 100%; background: #7c3aed; color: white; border: none; padding: 12px 16px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; font-family: inherit; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);">
            🔍 Buscar en AlaMesa
          </button>
          <button onclick="getDirections(${place.geometry.location.lat()}, ${place.geometry.location.lng()})" style="width: 100%; background: #4b5563; color: white; border: none; padding: 12px 16px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; font-family: inherit; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);">
            🗺️ Cómo llegar
          </button>
        </div>
      </div>
    </div>
  `;
  
  infoWindow.setContent(content);
  infoWindow.open(mapInstance, currentMarker);
}

// Función global para buscar en AlaMesa
window.searchInAlaMesa = function(placeName) {
  console.log(`Buscando "${placeName}" en AlaMesa...`);
  // Aquí puedes implementar la búsqueda en tu aplicación
  alert(`Buscando "${placeName}" en AlaMesa...\n\nEsta funcionalidad te permitirá ver si el lugar está disponible para reservar en nuestra plataforma.`);
};

// Función global para obtener direcciones
window.getDirections = function(lat, lng) {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  window.open(url, '_blank');
};

// Inicializar mapa
function setupMap() {
  mapContainer = document.getElementById('restaurant-search-map');
  if (mapContainer && !mapInstance) {
    console.log('Configurando mapa...');
    loadGoogleMaps().then(() => {
      console.log('Google Maps cargado, inicializando mapa...');
      setTimeout(() => {
        initMap();
      }, 500);
    }).catch(error => {
      console.error('Error al cargar Google Maps:', error);
    });
  }
}

// Configurar listeners para mantener la API "viva"
function setupMapListeners() {
  // Verificar salud de la API periódicamente
  setInterval(() => {
    if (mapInitialized) {
      checkAPIHealth();
    }
  }, 5000); // Verificar cada 5 segundos
  
  // Verificar en scroll (con debouncing)
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      if (mapInitialized) {
        checkAPIHealth();
      }
    }, 1000); // Verificar 1 segundo después del scroll
  });
  
  // Verificar en resize
  window.addEventListener('resize', () => {
    if (mapInstance && mapInitialized) {
      google.maps.event.trigger(mapInstance, 'resize');
    }
  });
  
  // Verificar cuando la página vuelve a ser visible
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && mapInitialized) {
      setTimeout(() => {
        checkAPIHealth();
      }, 500);
    }
  });
}

// Función para renderizar el componente del mapa
function renderGoogleMaps() {
  return `
    <div class="mt-16">
      <h2 class="text-xl font-semibold mb-4">Buscar Lugar Específico</h2>
      <p class="text-neutral-600 mb-6">Busca un lugar específico y obtén su información detallada.</p>
      
      <div class="rounded-[var(--am-radius)] border border-neutral-200 shadow-soft bg-white p-6">
        <div class="mb-4">
          <label for="restaurant-search-input" class="block text-sm font-medium text-gray-700 mb-2">
            Buscar lugar por nombre o dirección
          </label>
          <input 
            id="restaurant-search-input" 
            type="text" 
            placeholder="Ej: El Poblado, Laureles, Envigado, Sabaneta..."
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-am-600 focus:border-transparent"
          />
          <p class="text-sm text-gray-500 mt-2">
            Escribe el nombre o dirección del lugar que quieres encontrar
          </p>
        </div>
        
        <div id="restaurant-search-map" class="h-[400px] w-full rounded-lg overflow-hidden border border-gray-200">
          <div class="h-full w-full flex items-center justify-center bg-gray-50">
            <div class="text-center">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-am-600 mx-auto mb-2"></div>
              <p class="text-gray-500">Cargando mapa...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Función para inicializar el mapa después de renderizar
function initGoogleMapsComponent() {
  setTimeout(() => {
    setupMap();
    setupMapListeners();
  }, 300);
}

export { renderGoogleMaps, initGoogleMapsComponent };
