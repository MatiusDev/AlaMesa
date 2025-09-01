import RestaurantCard from '@components/ui/RestaurantCard.js';
import { getRestaurants } from '@api/restaurantService.js';

const Restaurants = () => {
  const state = {
    restaurants: [],
    filteredRestaurants: [],
    loading: true,
    error: null,
    searchQuery: '',
    selectedLocation: '',
    selectedCuisine: '',
    selectedPrice: '',
    selectedRating: '',
    showFilters: false,
    showSearchSuggestions: false,
    // Obtener parámetros de la URL
    urlParams: (() => {
      const hash = window.location.hash || '#/restaurants';
      const [, queryString = ''] = hash.split('?');
      const params = new URLSearchParams(queryString);
      return {
        q: params.get('q') || '',
        loc: params.get('loc') || '',
        cuisine: params.get('cuisine') || '',
        date: params.get('date') || '',
        time: params.get('time') || '',
        partySize: params.get('partySize') || '',
        restaurant: params.get('restaurant') || '' // Nuevo parámetro para restaurante específico
      };
    })(),
    selectedRestaurant: null // Para mostrar detalles de un restaurante específico
  };

  const actions = {
    // Cargar restaurantes desde la API
    loadRestaurants: async () => {
      try {
        state.loading = true;
        state.error = null;
        const data = await getRestaurants();
        state.restaurants = data || [];
        state.filteredRestaurants = [...state.restaurants];
        
        // Si hay un restaurante específico seleccionado, encontrarlo
        if (state.urlParams.restaurant) {
          const selected = state.restaurants.find(r => 
            r.restaurant_id === state.urlParams.restaurant || r.id === state.urlParams.restaurant
          );
          if (selected) {
            state.selectedRestaurant = selected;
            // Filtrar para mostrar solo este restaurante
            state.filteredRestaurants = [selected];
          }
        }
        
        state.loading = false;
      } catch (error) {
        console.error('Error cargando restaurantes:', error);
        state.error = 'Error al cargar los restaurantes. Intenta de nuevo.';
        state.loading = false;
      }
    },

    // Aplicar filtros
    applyFilters: () => {
      let filtered = [...state.restaurants];

      // Filtro por búsqueda de texto
      if (state.searchQuery) {
        filtered = filtered.filter(restaurant => 
          restaurant.name?.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
          restaurant.restaurant_type?.some(type => 
            type.toLowerCase().includes(state.searchQuery.toLowerCase())
          ) ||
          restaurant.city?.toLowerCase().includes(state.searchQuery.toLowerCase())
        );
      }

      // Filtro por ubicación
      if (state.selectedLocation) {
        filtered = filtered.filter(restaurant => 
          restaurant.city === state.selectedLocation
        );
      }

      // Filtro por tipo de cocina
      if (state.selectedCuisine) {
        filtered = filtered.filter(restaurant => 
          restaurant.restaurant_type?.some(type => type === state.selectedCuisine)
        );
      }

      // Filtro por precio
      if (state.selectedPrice) {
        filtered = filtered.filter(restaurant => 
          restaurant.price_range === state.selectedPrice
        );
      }

      // Filtro por rating
      if (state.selectedRating) {
        const minRating = parseFloat(state.selectedRating);
        filtered = filtered.filter(restaurant => 
          (restaurant.rating || 0) >= minRating
        );
      }

      state.filteredRestaurants = filtered;
      console.log('Filtros aplicados:', {
        searchQuery: state.searchQuery,
        selectedLocation: state.selectedLocation,
        selectedCuisine: state.selectedCuisine,
        selectedPrice: state.selectedPrice,
        selectedRating: state.selectedRating,
        totalRestaurants: state.restaurants.length,
        filteredCount: filtered.length
      });
    },

    // Actualizar búsqueda
    updateSearch: (e) => {
      state.searchQuery = e.target.value;
      actions.applyFilters();
    },

    // Seleccionar ubicación
    selectLocation: (location) => {
      state.selectedLocation = state.selectedLocation === location ? '' : location;
      actions.applyFilters();
    },

    // Seleccionar tipo de cocina
    selectCuisine: (cuisine) => {
      state.selectedCuisine = state.selectedCuisine === cuisine ? '' : cuisine;
      actions.applyFilters();
    },

    // Seleccionar rango de precio
    selectPrice: (price) => {
      state.selectedPrice = state.selectedPrice === price ? '' : price;
      actions.applyFilters();
    },

    // Seleccionar rating mínimo
    selectRating: (rating) => {
      state.selectedRating = state.selectedRating === rating ? '' : rating;
      actions.applyFilters();
    },

    // Limpiar todos los filtros
    clearAllFilters: () => {
      state.searchQuery = '';
      state.selectedLocation = '';
      state.selectedCuisine = '';
      state.selectedPrice = '';
      state.selectedRating = '';
      state.filteredRestaurants = [...state.restaurants];
    },

    // Toggle de filtros móvil
    toggleFilters: () => {
      state.showFilters = !state.showFilters;
    },

    // Volver a ver todos los restaurantes
    showAllRestaurants: () => {
      state.selectedRestaurant = null;
      state.filteredRestaurants = [...state.restaurants];
      // Limpiar la URL
      window.location.hash = '#/restaurants';
    },

    // Mostrar sugerencias de búsqueda
    showSearchSuggestions: () => {
      if (state.searchQuery) {
        state.showSearchSuggestions = true;
      }
    },

    // Ocultar sugerencias de búsqueda
    hideSearchSuggestions: () => {
      setTimeout(() => {
        state.showSearchSuggestions = false;
      }, 200);
    },

    // Obtener sugerencias de búsqueda inteligentes
    getSearchSuggestions: () => {
      if (!state.searchQuery || state.searchQuery.length < 2) return [];
      
      const query = state.searchQuery.toLowerCase();
      const suggestions = [];
      
      // Buscar en nombres de restaurantes
      const nameMatches = state.restaurants
        .filter(r => r.name?.toLowerCase().includes(query))
        .slice(0, 3)
        .map(r => ({
          text: r.name,
          description: `${r.restaurant_type?.[0] || 'Restaurante'} en ${r.city || 'Ubicación'}`,
          icon: 'fa-utensils'
        }));
      
      // Buscar en tipos de cocina
      const cuisineMatches = [...new Set(
        state.restaurants.flatMap(r => r.restaurant_type || [])
      )]
        .filter(cuisine => cuisine.toLowerCase().includes(query))
        .slice(0, 2)
        .map(cuisine => ({
          text: cuisine,
          description: 'Tipo de cocina',
          icon: 'fa-bowl-food'
        }));
      
      // Buscar en ciudades
      const cityMatches = [...new Set(
        state.restaurants.map(r => r.city).filter(Boolean)
      )]
        .filter(city => city.toLowerCase().includes(query))
        .slice(0, 2)
        .map(city => ({
          text: city,
          description: 'Ubicación',
          icon: 'fa-location-dot'
        }));
      
      suggestions.push(...nameMatches, ...cuisineMatches, ...cityMatches);
      return suggestions.slice(0, 6);
    },

    // Seleccionar sugerencia de búsqueda
    selectSearchSuggestion: (e) => {
      const suggestion = e.currentTarget.dataset.suggestion;
      state.searchQuery = suggestion;
      state.showSearchSuggestions = false;
      actions.applyFilters();
    },

    // Limpiar búsqueda
    clearSearch: () => {
      state.searchQuery = '';
      state.showSearchSuggestions = false;
      actions.applyFilters();
    }
  };

  // Cargar restaurantes al inicializar
  setTimeout(() => actions.loadRestaurants(), 100);

  const view = () => {
    const { q, loc, cuisine, date, time, partySize } = state.urlParams;
    
    // Chips de filtros activos desde la URL
    const urlChips = [
      q && `📌 "${q}"`,
      loc && `📍 ${loc}`,
      cuisine && `🍽️ ${cuisine}`,
      date && time && `🗓️ ${date} ${time}`,
      partySize && `👥 ${partySize} pers.`
    ].filter(Boolean);

    // Obtener ubicaciones únicas de los restaurantes
    const uniqueLocations = [...new Set(state.restaurants.map(r => r.city).filter(Boolean))];
    
    // Obtener tipos de cocina únicos
    const uniqueCuisines = [...new Set(
      state.restaurants.flatMap(r => r.restaurant_type || []).filter(Boolean)
    )];

    return `
      <section class="mx-auto max-w-7xl px-4 pt-24 pb-10">
        <!-- Header con título y chips de URL -->
        <div class="text-center">
          <h1 class="text-3xl sm:text-4xl font-bold">Restaurantes</h1>
          ${urlChips.length ? `
            <div class="mt-3 flex flex-wrap justify-center gap-2">
              ${urlChips.map(c => `<span class="rounded-full border border-neutral-200 bg-white px-3 py-1 text-sm shadow-soft">${c}</span>`).join('')}
            </div>
          ` : `
            <p class="text-neutral-500 mt-2">Explora y filtra con la barra de búsqueda.</p>
          `}
        </div>

        <!-- Barra de búsqueda y filtros -->
        <div class="mt-8 bg-white rounded-[var(--am-radius)] border border-neutral-200 shadow-soft p-4">
          <!-- Barra de búsqueda principal mejorada -->
          <div class="relative mb-6">
            <div class="relative">
              <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-lg"></i>
              <input 
                type="text" 
                placeholder="Buscar restaurantes, tipos de comida, ubicaciones..."
                value="${state.searchQuery}"
                data-oninput="updateSearch"
                data-onfocus="showSearchSuggestions"
                data-onblur="hideSearchSuggestions"
                class="w-full pl-12 pr-4 py-4 border-2 border-neutral-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-am-600 focus:border-am-600 transition-all duration-200 shadow-sm hover:shadow-md"
              />
              ${state.searchQuery ? `
                <button 
                  data-onclick="clearSearch"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <i class="fa-solid fa-times text-lg"></i>
                </button>
              ` : ''}
            </div>
            
            <!-- Sugerencias de búsqueda desplegables -->
            ${state.searchQuery && state.showSearchSuggestions ? `
              <div class="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
                ${actions.getSearchSuggestions().map(suggestion => `
                  <button 
                    data-onclick="selectSearchSuggestion"
                    data-suggestion="${suggestion.text}"
                    class="w-full text-left px-4 py-3 hover:bg-neutral-50 border-b border-neutral-100 last:border-b-0 transition-colors"
                  >
                    <div class="flex items-center gap-3">
                      <i class="fa-solid ${suggestion.icon} text-am-600 w-5"></i>
                      <div>
                        <div class="font-medium text-neutral-900">${suggestion.text}</div>
                        <div class="text-sm text-neutral-500">${suggestion.description}</div>
                      </div>
                    </div>
                  </button>
                `).join('')}
              </div>
            ` : ''}
          </div>

          <!-- Botón toggle filtros móvil -->
          <div class="md:hidden mb-4">
            <button 
              data-onclick="toggleFilters"
              class="w-full flex items-center justify-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50"
            >
              <i class="fa-solid fa-filter"></i>
              Filtros
              <i class="fa-solid fa-chevron-down transition-transform ${state.showFilters ? 'rotate-180' : ''}"></i>
            </button>
          </div>

          <!-- Filtros expandibles -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 ${state.showFilters ? 'block' : 'hidden md:grid'}">
            <!-- Filtro de ubicación -->
            <div class="relative">
              <label class="block text-sm font-medium text-neutral-700 mb-2">Ubicación</label>
              <div class="flex flex-wrap gap-2">
                ${uniqueLocations.map(location => `
                  <button 
                    data-onclick="selectLocation" 
                    data-location="${location}"
                    class="px-3 py-1 rounded-full border text-sm transition-colors ${
                      state.selectedLocation === location 
                        ? 'border-am-600 text-am-700 bg-am-50' 
                        : 'border-neutral-300 hover:border-neutral-400'
                    }"
                  >
                    ${location}
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Filtro de tipo de cocina -->
            <div class="relative">
              <label class="block text-sm font-medium text-neutral-700 mb-2">Tipo de comida</label>
              <div class="flex flex-wrap gap-2">
                ${uniqueCuisines.slice(0, 6).map(cuisineType => `
                  <button 
                    data-onclick="selectCuisine" 
                    data-cuisine="${cuisineType}"
                    class="px-3 py-1 rounded-full border text-sm transition-colors ${
                      state.selectedCuisine === cuisineType 
                        ? 'border-am-600 text-am-700 bg-am-50' 
                        : 'border-neutral-300 hover:border-neutral-400'
                    }"
                  >
                    ${cuisineType}
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Filtro de precio -->
            <div class="relative">
              <label class="block text-sm font-medium text-neutral-700 mb-2">Precio</label>
              <div class="flex flex-wrap gap-2">
                ${['$', '$$', '$$$', '$$$$'].map(price => `
                  <button 
                    data-onclick="selectPrice" 
                    data-price="${price}"
                    class="px-3 py-1 rounded-full border text-sm transition-colors ${
                      state.selectedPrice === price 
                        ? 'border-am-600 text-am-700 bg-am-50' 
                        : 'border-neutral-300 hover:border-neutral-400'
                    }"
                  >
                    ${price}
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Filtro de rating -->
            <div class="relative">
              <label class="block text-sm font-medium text-neutral-700 mb-2">Rating mínimo</label>
              <div class="flex flex-wrap gap-2">
                ${[4.5, 4.0, 3.5, 3.0].map(rating => `
                  <button 
                    data-onclick="selectRating" 
                    data-rating="${rating}"
                    class="px-3 py-1 rounded-full border text-sm transition-colors ${
                      state.selectedRating === rating.toString() 
                        ? 'border-am-600 text-am-700 bg-am-50' 
                        : 'border-neutral-300 hover:border-neutral-400'
                    }"
                  >
                    ${rating}+ ⭐
                  </button>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Botón limpiar filtros -->
          ${(state.searchQuery || state.selectedLocation || state.selectedCuisine || state.selectedPrice || state.selectedRating) ? `
            <div class="mt-4 pt-4 border-t border-neutral-200">
              <button 
                data-onclick="clearAllFilters"
                class="text-sm text-neutral-500 hover:text-neutral-700 hover:underline"
              >
                <i class="fa-solid fa-times mr-1"></i>
                Limpiar todos los filtros
              </button>
            </div>
          ` : ''}
        </div>

        <!-- Contenido principal -->
        <div class="mt-8">
          ${state.loading ? `
            <!-- Estado de carga -->
            <div class="text-center py-12">
              <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-am-600"></div>
              <p class="mt-4 text-neutral-500">Cargando restaurantes...</p>
            </div>
          ` : state.error ? `
            <!-- Estado de error -->
            <div class="text-center py-12">
              <i class="fa-solid fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
              <p class="text-red-600 mb-4">${state.error}</p>
              <button 
                data-onclick="loadRestaurants"
                class="px-4 py-2 bg-am-600 text-white rounded-lg hover:bg-am-700 transition-colors"
              >
                Intentar de nuevo
              </button>
            </div>
          ` : state.filteredRestaurants.length === 0 ? `
            <!-- Sin resultados -->
            <div class="text-center py-12">
              <i class="fa-solid fa-search text-4xl text-neutral-400 mb-4"></i>
              <p class="text-neutral-500 mb-2">No se encontraron restaurantes</p>
              <p class="text-sm text-neutral-400">Intenta ajustar los filtros de búsqueda</p>
            </div>
          ` : `
            <!-- Lista de restaurantes -->
            <div class="mb-6 flex items-center justify-between">
              <p class="text-neutral-600">
                Mostrando <span class="font-medium">${state.filteredRestaurants.length}</span> 
                de <span class="font-medium">${state.restaurants.length}</span> restaurantes
              </p>
              ${state.selectedRestaurant ? `
                <button 
                  data-onclick="showAllRestaurants"
                  class="px-4 py-2 text-sm text-am-600 hover:text-am-700 hover:underline"
                >
                  <i class="fa-solid fa-arrow-left mr-1"></i>
                  Ver todos los restaurantes
                </button>
              ` : ''}
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              ${state.filteredRestaurants.map(restaurant => RestaurantCard(restaurant)).join('')}
            </div>
          `}
        </div>
      </section>
    `;
  };

  return { state, actions, view };
};

export default Restaurants;