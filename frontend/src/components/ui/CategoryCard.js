const CategoryCard = (category) => `
  <a href="#/restaurants" class="group rounded-[var(--am-radius)] border border-neutral-200/60 bg-white/80 backdrop-blur-sm p-4 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 hover:border-am-300/60 hover:bg-white">
    <div class="flex items-center gap-3">
      <div class="h-10 w-10 rounded-full bg-gradient-to-br from-am-500 to-am-700 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-6 grid place-items-center text-white">
        ${category.icon ? `<i class="fa-solid ${category.icon} transition-transform duration-300 group-hover:scale-110"></i>` : ''}
      </div>
      <div>
        <p class="font-medium text-neutral-900 group-hover:text-am-700 transition-colors duration-300">${category.name}</p>
        <p class="text-xs text-neutral-500 group-hover:text-neutral-600 transition-colors duration-300">${category.subtitle || ''}</p>
      </div>
    </div>
  </a>
`;

export default CategoryCard;


