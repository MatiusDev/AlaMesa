const RestaurantCard = (restaurant) => {
  const state = {
    // Generar estrellas basadas en el rating
    stars: (() => {
      const rating = restaurant.rating || 0;
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 >= 0.5;
      return '★'.repeat(fullStars) + (hasHalfStar ? '☆' : '') + '☆'.repeat(5 - fullStars - (hasHalfStar ? 1 : 0));
    })(),
    
    // Imagen del restaurante o imagen por defecto
    img: restaurant.images && restaurant.images.length > 0 
      ? restaurant.images[0] 
      : `https://picsum.photos/seed/${encodeURIComponent(restaurant.name || 'restaurant')}/800/600`,
    
    // Precio formateado
    price: restaurant.price_range || '$$',
    
    // Tipo de cocina principal
    cuisine: restaurant.restaurant_type && restaurant.restaurant_type.length > 0 
      ? restaurant.restaurant_type[0] 
      : 'Gastronomía',
    
    // Rating formateado
    rating: (restaurant.rating || 0).toFixed(1),
    
    // Número de reseñas
    reviewsCount: restaurant.reviews_count || 0,
    
    // Características destacadas
    features: restaurant.features && restaurant.features.length > 0 
      ? restaurant.features.slice(0, 3) 
      : []
  };

  return `
    <article class="group overflow-hidden rounded-[var(--am-radius)] border border-neutral-200 bg-white shadow-soft hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <!-- Imagen del restaurante -->
      <div class="relative aspect-[4/3] overflow-hidden">
        <img 
          src="${state.img}" 
          alt="${restaurant.name}" 
          class="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
        
        <!-- Badge de precio -->
        <div class="absolute top-3 right-3 text-xs rounded-full px-3 py-1 bg-white/90 text-neutral-800 font-medium shadow-sm">
          ${state.price}
        </div>
        
        <!-- Badge de rating -->
        <div class="absolute bottom-3 left-3 text-xs rounded-full px-2 py-1 bg-am-600 text-white font-medium">
          ${state.rating} ⭐
        </div>
      </div>
      
      <!-- Contenido de la tarjeta -->
      <div class="p-4">
        <!-- Nombre del restaurante -->
        <h3 class="font-semibold text-lg text-neutral-900 group-hover:text-am-700 transition-colors">
          ${restaurant.name}
        </h3>
        
        <!-- Tipo de cocina -->
        <p class="mt-1 text-sm text-neutral-600">
          ${state.cuisine}
        </p>
        
        <!-- Rating y estrellas -->
        <div class="mt-3 flex items-center gap-2">
          <span class="text-am-600 text-sm font-medium">${state.stars}</span>
          <span class="text-neutral-500 text-sm">${state.rating}</span>
          ${state.reviewsCount > 0 ? `
            <span class="text-neutral-400 text-xs">(${state.reviewsCount} reseñas)</span>
          ` : ''}
        </div>
        
        <!-- Características destacadas -->
        ${state.features.length > 0 ? `
          <div class="mt-3 flex flex-wrap gap-1">
            ${state.features.map(feature => `
              <span class="text-xs px-2 py-1 bg-neutral-100 text-neutral-600 rounded-full">
                ${feature}
              </span>
            `).join('')}
          </div>
        ` : ''}
        
        <!-- Ubicación -->
        ${restaurant.city ? `
          <div class="mt-3 flex items-center gap-2 text-sm text-neutral-500">
            <i class="fa-solid fa-location-dot text-am-600"></i>
            <span>${restaurant.city}${restaurant.state ? `, ${restaurant.state}` : ''}</span>
          </div>
        ` : ''}
        
        <!-- Botón de acción -->
        <div class="mt-4">
          <button 
            data-onclick="viewRestaurantDetails" 
            data-restaurant-id="${restaurant.restaurant_id || restaurant.id || ''}"
            class="w-full bg-am-600 hover:bg-am-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 group-hover:shadow-md"
          >
            Ver detalles
          </button>
        </div>
      </div>
    </article>
  `;
};

export default RestaurantCard;


