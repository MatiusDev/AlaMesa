const CategoryCard = (category) => `
  <a href="#/restaurants" class="group rounded-[var(--am-radius)] border border-neutral-200 bg-white p-4 shadow-soft hover:shadow-md transition">
    <div class="flex items-center gap-3">
      <div class="h-10 w-10 rounded-full brand-gradient grid place-items-center text-white">
        ${category.icon ? `<i class="fa-solid ${category.icon}"></i>` : ''}
      </div>
      <div>
        <p class="font-medium">${category.name}</p>
        <p class="text-xs text-neutral-500">${category.subtitle || ''}</p>
      </div>
    </div>
  </a>
`;

export default CategoryCard;


