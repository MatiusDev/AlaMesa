// frontend/src/router/index.js
import Home from '@views/Home.js';
import Restaurants from '@views/Restaurants.js';
import Auth from '@views/Auth.js';
import RestaurantDetail from '@views/RestaurantDetail.js';

/**
 * @description
 * Define la configuración de las rutas de la aplicación.
 * Mapea una ruta (el "hash" de la URL) a la función constructora del componente que debe renderizarse.
 */
export default {
  '#/': Home,
  '#/restaurants': Restaurants,
  '#/restaurant': RestaurantDetail,
  '#/auth': Auth,
};
