// frontend/src/components/layout/Navbar.js
import { clearUserData } from '@utils/localStorage.js';

const Navbar = () => {
  const state = {
    query: '',
    location: '',
    cuisine: '',
    date: '',
    time: '',
    tempDate: '',
    tempTime: '',
    calendarCursor: new Date().toISOString(),
    menuOpen: false,
    openField: null, // 'restaurant' | 'location' | 'cuisine' | 'datetime'
    expanded: false,
    compact: false,
    menuX: 16,
    menuY: 80,
  };

  const actions = {
    updateQuery: (e) => { state.query = e.target.value; },
    updateLocation: (e) => { state.location = e.target.value; },
    updateCuisine: (e) => { state.cuisine = e.target.value; },
    updateDateTemp: (e) => { state.tempDate = e.target.value; },
    updateTimeTemp: (e) => { state.tempTime = e.target.value; },
    submitSearch: (e) => {
      e.preventDefault();
      const params = new URLSearchParams({
        q: state.query || '',
        loc: state.location || '',
        cuisine: state.cuisine || '',
        date: state.date || '',
        time: state.time || '',
      });
      window.location.hash = `#/restaurants?${params.toString()}`;
      state.expanded = false;
      state.openField = null;
    },
    toggleMenu: () => {
      state.menuOpen = !state.menuOpen;
      if (state.menuOpen) {
        const btn = document.querySelector('[data-ref="logoBtn"]');
        if (btn) {
          const rect = btn.getBoundingClientRect();
          state.menuX = Math.round(rect.left + window.scrollX);
          state.menuY = Math.round(rect.bottom + window.scrollY + 8);
        }
      }
    },
    closeDropdowns: () => { state.openField = null; state.expanded = false; },
    toggleRestaurant: () => { state.expanded = true; state.openField = state.openField === 'restaurant' ? null : 'restaurant'; },
    toggleLocation: () => { state.expanded = true; state.openField = state.openField === 'location' ? null : 'location'; },
    toggleCuisine: () => { state.expanded = true; state.openField = state.openField === 'cuisine' ? null : 'cuisine'; },
    toggleDatetime: () => {
      state.tempDate = state.date;
      state.tempTime = state.time;
      state.expanded = true;
      state.openField = state.openField === 'datetime' ? null : 'datetime';
      // Ajustar el cursor del calendario al mes actual o al de la fecha seleccionada
      const parts = state.tempDate ? state.tempDate.split('/') : null;
      const baseDate = parts ? new Date(Number(parts[2]), Number(parts[1]) - 1, 1) : new Date();
      state.calendarCursor = baseDate.toISOString();
    },
    selectRestaurant: (e) => { state.query = e.currentTarget.dataset.value || ''; state.openField = null; },
    selectLocation: (e) => { state.location = e.currentTarget.dataset.value || ''; state.openField = null; },
    selectCuisine: (e) => { state.cuisine = e.currentTarget.dataset.value || ''; state.openField = null; },
    clearQuery: () => { state.query = ''; },
    clearLocation: () => { state.location = ''; },
    clearCuisine: () => { state.cuisine = ''; },
    clearDatetime: () => { state.tempDate = ''; state.tempTime = ''; },
    applyDatetime: () => { state.date = state.tempDate; state.time = state.tempTime; state.openField = null; },
    clearDateTimeInline: () => { state.date = ''; state.time = ''; },
    openSearch: () => { state.expanded = true; },
    onScroll: () => { state.compact = false; },
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
    gotoAuth: () => { window.location.hash = '#/auth'; },
    gotoHome: () => { window.location.hash = '#/'; },
    gotoRestaurants: () => { window.location.hash = '#/restaurants'; },
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
    const times = ['12:00','13:00','14:00','19:00','20:00','21:00'];
    return `
    <header class="fixed inset-x-0 top-0 z-50 bg-white/90 backdrop-blur border-b border-neutral-200/60 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] h-20">
      <div class="mx-auto max-w-7xl px-4 h-full flex items-center gap-4 overflow-x-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
        <div class="relative">
          <button class="flex items-center gap-2" data-onclick="toggleMenu" data-ref="logoBtn" title="Abrir menú">
            <img src="/assets/AlaMesa.jpeg" alt="AlaMesa" class="h-11 w-11 rounded-full" />
            <span class="hidden sm:inline text-lg font-semibold">AlaMesa</span>
            <i class="fa-solid fa-chevron-down text-am-600 text-sm transition-transform ${state.menuOpen ? 'rotate-180' : ''}"></i>
          </button>
          ${state.menuOpen ? `
          <nav class="fixed z-50 w-56 rounded-[var(--am-radius)] border border-neutral-200 bg-white shadow-soft p-2 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" style="left:${state.menuX}px; top:${state.menuY}px;">
            <a class="block rounded px-3 py-2 transition-colors duration-200 hover:bg-neutral-100" href="#/" data-onclick="gotoHome">Inicio</a>
            <a class="block rounded px-3 py-2 transition-colors duration-200 hover:bg-neutral-100" href="#/restaurants" data-onclick="gotoRestaurants">Restaurantes</a>
          </nav>` : ''}
        </div>

        <form data-onsubmit="submitSearch" class="flex-1">
          <div class="relative mx-auto w-full max-w-6xl rounded-full border border-neutral-200 bg-white shadow-soft transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${state.expanded ? 'ring-2 ring-am-600/30 shadow-lg' : ''} overflow-hidden">
            <div class="grid grid-cols-1 md:grid-cols-[1.35fr_1fr_1fr_1.2fr_auto] divide-y md:divide-y-0 md:divide-x divide-neutral-200 items-stretch">
              <div class="relative">
                <button type="button" class="w-full h-11 ${state.query ? 'pr-8' : ''} pl-4 text-left flex items-center gap-2 transition-colors duration-200 hover:bg-neutral-50" data-onclick="toggleRestaurant" data-onfocus="openSearch">
                  <i class="fa-solid fa-bowl-food text-am-600"></i>
                  <span class="truncate ${state.query ? 'text-neutral-900' : 'text-neutral-400'}">${state.query || '¿Dónde quieres comer?'}</span>
                </button>
                ${state.query ? `<button type=\"button\" aria-label=\"Limpiar\" class=\"absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 grid place-items-center rounded-full text-neutral-400 hover:bg-neutral-100 transition-colors duration-200\" data-onclick=\"clearQuery\"><i class=\"fa-solid fa-xmark\"></i></button>` : ''}
                ${state.openField === 'restaurant' ? `
                <div class="fixed left-1/2 -translate-x-1/2 ${dropdownTop} z-50 w-[min(560px,90%)] rounded-[var(--am-radius)] border border-neutral-200 bg-white shadow-soft p-2">
                  ${['Morado Bistro','Blanco & Uvas','Café Orquídea','Puerta 87'].map(v=>`<button class=\"block w-full text-left rounded px-3 py-2 hover:bg-neutral-100\" data-onclick=\"selectRestaurant\" data-value=\"${v}\">${v}</button>`).join('')}
                </div>` : ''}
              </div>

              <div class="relative">
                <button type="button" class="w-full h-11 ${state.location ? 'pr-8' : ''} pl-4 text-left flex items-center gap-2 transition-colors duration-200 hover:bg-neutral-50" data-onclick="toggleLocation" data-onfocus="openSearch">
                  <i class="fa-solid fa-location-dot text-am-600"></i>
                  <span class="truncate ${state.location ? 'text-neutral-900' : 'text-neutral-400'}">${state.location || 'Ubicación'}</span>
                </button>
                ${state.location ? `<button type=\"button\" aria-label=\"Limpiar\" class=\"absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 grid place-items-center rounded-full text-neutral-400 hover:bg-neutral-100 transition-colors duration-200\" data-onclick=\"clearLocation\"><i class=\"fa-solid fa-xmark\"></i></button>` : ''}
                ${state.openField === 'location' ? `
                <div class="fixed left-1/2 -translate-x-1/2 ${dropdownTop} z-50 w-[min(560px,90%)] rounded-[var(--am-radius)] border border-neutral-200 bg-white shadow-soft p-2">
                  ${['Medellín','Envigado','Sabaneta','El Poblado'].map(v=>`<button class=\"block w-full text-left rounded px-3 py-2 hover:bg-neutral-100\" data-onclick=\"selectLocation\" data-value=\"${v}\">${v}</button>`).join('')}
                </div>` : ''}
              </div>

              <div class="relative">
                <button type="button" class="w-full h-11 ${state.cuisine ? 'pr-8' : ''} pl-4 text-left flex items-center gap-2 transition-colors duration-200 hover:bg-neutral-50" data-onclick="toggleCuisine" data-onfocus="openSearch">
                  <i class="fa-solid fa-utensils text-am-600"></i>
                  <span class="truncate ${state.cuisine ? 'text-neutral-900' : 'text-neutral-400'}">${state.cuisine || 'Tipo de comida'}</span>
                </button>
                ${state.cuisine ? `<button type=\"button\" aria-label=\"Limpiar\" class=\"absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 grid place-items-center rounded-full text-neutral-400 hover:bg-neutral-100 transition-colors duration-200\" data-onclick=\"clearCuisine\"><i class=\"fa-solid fa-xmark\"></i></button>` : ''}
                ${state.openField === 'cuisine' ? `
                <div class="fixed left-1/2 -translate-x-1/2 ${dropdownTop} z-50 w-[min(560px,90%)] rounded-[var(--am-radius)] border border-neutral-200 bg-white shadow-soft p-2 max-h-64 overflow-auto">
                  ${['Alta cocina','Internacional','Italiana','Cafetería','Comida rápida'].map(v=>`<button class=\"block w-full text-left rounded px-3 py-2 hover:bg-neutral-100\" data-onclick=\"selectCuisine\" data-value=\"${v}\">${v}</button>`).join('')}
                </div>` : ''}
              </div>

              <div class="relative">
                <button type="button" class="w-full h-11 ${(state.date||state.time) ? 'pr-8' : ''} pl-4 text-left flex items-center gap-2 transition-colors duration-200 hover:bg-neutral-50" data-onclick="toggleDatetime" data-onfocus="openSearch">
                  <i class="fa-solid fa-calendar-days text-am-600"></i>
                  <span class="truncate ${state.date || state.time ? 'text-neutral-900' : 'text-neutral-400'}">${(state.date && state.time) ? `${state.date} ${state.time}` : (state.date || 'Fecha y hora')}</span>
                </button>
                ${(state.date || state.time) ? `<button type=\"button\" aria-label=\"Limpiar\" class=\"absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 grid place-items-center rounded-full text-neutral-400 hover:bg-neutral-100 transition-colors duration-200\" data-onclick=\"clearDateTimeInline\"><i class=\"fa-solid fa-xmark\"></i></button>` : ''}
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
                        ${cells.map(c => c.inMonth ? `<button class=\"h-8 rounded text-sm ${state.tempDate===c.key ? 'bg-am-50 border border-am-600 text-am-700' : 'hover:bg-neutral-100'}\" aria-pressed=\"${state.tempDate===c.key}\" data-onclick=\"selectDate\" data-date=\"${c.iso}\">${c.label}</button>` : `<span class=\"h-8\"></span>`).join('')}
                      </div>
                    </div>
                    <div>
                      <div class="text-sm text-neutral-600 mb-2">Hora</div>
                      <div class="flex flex-wrap gap-2">
                        ${times.map(t => `<button type=\"button\" data-onclick=\"selectTimeChip\" data-time=\"${t}\" class=\"px-3 py-1 rounded-full border ${state.tempTime===t ? 'border-am-600 text-am-700 bg-am-50' : 'border-neutral-300 hover:border-neutral-400'} text-sm\">${t}</button>`).join('')}
                      </div>
                      <div class="flex justify-between items-center mt-4">
                        <button type="button" class="text-sm text-neutral-500 hover:underline" data-onclick="clearDatetime">Limpiar</button>
                        <button type="button" class="rounded-full bg-am-600 hover:bg-am-700 text-white px-4 py-1.5" data-onclick="applyDatetime">Aplicar</button>
                      </div>
                    </div>
                  </div>
                </div>` : ''}
              </div>

              <div class="flex items-center justify-center px-3 py-1">
                <button type="submit" aria-label="Buscar" class="h-9 w-9 grid place-items-center rounded-full bg-am-600 hover:bg-am-700 text-white shadow">
                  <i class="fa-solid fa-magnifying-glass"></i>
                </button>
              </div>
            </div>
          </div>
        </form>

        <div class="flex items-center gap-2">
          <button class="hidden sm:inline rounded-full border border-neutral-300 px-4 py-1.5 text-sm hover:border-neutral-400" data-onclick="gotoAuth">Inicia sesión</button>
          <button class="rounded-full bg-am-600 hover:bg-am-700 text-white px-4 py-1.5 text-sm" data-onclick="gotoAuth">Regístrate</button>
        </div>
      </div>

    </header>
    ${state.expanded ? '' : ''}
  `;
  };

  const component = { state, actions, view };
  window.addEventListener('scroll', () => component.actions.onScroll());
  return component;
};

export default Navbar;