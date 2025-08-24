import { getData, sendData, updateData, deleteData } from "@api";

const ENDPOINT = 'restaurants';

const getRestaurants = async () => {
    try {
        const data = await getData(ENDPOINT);
        console.log(data);
        return data;
    } catch (error) {
        console.error('Error fetching restaurants:', error);
        return []; // Devuelve un array vacío en caso de error
    }
};

const createRestaurant = async (restaurant) => {
    try {
        const data = await sendData(ENDPOINT, restaurant);
        console.log(data);
        return data;
    } catch (error) {
        console.error('Error posting restaurants:', error);
    }
}

const updateRestaurant = async (id, restaurant) => {
    try {
        const data = await updateData(ENDPOINT, id, restaurant);
        console.log(data);
        return data;
    } catch (error) {
        console.error('Error updating restaurants:', error);
    }
}

const deleteRestaurant = async (id) => {
    try {
        await deleteData(ENDPOINT, id);
    } catch (error) {
        console.log('Error deleting a restaurant', error);
    }
}

export { getRestaurants, createRestaurant, updateRestaurant, deleteRestaurant };
