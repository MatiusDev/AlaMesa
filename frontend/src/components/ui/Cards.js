export const RestaurantCard = (r) => {
  const stars = '★'.repeat(Math.round(r.rating || 0)).padEnd(5, '☆');
  const img = r.image || `https://picsum.photos/seed/${encodeURIComponent(r.name || 'restaurant')}/800/600`;
  return `
    <article class="group overflow-hidden rounded-[var(--am-radius)] border border-neutral-200 bg-white shadow-soft hover:shadow-lg transition">
      <div class="relative aspect-[4/3] overflow-hidden">
        <img src="${img}" alt="${r.name}" class="h-full w-full object-cover group-hover:scale-105 transition" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        <div class="absolute bottom-2 left-2 text-xs rounded-full px-2 py-1 bg-black/60 text-white">${r.price || '$$'}</div>
      </div>
      <div class="p-4">
        <h3 class="font-semibold">${r.name}</h3>
        <p class="mt-1 text-sm text-neutral-500">${r.cuisine || 'Gastronomía'}</p>
        <div class="mt-2 text-sm">
          <span class="text-am-600">${stars}</span>
          <span class="ml-2 text-neutral-500">${(r.rating || 0).toFixed(1)}</span>
        </div>
      </div>
    </article>
  `;
};

export const CategoryCard = (c) => `
  <a href="#/restaurants" class="group rounded-[var(--am-radius)] border border-neutral-200 bg-white p-4 shadow-soft hover:shadow-md transition">
    <div class="flex items-center gap-3">
      <div class="h-10 w-10 rounded-full brand-gradient grid place-items-center text-white">
        ${c.icon ? `<i class="fa-solid ${c.icon}"></i>` : ''}
      </div>
      <div>
        <p class="font-medium">${c.name}</p>
        <p class="text-xs text-neutral-500">${c.subtitle || ''}</p>
      </div>
    </div>
  </a>
`; 