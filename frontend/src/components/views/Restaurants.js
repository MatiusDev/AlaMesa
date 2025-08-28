const Restaurants = () => {
  const state = {};
  const actions = {};

  const view = () => {
    const hash = window.location.hash || '#/restaurants';
    const [, queryString = ''] = hash.split('?');
    const params = new URLSearchParams(queryString);
    const q = params.get('q') || '';
    const loc = params.get('loc') || '';
    const cuisine = params.get('cuisine') || '';
    const date = params.get('date') || '';

    const chips = [
      q && `📌 "${q}"`,
      loc && `📍 ${loc}`,
      cuisine && `🍽️ ${cuisine}`,
      date && `🗓️ ${date}`,
    ].filter(Boolean);

    return `
      <section class="mx-auto max-w-7xl px-4 pt-24 pb-10">
        <div class="text-center">
          <h1 class="text-3xl sm:text-4xl font-bold">Restaurantes</h1>
          ${chips.length ? `<div class="mt-3 flex flex-wrap justify-center gap-2">${chips.map(c => `<span class=\"rounded-full border border-neutral-200 bg-white px-3 py-1 text-sm shadow-soft\">${c}</span>`).join('')}</div>` : `<p class="text-neutral-500 mt-2">Explora y filtra con la barra de búsqueda.</p>`}
        </div>

        <div class="mt-8">
          <p class="text-neutral-500 text-center">Aquí se mostrará el listado de restaurantes.</p>
        </div>
      </section>
    `;
  };

  return { state, actions, view };
};

export default Restaurants;
