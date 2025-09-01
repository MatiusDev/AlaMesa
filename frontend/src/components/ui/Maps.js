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
    
    // Ocultar loading y mostrar controles
    const loadingEl = document.getElementById('map-loading');
    const controlsEl = document.getElementById('map-controls');
    
    if (loadingEl) loadingEl.style.display = 'none';
    if (controlsEl) controlsEl.classList.remove('hidden');
    
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
      <div class="text-center mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-3">Explora Lugares</h2>
        <p class="text-gray-600 max-w-2xl mx-auto">Descubre restaurantes, puntos de interés y ubicaciones populares en Medellín y sus alrededores</p>
      </div>
      
      <div class="rounded-[var(--am-radius)] border border-neutral-200 shadow-soft bg-white p-6">
        <div class="mb-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 bg-am-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-search text-am-600"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Buscar Ubicación</h3>
              <p class="text-sm text-gray-500">Encuentra lugares por nombre, dirección o barrio</p>
            </div>
          </div>
          
          <div class="relative">
            <input 
              id="restaurant-search-input" 
              type="text" 
              placeholder="Escribe aquí el lugar que quieres buscar..."
              class="w-full px-4 py-3 pl-12 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-am-600 focus:border-transparent transition-all duration-200"
            />
            <i class="fas fa-map-marker-alt absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <button 
              id="search-button"
              class="absolute right-2 top-1/2 -translate-y-1/2 bg-am-600 hover:bg-am-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2"
              onclick="performSearch()"
            >
              <i class="fas fa-search text-xs"></i>
              <span id="search-button-text">Buscar</span>
            </button>
          </div>
        </div>
        
        <div class="mb-4 p-4 bg-am-50 rounded-lg border border-am-200">
          <div class="flex items-center gap-2 mb-2">
            <i class="fas fa-info-circle text-am-600"></i>
            <span class="text-sm font-medium text-am-800">Información del Mapa</span>
          </div>
          <p class="text-xs text-am-700">Haz clic en cualquier punto del mapa para obtener detalles, o usa la búsqueda para encontrar ubicaciones específicas</p>
        </div>
        
        <div id="restaurant-search-map" class="h-[400px] w-full rounded-lg overflow-hidden border border-gray-200 shadow-inner relative">
          <div id="map-loading" class="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <div class="text-center">
              <div class="animate-spin rounded-full h-12 w-12 border-4 border-am-200 border-t-am-600 mx-auto mb-4"></div>
              <p class="text-gray-600 font-medium">Cargando mapa de Medellín...</p>
              <p class="text-gray-500 text-sm mt-1">Preparando la experiencia de búsqueda</p>
            </div>
          </div>
          
          <div id="map-controls" class="absolute top-4 right-4 hidden">
            <div class="flex flex-col gap-2">
              <button 
                onclick="resetMapView()"
                class="w-10 h-10 bg-white hover:bg-gray-50 rounded-lg shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-am-600 transition-all duration-200"
                title="Restablecer vista del mapa"
              >
                <i class="fas fa-home"></i>
              </button>
              <button 
                onclick="toggleMapType()"
                class="w-10 h-10 bg-white hover:bg-gray-50 rounded-lg shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-am-600 transition-all duration-200"
                title="Cambiar tipo de mapa"
              >
                <i class="fas fa-layer-group"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Función para realizar búsquedas
function performSearch() {
  const searchInput = document.getElementById('restaurant-search-input');
  const searchButton = document.getElementById('search-button');
  const searchButtonText = document.getElementById('search-button-text');
  const searchTerm = searchInput.value.trim();
  
  if (!searchTerm) {
    showSearchFeedback('Por favor, ingresa un lugar para buscar', 'warning');
    return;
  }
  
  if (!mapInstance) {
    showSearchFeedback('El mapa aún se está cargando, espera un momento...', 'info');
    return;
  }
  
  // Mostrar estado de carga en el botón
  if (searchButton && searchButtonText) {
    searchButton.disabled = true;
    searchButton.classList.add('opacity-75', 'cursor-not-allowed');
    searchButtonText.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Buscando...';
  }
  
  // Usar la API de Google Places para buscar
  if (searchBox && google && google.maps && google.maps.places) {
    // Crear una nueva búsqueda con Places API
    const service = new google.maps.places.PlacesService(mapInstance);
    
    const request = {
      query: searchTerm,
      fields: ['name', 'geometry', 'formatted_address', 'rating', 'types']
    };
    
    service.findPlaceFromQuery(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
        const place = results[0];
        
        // Centrar el mapa en el lugar encontrado
        if (place.geometry && place.geometry.location) {
          mapInstance.setCenter(place.geometry.location);
          mapInstance.setZoom(16);
          
          // Crear marcador del lugar
          if (currentMarker) {
            currentMarker.setMap(null);
          }
          
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
          showSearchFeedback(`Lugar encontrado: ${place.name}`, 'success');
        }
      } else {
        // Si no se encuentra, hacer búsqueda de texto
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: searchTerm + ', Medellín, Colombia' }, (results, status) => {
          if (status === 'OK' && results && results.length > 0) {
            const location = results[0].geometry.location;
            mapInstance.setCenter(location);
            mapInstance.setZoom(15);
            
            // Crear marcador
            if (currentMarker) {
              currentMarker.setMap(null);
            }
            
            currentMarker = new google.maps.Marker({
              position: location,
              map: mapInstance,
              title: searchTerm,
              icon: {
                url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                scaledSize: new google.maps.Size(32, 32)
              }
            });
            
            showSearchFeedback(`Ubicación encontrada: ${searchTerm}`, 'success');
          } else {
            showSearchFeedback(`No se pudo encontrar: ${searchTerm}`, 'error');
          }
        });
      }
    });
  } else {
    showSearchFeedback('Error: API de Google Places no disponible', 'error');
  }
  
  // Restaurar el botón después de la búsqueda
  setTimeout(() => {
    if (searchButton && searchButtonText) {
      searchButton.disabled = false;
      searchButton.classList.remove('opacity-75', 'cursor-not-allowed');
      searchButtonText.innerHTML = 'Buscar';
    }
  }, 2000);
}

// Función para mostrar feedback de búsqueda
function showSearchFeedback(message, type = 'info') {
  // Crear o actualizar el elemento de feedback
  let feedbackEl = document.getElementById('search-feedback');
  if (!feedbackEl) {
    feedbackEl = document.createElement('div');
    feedbackEl.id = 'search-feedback';
    feedbackEl.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 z-[9999] px-4 py-2 rounded-lg shadow-lg transition-all duration-300';
    document.body.appendChild(feedbackEl);
  }
  
  // Configurar colores según el tipo
  const colors = {
    success: 'bg-green-600 text-white',
    warning: 'bg-yellow-600 text-white',
    info: 'bg-blue-600 text-white',
    error: 'bg-red-600 text-white'
  };
  
  feedbackEl.className = `fixed top-20 left-1/2 transform -translate-x-1/2 z-[9999] px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${colors[type]}`;
  feedbackEl.textContent = message;
  
  // Ocultar después de 3 segundos
  setTimeout(() => {
    feedbackEl.remove();
  }, 3000);
}

// Función para restablecer la vista del mapa
function resetMapView() {
  if (mapInstance) {
    const medellin = { lat: 6.2442, lng: -75.5812 };
    mapInstance.setCenter(medellin);
    mapInstance.setZoom(12);
    showSearchFeedback('Vista del mapa restablecida', 'success');
  }
}

// Función para cambiar el tipo de mapa
function toggleMapType() {
  if (mapInstance) {
    const currentMapType = mapInstance.getMapTypeId();
    const newMapType = currentMapType === google.maps.MapTypeId.ROADMAP 
      ? google.maps.MapTypeId.SATELLITE 
      : google.maps.MapTypeId.ROADMAP;
    
    mapInstance.setMapTypeId(newMapType);
    
    const mapTypeText = newMapType === google.maps.MapTypeId.SATELLITE ? 'Satélite' : 'Mapa';
    showSearchFeedback(`Vista cambiada a ${mapTypeText}`, 'info');
  }
}

// Función para inicializar el mapa después de renderizar
function initGoogleMapsComponent() {
  setTimeout(() => {
    setupMap();
    setupMapListeners();
    
    // Agregar listener para búsqueda con Enter
    const searchInput = document.getElementById('restaurant-search-input');
    if (searchInput) {
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          performSearch();
        }
      });
    }
  }, 300);
}

// Hacer las funciones accesibles globalmente para los onclick del HTML
window.performSearch = performSearch;
window.resetMapView = resetMapView;
window.toggleMapType = toggleMapType;
window.showPlaceInfo = showPlaceInfo;

export { renderGoogleMaps, initGoogleMapsComponent };
