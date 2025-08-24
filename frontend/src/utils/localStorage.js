const getUserData = () => {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
}

const setUserData = (data) => {
    if (!data) {
        throw new Error('Data must be provided to set user data');
    }
    localStorage.setItem('userData', JSON.stringify(data));
}

const clearUserData = () => {
    localStorage.removeItem('userData');
}

export {
    getUserData,
    setUserData,
    clearUserData
}