
import axios from 'axios';

const API_URL = 'https://cho2hand-3.onrender.com/api';

export const getCities = () => {
    return axios.get(`${API_URL}/cities`);
};