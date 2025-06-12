import axios from 'axios';
import { useAuthStore } from '../../stores/authStore';

const apiClient = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/v1/',
});

apiClient.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().accessToken;
        if (token) {
            config.headers['Authorization'] = `JWT ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;