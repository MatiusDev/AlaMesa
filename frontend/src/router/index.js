// frontend/src/router/index.js
import Counter from '@views/Counter.js';
import Restaurants from '@views/Restaurants.js';

/**
 * @description
 * Define la configuración de las rutas de la aplicación.
 * Mapea una ruta (el "hash" de la URL) a la función constructora del componente que debe renderizarse.
 */
export default {
  '#/': Counter,
  '#/restaurants': Restaurants,
};
