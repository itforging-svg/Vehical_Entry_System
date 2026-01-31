import axios from 'axios';

const api = axios.create({
    baseURL: `https://${window.location.hostname}:5001/api`
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
            config.headers['x-access-token'] = token; // Support both just in case
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
