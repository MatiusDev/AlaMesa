import { getData, sendData, updateData, deleteData } from "@api";

const ENDPOINT = 'restaurants';

// --- Implementación de Caché para Restaurantes ---
let restaurantCache = null;
let ongoingRequest = null;

const getRestaurants = async () => {
    // 1. Si la caché ya tiene datos, devolverlos inmediatamente.
    if (restaurantCache) {
        console.log('Restaurantes devueltos desde CACHÉ.');
        return Promise.resolve(restaurantCache);
    }

    // 2. Si hay una petición en curso, no iniciar una nueva.
    // En su lugar, devolver la promesa de la petición existente.
    if (ongoingRequest) {
        console.log('Esperando por una petición de restaurantes ya en curso...');
        return ongoingRequest;
    }

    // 3. Si no hay caché ni petición en curso, iniciar una nueva.
    console.log('Realizando petición a la API para obtener restaurantes (solo ocurrirá una vez).');
    ongoingRequest = new Promise(async (resolve, reject) => {
        try {
            const data = await getData(ENDPOINT);
            console.log('Restaurantes cargados desde la API y guardados en caché:', data);
            restaurantCache = data; // Guardar en caché para futuras peticiones.
            ongoingRequest = null; // Limpiar la promesa en curso.
            resolve(restaurantCache);
        } catch (error) {
            console.error('Error fetching restaurants:', error);
            ongoingRequest = null; // Limpiar también en caso de error.
            reject(new Error('No se pudieron cargar los restaurantes. Verifica tu conexión.'));
        }
    });

    return ongoingRequest;
};

const getRestaurantById = async (id) => {
    try {
        const data = await getData(`${ENDPOINT}/${id}`);
        console.log('Restaurante cargado:', data);
        return data;
    } catch (error) {
        console.error('Error fetching restaurant:', error);
        throw new Error('No se pudo cargar el restaurante.');
    }
};

const createRestaurant = async (restaurant) => {
    try {
        const data = await sendData(ENDPOINT, restaurant);
        console.log('Restaurante creado:', data);
        return data;
    } catch (error) {
        console.error('Error creating restaurant:', error);
        throw new Error('No se pudo crear el restaurante.');
    }
};

const updateRestaurant = async (id, restaurant) => {
    try {
        const data = await updateData(ENDPOINT, id, restaurant);
        console.log('Restaurante actualizado:', data);
        return data;
    } catch (error) {
        console.error('Error updating restaurant:', error);
        throw new Error('No se pudo actualizar el restaurante.');
    }
};

const deleteRestaurant = async (id) => {
    try {
        await deleteData(ENDPOINT, id);
        console.log('Restaurante eliminado:', id);
        return true;
    } catch (error) {
        console.error('Error deleting restaurant:', error);
        throw new Error('No se pudo eliminar el restaurante.');
    }
};

// Función para buscar restaurantes con filtros
const searchRestaurants = async (filters = {}) => {
    try {
        const queryParams = new URLSearchParams();
        
        if (filters.query) queryParams.append('q', filters.query);
        if (filters.location) queryParams.append('city', filters.location);
        if (filters.cuisine) queryParams.append('cuisine', filters.cuisine);
        if (filters.priceRange) queryParams.append('price_range', filters.priceRange);
        if (filters.minRating) queryParams.append('min_rating', filters.minRating);
        
        const queryString = queryParams.toString();
        const url = queryString ? `${ENDPOINT}?${queryString}` : ENDPOINT;
        
        const data = await getData(url);
        console.log('Búsqueda de restaurantes:', { filters, results: data });
        return data;
    } catch (error) {
        console.error('Error searching restaurants:', error);
        throw new Error('Error en la búsqueda de restaurantes.');
    }
};

export { 
    getRestaurants, 
    getRestaurantById,
    createRestaurant, 
    updateRestaurant, 
    deleteRestaurant,
    searchRestaurants
};
