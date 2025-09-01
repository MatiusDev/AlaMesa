import { getData, sendData, updateData, deleteData } from "@api";

const ENDPOINT = 'restaurants';

const getRestaurants = async () => {
    try {
        const data = await getData(ENDPOINT);
        console.log('Restaurantes cargados:', data);
        return data;
    } catch (error) {
        console.error('Error fetching restaurants:', error);
        throw new Error('No se pudieron cargar los restaurantes. Verifica tu conexión.');
    }
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
