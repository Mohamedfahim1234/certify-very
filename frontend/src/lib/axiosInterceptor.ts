import axios from 'axios';

// Global response interceptor — auto-logout on JWT expiry / 401
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        const message: string = error?.response?.data?.message || '';

        const isJwtExpired =
            status === 401 ||
            message.toLowerCase().includes('jwt expired') ||
            message.toLowerCase().includes('token expired') ||
            message.toLowerCase().includes('invalid token') ||
            message.toLowerCase().includes('unauthorized');

        if (isJwtExpired) {
            // Read role BEFORE wiping storage
            const role = localStorage.getItem('role');
            const isOfficer = role && ['officer', 'senior', 'higher'].includes(role);

            // Wipe all auth data
            localStorage.clear();

            // Redirect to the correct login page
            window.location.href = isOfficer ? '/officer-login' : '/login';
        }

        return Promise.reject(error);
    }
);
