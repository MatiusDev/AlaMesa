import { getRestaurantById } from '@api/restaurantService.js';

const RestaurantDetail = () => {
  const state = {
    restaurant: null,
    loading: true,
    error: null,
    showReservationModal: false,
    currentRestaurantId: null, // Para detectar cambios de ID
    reservationData: {
      date: '',
      time: '',
      partySize: 2,
      specialRequests: ''
    }
  };

  const actions = {
    // Cargar restaurante por ID desde la URL
    loadRestaurant: async () => {
      try {
        // Obtener ID del restaurante desde la URL
        const hash = window.location.hash || '#/restaurant/';
        const restaurantId = hash.split('/').pop();
        
        if (!restaurantId) {
          throw new Error('ID de restaurante no encontrado');
        }

        // Solo cargar si el ID ha cambiado
        if (state.currentRestaurantId === restaurantId && state.restaurant) {
          return; // Ya tenemos los datos de este restaurante
        }

        state.loading = true;
        state.error = null;
        state.currentRestaurantId = restaurantId;

        console.log('Cargando restaurante con ID:', restaurantId);
        const data = await getRestaurantById(restaurantId);
        state.restaurant = data;
        state.loading = false;
      } catch (error) {
        console.error('Error cargando restaurante:', error);
        state.error = 'Error al cargar los detalles del restaurante.';
        state.loading = false;
      }
    },

    // Volver a la lista de restaurantes
    goBack: () => {
      window.location.hash = '#/restaurants';
    },

    // Abrir modal de reserva
    openReservationModal: () => {
      state.showReservationModal = true;
    },

    // Cerrar modal de reserva
    closeReservationModal: () => {
      state.showReservationModal = false;
      // Resetear datos del formulario
      state.reservationData = {
        date: '',
        time: '',
        partySize: 2,
        specialRequests: ''
      };
    },

    // Actualizar datos de reserva
    updateReservationData: (field, value) => {
      state.reservationData[field] = value;
    },

    // Procesar reserva
    processReservation: (e) => {
      e.preventDefault();
      // TODO: Implementar lógica de reserva
      alert('Funcionalidad de reserva en desarrollo');
      actions.closeReservationModal();
    },

    // Generar estrellas para rating
    generateStars: (rating) => {
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 >= 0.5;
      return '★'.repeat(fullStars) + (hasHalfStar ? '☆' : '') + '☆'.repeat(5 - fullStars - (hasHalfStar ? 1 : 0));
    },

    // Formatear horarios de apertura
    formatOpeningHours: (openingHours) => {
      if (!openingHours) return 'Horarios no disponibles';
      
      if (typeof openingHours === 'string') {
        return openingHours;
      }
      
      if (typeof openingHours === 'object') {
        return Object.entries(openingHours)
          .map(([day, hours]) => `${day}: ${hours}`)
          .join('<br>');
      }
      
      return 'Horarios no disponibles';
    }
  };

  const onInit = () => {
    actions.loadRestaurant();
  };

  const onRender = () => {
    // Verificar si el ID del restaurante ha cambiado en cada render
    const hash = window.location.hash || '#/restaurant/';
    const restaurantId = hash.split('/').pop();
    
    if (restaurantId && restaurantId !== state.currentRestaurantId) {
      console.log('ID del restaurante cambió, recargando...', { 
        oldId: state.currentRestaurantId, 
        newId: restaurantId 
      });
      actions.loadRestaurant();
    }
  };

  const view = () => {
    if (state.loading) {
      return `
        <section class="mx-auto max-w-7xl px-4 pt-24 pb-10">
          <div class="text-center py-12">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-am-600"></div>
            <p class="mt-4 text-neutral-500">Cargando detalles del restaurante...</p>
          </div>
        </section>
      `;
    }

    if (state.error || !state.restaurant) {
      return `
        <section class="mx-auto max-w-7xl px-4 pt-24 pb-10">
          <div class="text-center py-12">
            <i class="fa-solid fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
            <p class="text-red-600 mb-4">${state.error || 'Restaurante no encontrado'}</p>
            <button 
              data-onclick="goBack"
              class="px-4 py-2 bg-am-600 text-white rounded-lg hover:bg-am-700 transition-colors"
            >
              <i class="fa-solid fa-arrow-left mr-2"></i>
              Volver a restaurantes
            </button>
          </div>
        </section>
      `;
    }

    const restaurant = state.restaurant;
    const stars = actions.generateStars(restaurant.rating || 0);
    const openingHours = actions.formatOpeningHours(restaurant.opening_hours);

    return `
      <section class="mx-auto max-w-7xl px-4 pt-24 pb-10">
        <!-- Botón de regreso -->
        <div class="mb-6">
          <button 
            data-onclick="goBack"
            class="flex items-center gap-2 text-am-600 hover:text-am-700 transition-colors"
          >
            <i class="fa-solid fa-arrow-left"></i>
            Volver a restaurantes
          </button>
        </div>

        <!-- Header del restaurante -->
        <div class="bg-white rounded-[var(--am-radius)] border border-neutral-200 shadow-soft overflow-hidden">
          <!-- Imagen principal -->
          <div class="relative h-64 md:h-80 lg:h-96">
            <img 
              src="${restaurant.images && restaurant.images.length > 0 
                ? restaurant.images[0] 
                : `https://picsum.photos/seed/${encodeURIComponent(restaurant.name)}/1200/600`}" 
              alt="${restaurant.name}" 
              class="w-full h-full object-cover"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            
            <!-- Badges -->
            <div class="absolute top-4 right-4 flex flex-col gap-2">
              <div class="bg-white/90 text-neutral-800 px-3 py-1 rounded-full text-sm font-medium">
                ${restaurant.price_range || '$$'}
              </div>
              <div class="bg-am-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                ${(restaurant.rating || 0).toFixed(1)} ⭐
              </div>
            </div>
          </div>

          <!-- Información principal -->
          <div class="p-6">
            <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div class="flex-1">
                <h1 class="text-3xl font-bold text-neutral-900 mb-2">${restaurant.name}</h1>
                
                <!-- Tipo de cocina -->
                <div class="flex flex-wrap gap-2 mb-4">
                  ${(restaurant.restaurant_type || []).map(type => `
                    <span class="px-3 py-1 bg-am-50 text-am-700 rounded-full text-sm font-medium">
                      ${type}
                    </span>
                  `).join('')}
                </div>

                <!-- Rating y reseñas -->
                <div class="flex items-center gap-4 mb-4">
                  <div class="flex items-center gap-2">
                    <span class="text-am-600 text-lg">${stars}</span>
                    <span class="text-neutral-600 font-medium">${(restaurant.rating || 0).toFixed(1)}</span>
                  </div>
                  <span class="text-neutral-500">
                    ${restaurant.reviews_count || 0} reseñas
                  </span>
                </div>

                <!-- Ubicación -->
                <div class="flex items-start gap-3 mb-4">
                  <i class="fa-solid fa-location-dot text-am-600 mt-1"></i>
                  <div>
                    <p class="text-neutral-900 font-medium">${restaurant.full_address}</p>
                    <p class="text-neutral-600">${restaurant.city}${restaurant.state ? `, ${restaurant.state}` : ''}</p>
                  </div>
                </div>

                <!-- Contacto -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  ${restaurant.phone ? `
                    <div class="flex items-center gap-3">
                      <i class="fa-solid fa-phone text-am-600"></i>
                      <a href="tel:${restaurant.phone}" class="text-neutral-700 hover:text-am-600 transition-colors">
                        ${restaurant.phone}
                      </a>
                    </div>
                  ` : ''}
                  
                  ${restaurant.email ? `
                    <div class="flex items-center gap-3">
                      <i class="fa-solid fa-envelope text-am-600"></i>
                      <a href="mailto:${restaurant.email}" class="text-neutral-700 hover:text-am-600 transition-colors">
                        ${restaurant.email}
                      </a>
                    </div>
                  ` : ''}
                  
                  ${restaurant.website ? `
                    <div class="flex items-center gap-3">
                      <i class="fa-solid fa-globe text-am-600"></i>
                      <a href="${restaurant.website}" target="_blank" class="text-neutral-700 hover:text-am-600 transition-colors">
                        Sitio web
                      </a>
                    </div>
                  ` : ''}
                </div>
              </div>

              <!-- Botón de reserva -->
              <div class="lg:w-80">
                <div class="bg-gradient-to-r from-am-600 to-am-700 rounded-lg p-6 text-white">
                  <h3 class="text-xl font-bold mb-4">¿Listo para reservar?</h3>
                  <p class="text-am-100 mb-6">Reserva tu mesa y disfruta de una experiencia gastronómica única.</p>
                  <button 
                    data-onclick="openReservationModal"
                    class="w-full bg-white text-am-700 py-3 px-4 rounded-lg font-semibold hover:bg-am-50 transition-colors shadow-lg"
                  >
                    <i class="fa-solid fa-calendar-plus mr-2"></i>
                    Hacer Reserva
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Información adicional -->
        <div class="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Horarios de apertura -->
          <div class="bg-white rounded-[var(--am-radius)] border border-neutral-200 shadow-soft p-6">
            <h3 class="text-xl font-bold text-neutral-900 mb-4">
              <i class="fa-solid fa-clock text-am-600 mr-2"></i>
              Horarios de Apertura
            </h3>
            <div class="text-neutral-700" style="white-space: pre-line;">
              ${openingHours}
            </div>
          </div>

          <!-- Características -->
          ${restaurant.features && restaurant.features.length > 0 ? `
            <div class="bg-white rounded-[var(--am-radius)] border border-neutral-200 shadow-soft p-6">
              <h3 class="text-xl font-bold text-neutral-900 mb-4">
                <i class="fa-solid fa-star text-am-600 mr-2"></i>
                Características
              </h3>
              <div class="flex flex-wrap gap-2">
                ${restaurant.features.map(feature => `
                  <span class="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm">
                    ${feature}
                  </span>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Galería de imágenes -->
        ${restaurant.images && restaurant.images.length > 1 ? `
          <div class="mt-8">
            <h3 class="text-xl font-bold text-neutral-900 mb-4">
              <i class="fa-solid fa-images text-am-600 mr-2"></i>
              Galería
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              ${restaurant.images.slice(1).map((image, index) => `
                <div class="aspect-square overflow-hidden rounded-lg">
                  <img 
                    src="${image}" 
                    alt="${restaurant.name} - Imagen ${index + 2}" 
                    class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Modal de reserva -->
        ${state.showReservationModal ? `
          <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-lg max-w-md w-full p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-bold text-neutral-900">Hacer Reserva</h3>
                <button 
                  data-onclick="closeReservationModal"
                  class="text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <i class="fa-solid fa-times text-xl"></i>
                </button>
              </div>
              
              <form data-onsubmit="processReservation" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-neutral-700 mb-2">Fecha</label>
                  <input 
                    type="date" 
                    value="${state.reservationData.date}"
                    data-onchange="updateReservationData('date', this.value)"
                    class="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-am-600"
                    required
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-neutral-700 mb-2">Hora</label>
                  <input 
                    type="time" 
                    value="${state.reservationData.time}"
                    data-onchange="updateReservationData('time', this.value)"
                    class="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-am-600"
                    required
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-neutral-700 mb-2">Número de personas</label>
                  <select 
                    value="${state.reservationData.partySize}"
                    data-onchange="updateReservationData('partySize', parseInt(this.value))"
                    class="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-am-600"
                    required
                  >
                    ${[1,2,3,4,5,6,7,8].map(num => `
                      <option value="${num}" ${state.reservationData.partySize === num ? 'selected' : ''}>
                        ${num} ${num === 1 ? 'persona' : 'personas'}
                      </option>
                    `).join('')}
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-neutral-700 mb-2">Solicitudes especiales (opcional)</label>
                  <textarea 
                    value="${state.reservationData.specialRequests}"
                    data-onchange="updateReservationData('specialRequests', this.value)"
                    placeholder="Alergias, celebraciones especiales, etc."
                    class="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-am-600 h-20 resize-none"
                  ></textarea>
                </div>
                
                <div class="flex gap-3 pt-4">
                  <button 
                    type="button"
                    data-onclick="closeReservationModal"
                    class="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    class="flex-1 px-4 py-2 bg-am-600 text-white rounded-lg hover:bg-am-700 transition-colors"
                  >
                    Confirmar Reserva
                  </button>
                </div>
              </form>
            </div>
          </div>
        ` : ''}
      </section>
    `;
  };

  return { state, actions, view, onInit, onRender };
};

export default RestaurantDetail;
