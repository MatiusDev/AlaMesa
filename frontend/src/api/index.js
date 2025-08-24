const API_BASE_URL = 'http://localhost:3000/api';

const defaultOptions = {
    headers: {
        'Content-Type': 'application/json',
    }
}

const validateResponse = (response) => {
    if (!response.ok) {
        throw new Error(`HTTP ERROR (${response.status}): ${response.statusText}` );
    }

    return response;
}

const getData = async (endpoint, options = {}) => {
    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
            ...defaultOptions,
            ...options,
            method: 'GET',
        });
        const validatedResponse = validateResponse(response);
        return await validatedResponse.json();
    } catch (error) {
        throw new Error(`Error fetching data: ${error.message}`);
    }
}

const sendData = async (endpoint, data, options = {}) => {
    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
            ...defaultOptions,
            ...options,
            body: JSON.stringify(data),
            method: 'POST',
        });
        const validatedResponse = validateResponse(response);
        return await validatedResponse.json();
    } catch (error) {
        throw new Error(`Error posting data: ${error.message}`);
    }
}

const updateData = async (endpoint, id, data, options = {}) => {
    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
            ...defaultOptions,
            ...options,
            body: JSON.stringify(data),
            method: 'PUT',
        });
        const validatedResponse = validateResponse(response);
        return await validatedResponse.json();
    } catch (error) {
        throw new Error(`Error updating data: ${error.message}`);
    }
}

const deleteData = async (endpoint, id, options = {}) => {
    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
            ...defaultOptions,
            ...options,
            method: 'DELETE',
        });
        const validatedResponse = validateResponse(response);
        return await validatedResponse.json();
    } catch (error) {
        throw new Error(`Error deleting data: ${error.message}`);
    }
}

export { getData, sendData, updateData, deleteData };