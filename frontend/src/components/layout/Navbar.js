// frontend/src/components/layout/Navbar.js
import { clearUserData } from '@utils/localStorage.js';
import { getRestaurants } from '@api/restaurantService.js';

const Navbar = () => {
  const state = {
    query: '',
    location: '',
    cuisine: '',
    date: '',
    time: '',
    partySize: '',
    tempDate: '',
    tempTime: '',
    tempPartySize: '',
    calendarCursor: new Date().toISOString(),
    menuOpen: false,
    openField: null, // 'restaurant' | 'location' | 'cuisine' | 'datetime'
    expanded: false,
    compact: false,
    menuX: 16,
    menuY: 80,
    menuClosing: false,
    menuPosition: 'below', // 'above' | 'below'
    showFeedback: false,
    feedbackMessage: '',
    restaurants: [],
    allLocations: [],
    allCuisines: [],
    showSearchSuggestions: false,
    // Nuevos estados para autocompletado
    restaurantSuggestions: [],
    locationSuggestions: [],
    cuisineSuggestions: [],
    showRestaurantSuggestions: false,
    showLocationSuggestions: false,
    showCuisineSuggestions: false,
    searchTimeout: null,
    initialized: false, // Flag para controlar la carga inicial
  };

  const actions = {
    // Funciones de actualización mejoradas con autocompletado
    updateQuery: (e) => { 
      state.query = e.target.value; 
      actions.updateRestaurantSuggestions();
      
    },
    updateLocation: (e) => { 
      state.location = e.target.value; 
      actions.updateLocationSuggestions();
      
    },
    updateCuisine: (e) => { 
      state.cuisine = e.target.value; 
      actions.updateCuisineSuggestions();
      
    },
    updateDateTemp: (e) => { state.tempDate = e.target.value; },
    updateTimeTemp: (e) => { state.tempTime = e.target.value; },
    
    // Cargar restaurantes desde la API
    loadRestaurants: async () => {
      // Si ya hay restaurantes, no volver a cargar
      if (state.restaurants.length > 0) return;

      try {
        const data = await getRestaurants();
        state.restaurants = data || [];
        // Extraer ubicaciones y tipos de cocina �nicos
        // Ubicaciones fijas como solicitaste
        state.allLocations = ['Medellín', 'Envigado', 'Itaguí'];
        state.allCuisines = [...new Set(data.flatMap(r => r.restaurant_type || []).filter(Boolean))].sort();
        
        // Inicializar sugerencias
        state.restaurantSuggestions = state.restaurants.slice(0, 10);
        state.locationSuggestions = state.allLocations; // Mostrar todas las ubicaciones
        state.cuisineSuggestions = state.allCuisines; // Mostrar todos los tipos de cocina
      } catch (error) {
        console.error('Error cargando restaurantes en Navbar:', error);
      }
    },

    // Funciones de autocompletado
    updateRestaurantSuggestions: () => {
      if (!state.query || state.query.length < 1) {
        state.restaurantSuggestions = state.restaurants.slice(0, 10);
        state.showRestaurantSuggestions = false;
        return;
      }
      
      const query = state.query.toLowerCase().trim();
      console.log('Filtering with query:', query);
      
      // Filtrar restaurantes por nombre
      const restaurantMatches = state.restaurants
        .filter(r => r.name?.toLowerCase().includes(query))
        .slice(0, 5);
      
      // Filtrar tipos de cocina que contengan la query
      const cuisineMatches = [...new Set(
        state.restaurants.flatMap(r => r.restaurant_type || [])
      )]
        .filter(cuisine => cuisine.toLowerCase().includes(query))
        .slice(0, 5);
      
      // Combinar resultados
      state.restaurantSuggestions = [...restaurantMatches, ...cuisineMatches];
      state.showRestaurantSuggestions = state.restaurantSuggestions.length > 0;
      
      console.log('Restaurant suggestions updated:', {
        query,
        restaurantMatches: restaurantMatches.length,
        cuisineMatches: cuisineMatches.length,
        total: state.restaurantSuggestions.length
      });
    },

    updateLocationSuggestions: () => {
      if (!state.location || state.location.length < 1) {
        state.locationSuggestions = state.allLocations; // Mostrar todas las ubicaciones
        state.showLocationSuggestions = false;
        return;
      }
      
      const query = state.location.toLowerCase().trim();
      state.locationSuggestions = state.allLocations
        .filter(loc => loc.toLowerCase().includes(query));
      
      state.showLocationSuggestions = state.locationSuggestions.length > 0;
      console.log('Location suggestions updated:', state.locationSuggestions);
    },

    updateCuisineSuggestions: () => {
      if (!state.cuisine || state.cuisine.length < 1) {
        state.cuisineSuggestions = state.allCuisines; // Mostrar todos los tipos de cocina
        state.showCuisineSuggestions = false;
        return;
      }
      
      const query = state.cuisine.toLowerCase().trim();
      state.cuisineSuggestions = state.allCuisines
        .filter(cuisine => cuisine.toLowerCase().includes(query));
      
      state.showCuisineSuggestions = state.cuisineSuggestions.length > 0;
      console.log('Cuisine suggestions updated:', state.cuisineSuggestions);
    },
    onScroll: () => {
      // Solo cerrar el menú al hacer scroll para evitar problemas de posicionamiento
      // Usar un flag para evitar re-renders innecesarios
      if (state.menuOpen) {
        state.menuOpen = false;
        state.menuClosing = false;
        // Solo renderizar si realmente hay un cambio
        
      }
    },
    submitSearch: (e) => {
      e.preventDefault();
      console.log('Submitting search with:', {
        query: state.query,
        location: state.location,
        cuisine: state.cuisine,
        date: state.date,
        time: state.time,
        partySize: state.partySize
      });
      
      const params = new URLSearchParams();
      if (state.query) params.append('q', state.query);
      if (state.location) params.append('loc', state.location);
      if (state.cuisine) params.append('cuisine', state.cuisine);
      if (state.date) params.append('date', state.date);
      if (state.time) params.append('time', state.time);
      if (state.partySize) params.append('partySize', state.partySize);
      
      const queryString = params.toString();
      const url = queryString ? `#/restaurants?${queryString}` : '#/restaurants';
      
      console.log('Navigating to:', url);
      window.location.hash = url;
      
      // Cerrar dropdowns
      state.expanded = false;
      state.openField = null;
      state.showRestaurantSuggestions = false;
      state.showLocationSuggestions = false;
      state.showCuisineSuggestions = false;
      
      // NO limpiar campos después del submit para mantener la búsqueda
    },
    toggleMenu: () => {
      // Si el menú está cerrando, no hacer nada
      if (state.menuClosing) return;
      
      // Toggle del estado
      state.menuOpen = !state.menuOpen;
      
      if (state.menuOpen) {
        // Calcular posición del menú
        const btn = document.querySelector('[data-ref="logoBtn"]');
        if (btn) {
          const rect = btn.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          const menuHeight = 120;
          
          // Posición X - centrado horizontalmente con el botón
          state.menuX = Math.round(rect.left + (rect.width / 2) - 112); // 112 = w-56 / 2
          
          // Posición Y - siempre debajo del botón para evitar conflictos
          state.menuY = Math.round(rect.bottom + 8);
          
          // Si no hay espacio abajo, mostrar arriba
          if (state.menuY + menuHeight > viewportHeight - 20) {
            state.menuY = Math.round(rect.top - menuHeight - 8);
            state.menuPosition = 'above';
          } else {
            state.menuPosition = 'below';
          }
          
          // Asegurar que no se salga de la pantalla
          if (state.menuX < 20) state.menuX = 20;
          if (state.menuX + 224 > viewportHeight) state.menuX = viewportHeight - 244;
          if (state.menuY < 20) state.menuY = 20;
        }
      } else {
        // Cerrar menú inmediatamente
        state.menuOpen = false;
        state.menuClosing = false;
      }
    },
    menuGotoHome: (e) => {
      if (e && e.preventDefault) e.preventDefault();
      // Navegar inmediatamente
      window.location.hash = '#/';
      // Cerrar menú después de navegar
      state.menuOpen = false;
      state.menuClosing = false;
    },
    menuGotoRestaurants: (e) => {
      if (e && e.preventDefault) e.preventDefault();
      // Navegar inmediatamente
      window.location.hash = '#/restaurants';
      // Cerrar menú después de navegar
      state.menuOpen = false;
      state.menuClosing = false;
    },
    closeAllOverlays: () => {
      // Cerrar dropdowns de búsqueda
      state.openField = null;
      state.expanded = false;
      // Cerrar menú del logo inmediatamente
      state.menuOpen = false;
      state.menuClosing = false;
    },
    closeLogoMenu: () => {
      // Solo cerrar el menú del logo
      state.menuOpen = false;
      state.menuClosing = false;
    },

    closeDropdowns: () => { 
      state.openField = null; 
      state.expanded = false; 
    },
    clearAllSelections: () => { 
      state.query = ''; 
      state.location = ''; 
      state.cuisine = ''; 
      state.date = ''; 
      state.time = ''; 
      state.partySize = '';
      state.tempDate = ''; 
      state.tempTime = ''; 
      state.tempPartySize = '';
      // Mostrar feedback
      state.showFeedback = true;
      state.feedbackMessage = 'Todas las selecciones limpiadas';
      setTimeout(() => { state.showFeedback = false; }, 1500);
    },
    closeSearchDropdowns: () => {
      state.openField = null;
      state.showRestaurantSuggestions = false;
      state.showLocationSuggestions = false;
      state.showCuisineSuggestions = false;
      state.expanded = false; // Cerrar el formulario expandido
    },
    toggleRestaurant: () => { 
      state.expanded = true; 
      state.openField = state.openField === 'restaurant' ? null : 'restaurant';
      if (state.openField === 'restaurant') {
        actions.updateRestaurantSuggestions();
      }
    },
    toggleLocation: () => { 
      state.expanded = true; 
      state.openField = state.openField === 'location' ? null : 'location';
      if (state.openField === 'location') {
        // Mostrar todas las ubicaciones disponibles
        state.locationSuggestions = state.allLocations;
        state.showLocationSuggestions = true;
      } else {
        // Cerrar el dropdown
        state.showLocationSuggestions = false;
      }
    },
    toggleCuisine: () => { 
      state.expanded = true; 
      state.openField = state.openField === 'cuisine' ? null : 'cuisine';
      if (state.openField === 'cuisine') {
        // Mostrar todos los tipos de cocina disponibles
        state.cuisineSuggestions = state.allCuisines;
        state.showCuisineSuggestions = true;
      } else {
        // Cerrar el dropdown
        state.showCuisineSuggestions = false;
      }
    },
    toggleReservation: () => {
      state.tempDate = state.date;
      state.tempTime = state.time;
      state.tempPartySize = state.partySize;
      state.expanded = true;
      state.openField = state.openField === 'datetime' ? null : 'datetime';
      // Ajustar el cursor del calendario al mes actual o al de la fecha seleccionada
      const parts = state.tempDate ? state.tempDate.split('/') : null;
      const baseDate = parts ? new Date(Number(parts[2]), Number(parts[1]) - 1, 1) : new Date();
      state.calendarCursor = baseDate.toISOString();
    },
    selectRestaurant: (e) => { 
      e.preventDefault();
      e.stopPropagation();
      const value = e.currentTarget.dataset.value || '';
      console.log('Selecting restaurant:', value);
      state.query = value; 
      state.openField = null; 
      state.showRestaurantSuggestions = false;
      
      // Mostrar feedback
      state.showFeedback = true;
      state.feedbackMessage = `Restaurante seleccionado: ${value}`;
      
      // Redirigir automáticamente a restaurantes con el filtro aplicado después de un pequeño delay
      setTimeout(() => {
        const params = new URLSearchParams();
        if (value) params.append('q', value);
        if (state.location) params.append('loc', state.location);
        if (state.cuisine) params.append('cuisine', state.cuisine);
        if (state.date) params.append('date', state.date);
        if (state.time) params.append('time', state.time);
        if (state.partySize) params.append('partySize', state.partySize);
        
        const queryString = params.toString();
        const url = queryString ? `#/restaurants?${queryString}` : '#/restaurants';
        window.location.hash = url;
      }, 100);
      
      // Cerrar feedback después de 2 segundos
      setTimeout(() => {
        state.showFeedback = false;
      }, 2000);
    },
    selectLocation: (e) => { 
      e.preventDefault();
      e.stopPropagation();
      const value = e.currentTarget.dataset.value || '';
      console.log('Navbar - selectLocation llamado:', { value, currentLocation: state.location });
      state.location = value;
      console.log('Navbar - Estado después de actualizar:', { newLocation: state.location }); 
      state.openField = null; 
      state.showLocationSuggestions = false;
      state.expanded = false; // Cerrar el formulario expandido
      
      // Mostrar feedback
      state.showFeedback = true;
      state.feedbackMessage = `Ubicación seleccionada: ${value}`;
      
      // Redirigir automáticamente a restaurantes con el filtro aplicado después de un pequeño delay
      setTimeout(() => {
        const params = new URLSearchParams();
        if (state.query) params.append('q', state.query);
        if (value) params.append('loc', value);
        if (state.cuisine) params.append('cuisine', state.cuisine);
        if (state.date) params.append('date', state.date);
        if (state.time) params.append('time', state.time);
        if (state.partySize) params.append('partySize', state.partySize);
        
        const queryString = params.toString();
        const url = queryString ? `#/restaurants?${queryString}` : '#/restaurants';
        
        console.log('Navbar - Redirigiendo con filtros:', {
          location: value,
          query: state.query,
          cuisine: state.cuisine,
          url: url
        });
        
        window.location.hash = url;
      }, 100);
      
      // Cerrar feedback después de 2 segundos
      setTimeout(() => {
        state.showFeedback = false;
      }, 2000);
    },
    selectCuisine: (e) => { 
      e.preventDefault();
      e.stopPropagation();
      const value = e.currentTarget.dataset.value || '';
      console.log('Navbar - selectCuisine llamado:', { value, currentCuisine: state.cuisine });
      state.cuisine = value;
      console.log('Navbar - Estado después de actualizar:', { newCuisine: state.cuisine }); 
      state.openField = null; 
      state.showCuisineSuggestions = false;
      state.expanded = false; // Cerrar el formulario expandido
      
      // Mostrar feedback
      state.showFeedback = true;
      state.feedbackMessage = `Tipo de comida seleccionado: ${value}`;
      
      // Redirigir automáticamente a restaurantes con el filtro aplicado después de un pequeño delay
      setTimeout(() => {
        const params = new URLSearchParams();
        if (state.query) params.append('q', state.query);
        if (state.location) params.append('loc', state.location);
        if (value) params.append('cuisine', value);
        if (state.date) params.append('date', state.date);
        if (state.time) params.append('time', state.time);
        if (state.partySize) params.append('partySize', state.partySize);
        
        const queryString = params.toString();
        const url = queryString ? `#/restaurants?${queryString}` : '#/restaurants';
        
        console.log('Navbar - Redirigiendo con filtros:', {
          cuisine: value,
          query: state.query,
          location: state.location,
          url: url
        });
        
        window.location.hash = url;
      }, 100);
      
      // Cerrar feedback después de 2 segundos
      setTimeout(() => {
        state.showFeedback = false;
      }, 2000);
    },
    clearQuery: () => { 
      state.query = ''; 
      state.showRestaurantSuggestions = false;
      // Mostrar feedback
      state.showFeedback = true;
      state.feedbackMessage = 'Restaurante limpiado';
      
      
      
      setTimeout(() => { 
        state.showFeedback = false; 

      }, 1500);
    },
    clearLocation: () => { 
      state.location = ''; 
      state.showLocationSuggestions = false;
      // Mostrar feedback
      state.showFeedback = true;
      state.feedbackMessage = 'Ubicación limpiada';
      
      
      
      setTimeout(() => { 
        state.showFeedback = false; 

      }, 1500);
    },
    clearCuisine: () => { 
      state.cuisine = ''; 
      state.showCuisineSuggestions = false;
      // Mostrar feedback
      state.showFeedback = true;
      state.feedbackMessage = 'Tipo de comida limpiado';
      
      
      
      setTimeout(() => { 
        state.showFeedback = false; 

      }, 1500);
    },
    clearDatetime: () => { 
      state.tempDate = ''; 
      state.tempTime = ''; 
      state.tempPartySize = '';
      // Mostrar feedback
      state.showFeedback = true;
      state.feedbackMessage = 'Reserva limpiada';
      setTimeout(() => { state.showFeedback = false; }, 1500);
    },
    applyDatetime: () => { 
      state.date = state.tempDate; 
      state.time = state.tempTime; 
      state.partySize = state.tempPartySize;
      state.openField = null; 
      // Mantener expanded para que se vea la selección
      setTimeout(() => {
        state.expanded = false;
      }, 300);
    },
    clearDateTimeInline: () => { 
      state.date = ''; 
      state.time = ''; 
      state.partySize = '';
      // Mostrar feedback
      state.showFeedback = true;
      state.feedbackMessage = 'Reserva limpiada';
      setTimeout(() => { state.showFeedback = false; }, 1500);
    },
    openSearch: () => { state.expanded = true; },
    updateCompact: () => { state.compact = false; },
    prevMonth: () => {
      const d = new Date(state.calendarCursor);
      d.setMonth(d.getMonth() - 1);
      state.calendarCursor = d.toISOString();
    },
    nextMonth: () => {
      const d = new Date(state.calendarCursor);
      d.setMonth(d.getMonth() + 1);
      state.calendarCursor = d.toISOString();
    },
    selectDate: (e) => {
      const iso = e.currentTarget.dataset.date;
      if (!iso) return;
      const d = new Date(iso);
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      state.tempDate = `${dd}/${mm}/${yyyy}`;
    },
    selectTimeChip: (e) => { state.tempTime = e.currentTarget.dataset.time || ''; },
    updateTimeInput: (e) => { state.tempTime = e.target.value || ''; },
    selectPartySize: (e) => { state.tempPartySize = e.currentTarget.dataset.size || ''; },
    gotoAuth: () => { window.location.hash = '#/auth'; },
    gotoHome: () => { window.location.hash = '#/'; },
    gotoRestaurants: () => { window.location.hash = '#/restaurants'; },

    // Funciones para manejar el cierre de sugerencias
    hideRestaurantSuggestions: () => {
      setTimeout(() => {
        state.showRestaurantSuggestions = false;
      }, 200);
    },
    hideLocationSuggestions: () => {
      setTimeout(() => {
        state.showLocationSuggestions = false;
      }, 200);
    },
    hideCuisineSuggestions: () => {
      setTimeout(() => {
        state.showCuisineSuggestions = false;
      }, 200);
    },

  };

  const view = () => {
    const dropdownTop = 'top-20';
    // Datos del calendario ligero
    const cursor = new Date(state.calendarCursor);
    const monthNames = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    const firstWeekday = start.getDay();
    const daysInMonth = end.getDate();
    const prevPadding = (firstWeekday + 6) % 7; // Lunes como primer día visual
    const totalCells = Math.ceil((prevPadding + daysInMonth) / 7) * 7;
    const cells = [];
    for (let i = 0; i < totalCells; i++) {
      const dayNum = i - prevPadding + 1;
      const date = new Date(year, month, dayNum);
      const inMonth = dayNum >= 1 && dayNum <= daysInMonth;
      const dd = String(dayNum).padStart(2, '0');
      const mm = String(month + 1).padStart(2, '0');
      const key = `${dd}/${mm}/${year}`;
      cells.push({ inMonth, iso: date.toISOString(), label: inMonth ? String(dayNum) : '', key });
    }
    // No necesitamos times fijo ya que ahora es un input libre
    return `
    <header class="fixed inset-x-0 top-0 z-50 bg-white/90 backdrop-blur border-b border-neutral-200/60 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] h-20">
      ${state.showFeedback ? `
      <div class="fixed top-20 left-1/2 transform -translate-x-1/2 z-[9999] bg-am-600 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-300">
        ${state.feedbackMessage}
      </div>
      ` : ''}
      <div class="mx-auto max-w-7xl px-4 h-full flex items-center gap-4 overflow-x-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
        <div class="relative">
          <button class="flex items-center gap-2" data-onclick="toggleMenu" data-ref="logoBtn" title="Abrir menú">
            <img src="/assets/AlaMesa.jpeg" alt="AlaMesa" class="h-11 w-11 rounded-full" />
            <span class="hidden sm:inline text-lg font-semibold">AlaMesa</span>
            <i class="fa-solid fa-chevron-down text-am-600 text-sm transition-transform ${state.menuOpen ? 'rotate-180' : ''}"></i>
          </button>
          ${state.menuOpen ? `
          <nav class="fixed z-[9999] w-56 rounded-[var(--am-radius)] border border-neutral-200 bg-white shadow-soft p-2" style="left:${state.menuX}px; top:${state.menuY}px;">
            <a class="block rounded px-3 py-2 transition-colors duration-200 hover:bg-neutral-100" href="javascript:void(0)" data-onclick="menuGotoHome">Inicio</a>
            <a class="block rounded px-3 py-2 transition-colors duration-200 hover:bg-neutral-100" href="javascript:void(0)" data-onclick="menuGotoRestaurants">Restaurantes</a>
          </nav>` : ''}
        </div>

        <form data-onsubmit="submitSearch" class="flex-1">
          <div class="relative mx-auto w-full max-w-6xl rounded-full border border-neutral-200 bg-white shadow-soft transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${state.expanded ? 'ring-2 ring-am-600/30 shadow-lg' : ''} overflow-hidden">
            <div class="grid grid-cols-1 md:grid-cols-[1.35fr_1fr_1fr_1.2fr_auto] divide-y md:divide-y-0 md:divide-x divide-neutral-200 items-stretch">
              <div class="relative">
                <div class="relative w-full h-11 flex items-center">
                  <i class="fa-solid fa-bowl-food text-am-600 absolute left-4 z-10"></i>
                  <input 
                    type="text" 
                    placeholder="¿Dónde quieres comer?"
                    value="${state.query}"
                    data-oninput="updateQuery"
                    data-onfocus="openSearch"
                    class="w-full h-full pl-12 pr-4 text-sm border-0 outline-none bg-transparent placeholder-neutral-400 focus:placeholder-neutral-300"
                  />
                  ${state.query ? `<button type="button" aria-label="Limpiar" class="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 grid place-items-center rounded-full text-neutral-400 hover:bg-neutral-100 transition-colors duration-200" data-onclick="clearQuery"><i class="fa-solid fa-xmark"></i></button>` : ''}
                </div>
                ${state.showRestaurantSuggestions && state.restaurantSuggestions.length > 0 ? `
                <div class="fixed left-1/2 -translate-x-1/2 ${dropdownTop} z-50 w-[min(560px,90%)] rounded-[var(--am-radius)] border border-neutral-200 bg-white shadow-soft p-2 max-h-64 overflow-auto">
                  ${state.restaurantSuggestions.map(item => `
                    <button class="block w-full text-left rounded px-3 py-2 hover:bg-neutral-100" data-onclick="selectRestaurant" data-value="${item.name || item}">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center">
                          <i class="fa-solid fa-utensils text-neutral-600 text-sm"></i>
                        </div>
                        <div>
                          <div class="font-medium">${item.name || item}</div>
                          <div class="text-sm text-neutral-500">${item.restaurant_type?.[0] || 'Tipo de comida'} • ${item.city || 'Opción'}</div>
                        </div>
                      </div>
                    </button>
                  `).join('')}
                </div>` : ''}
              </div>

              <div class="relative">
                <div class="relative w-full h-11 flex items-center">
                  <i class="fa-solid fa-location-dot text-am-600 absolute left-4 z-10"></i>
                  <input 
                    type="text" 
                    placeholder="Ubicación"
                    value="${state.location}"
                    data-oninput="updateLocation"
                    data-onfocus="openSearch"
                    data-onclick="toggleLocation"
                    class="w-full h-full pl-12 pr-4 text-sm border-0 outline-none bg-transparent placeholder-neutral-400 focus:placeholder-neutral-300 cursor-pointer"
                  />
                  ${state.location ? `<button type="button" aria-label="Limpiar" class="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 grid place-items-center rounded-full text-neutral-400 hover:bg-neutral-100 transition-colors duration-200" data-onclick="clearLocation"><i class="fa-solid fa-xmark"></i></button>` : ''}
                </div>
                ${state.showLocationSuggestions && state.locationSuggestions.length > 0 ? `
                <div class="fixed left-1/2 -translate-x-1/2 ${dropdownTop} z-50 w-[min(560px,90%)] rounded-[var(--am-radius)] border border-neutral-200 bg-white shadow-soft p-2 max-h-64 overflow-auto">
                  ${state.locationSuggestions.map(location => `
                    <button class="block w-full text-left rounded px-3 py-2 hover:bg-neutral-100" data-onclick="selectLocation" data-value="${location}">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center">
                          <i class="fa-solid fa-location-dot text-neutral-600 text-sm"></i>
                        </div>
                        <div>
                          <div class="font-medium">${location}</div>
                          <div class="text-sm text-neutral-500">Ubicación</div>
                        </div>
                      </div>
                    </button>
                  `).join('')}
                </div>` : ''}
              </div>

              <div class="relative">
                <div class="relative w-full h-11 flex items-center">
                  <i class="fa-solid fa-utensils text-am-600 absolute left-4 z-10"></i>
                  <input 
                    type="text" 
                    placeholder="Tipo de comida"
                    value="${state.cuisine}"
                    data-oninput="updateCuisine"
                    data-onfocus="openSearch"
                    data-onclick="toggleCuisine"
                    class="w-full h-full pl-12 pr-4 text-sm border-0 outline-none bg-transparent placeholder-neutral-400 focus:placeholder-neutral-300 cursor-pointer"
                  />
                  ${state.cuisine ? `<button type="button" aria-label="Limpiar" class="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 grid place-items-center rounded-full text-neutral-400 hover:bg-neutral-100 transition-colors duration-200" data-onclick="clearCuisine"><i class="fa-solid fa-xmark"></i></button>` : ''}
                </div>
                ${state.showCuisineSuggestions && state.cuisineSuggestions.length > 0 ? `
                <div class="fixed left-1/2 -translate-x-1/2 ${dropdownTop} z-50 w-[min(560px,90%)] rounded-[var(--am-radius)] border border-neutral-200 bg-white shadow-soft p-2 max-h-64 overflow-auto">
                  ${state.cuisineSuggestions.map(cuisine => `
                    <button class="block w-full text-left rounded px-3 py-2 hover:bg-neutral-100" data-onclick="selectCuisine" data-value="${cuisine}">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center">
                          <i class="fa-solid fa-utensils text-neutral-600 text-sm"></i>
                        </div>
                        <div>
                          <div class="font-medium">${cuisine}</div>
                          <div class="text-sm text-neutral-500">Tipo de comida</div>
                        </div>
                      </div>
                    </button>
                  `).join('')}
                </div>` : ''}
              </div>

              <div class="relative">
                <button type="button" class="w-full h-11 ${(state.date||state.time||state.partySize) ? 'pr-8' : ''} pl-4 text-left flex items-center gap-2 transition-colors duration-200 hover:bg-neutral-50 ${(state.date||state.time||state.partySize) ? 'bg-am-50 border-am-200' : ''}" data-onclick="toggleReservation" data-onfocus="openSearch">
                  <i class="fa-solid fa-calendar-days text-am-600"></i>
                  <span class="truncate ${state.date || state.time || state.partySize ? 'text-neutral-900 font-medium' : 'text-neutral-400'}">${(state.date && state.time && state.partySize) ? `${state.date} ${state.time} - ${state.partySize} pers.` : (state.date || 'Reserva')}</span>
                </button>
                ${(state.date || state.time || state.partySize) ? `<button type="button" aria-label="Limpiar" class="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 grid place-items-center rounded-full text-neutral-400 hover:bg-neutral-100 transition-colors duration-200" data-onclick="clearDateTimeInline"><i class="fa-solid fa-xmark"></i></button>` : ''}
                ${state.openField === 'datetime' ? `
                <div class="fixed left-1/2 -translate-x-1/2 ${dropdownTop} z-50 w-[min(560px,95%)] rounded-[var(--am-radius)] border border-neutral-200 bg-white shadow-soft p-3">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <div class="flex items-center justify-between mb-2">
                        <button type="button" class="h-8 w-8 rounded-full hover:bg-neutral-100 grid place-items-center" data-onclick="prevMonth"><i class="fa-solid fa-chevron-left"></i></button>
                        <div class="text-sm font-medium capitalize">${monthNames[month]} ${year}</div>
                        <button type="button" class="h-8 w-8 rounded-full hover:bg-neutral-100 grid place-items-center" data-onclick="nextMonth"><i class="fa-solid fa-chevron-right"></i></button>
                      </div>
                      <div class="grid grid-cols-7 text-center text-xs text-neutral-500 mb-1">
                        <div>L</div><div>M</div><div>M</div><div>J</div><div>V</div><div>S</div><div>D</div>
                      </div>
                      <div class="grid grid-cols-7 gap-1">
                        ${cells.map(c => c.inMonth ? `<button class="h-8 rounded text-sm ${state.tempDate===c.key ? 'bg-am-50 border border-am-600 text-am-700' : 'hover:bg-neutral-100'}" aria-pressed="${state.tempDate===c.key}" data-onclick="selectDate" data-date="${c.iso}">${c.label}</button>` : `<span class="h-8"></span>`).join('')}
                      </div>
                    </div>
                    <div>
                      <div class="text-sm text-neutral-600 mb-2">Hora</div>
                      <input type="time" value="${state.tempTime || ''}" data-onchange="updateTimeInput" class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-am-600 focus:border-transparent" placeholder="Selecciona una hora">
                      
                      <div class="text-sm text-neutral-600 mb-2 mt-3">Personas</div>
                      <div class="flex flex-wrap gap-2">
                        ${[1,2,3,4,5,6,7,8,9,10].map(p => `<button type="button" data-onclick="selectPartySize" data-size="${p}" class="px-3 py-1 rounded-full border ${state.tempPartySize===String(p) ? 'border-am-600 text-am-700 bg-am-50' : 'border-neutral-300 hover:border-neutral-400'} text-sm">${p}</button>`).join('')}
                      </div>
                      
                      <div class="flex justify-between items-center mt-4">
                        <button type="button" class="text-sm text-neutral-500 hover:underline" data-onclick="clearDatetime">Limpiar</button>
                        <button type="button" class="rounded-full bg-am-600 hover:bg-am-700 text-white px-4 py-1.5" data-onclick="applyDatetime">Aplicar</button>
                      </div>
                    </div>
                  </div>
                </div>` : ''}
              </div>

              <div class="flex items-center justify-center px-3 py-1 gap-2">
                ${(state.query || state.location || state.cuisine || state.date || state.time || state.partySize) ? `
                <button type="button" aria-label="Limpiar todas las selecciones" class="h-9 w-9 grid place-items-center rounded-full bg-neutral-500 hover:bg-neutral-600 text-white shadow transition-colors" data-onclick="clearAllSelections">
                  <i class="fa-solid fa-xmark"></i>
                </button>
                ` : ''}
                <button type="submit" aria-label="Buscar" class="h-9 w-9 grid place-items-center rounded-full bg-am-600 hover:bg-am-700 text-white shadow">
                  <i class="fa-solid fa-magnifying-glass"></i>
                </button>
              </div>
            </div>
          </div>
        </form>

        <div class="flex items-center gap-2">
          <button class="hidden sm:inline rounded-full border border-neutral-300/60 bg-white/80 backdrop-blur-sm px-4 py-1.5 text-sm text-neutral-700 hover:border-am-300/80 hover:bg-am-50/80 hover:text-am-700 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md" data-onclick="gotoAuth">
            <span class="flex items-center gap-2">
              <i class="fa-solid fa-sign-in-alt text-xs"></i>
              Inicia sesión
            </span>
          </button>
          <button class="rounded-full bg-gradient-to-r from-am-600 to-am-700 hover:from-am-700 hover:to-am-800 text-white px-4 py-1.5 text-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95" data-onclick="gotoAuth">
            <span class="flex items-center gap-2">
              <i class="fa-solid fa-user-plus text-xs"></i>
              Regístrate
            </span>
          </button>
        </div>
      </div>

    </header>

  `;
  };

  const onRender = () => {
    // Agregar event listener para cerrar dropdowns al hacer clic fuera
    const handleClickOutside = (e) => {
      const form = document.querySelector('form[data-onsubmit="submitSearch"]');
      if (form && !form.contains(e.target)) {
        actions.closeSearchDropdowns();
      }
    };

    // Remover listener anterior si existe
    document.removeEventListener('click', handleClickOutside);
    // Agregar nuevo listener
    document.addEventListener('click', handleClickOutside);
  };

  // Cargar restaurantes solo una vez
  if (!state.initialized) {
    setTimeout(() => {
      try {
        actions.loadRestaurants();
      } catch (error) {
        console.error('Error inicializando navbar:', error);
      }
    }, 100);
    state.initialized = true;
  }

  console.log('Navbar inicializado con acciones:', Object.keys(actions));
  
  return { state, actions, view, onRender };
};

export default Navbar;







