const API_URL = import.meta.env.VITE_PLATFORM_CORE_URL || 'http://localhost:8081/api/v1';

export const authService = {
    register: async (data: any) => {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(await response.text());
        return response.json();
    },

    login: async (data: any) => {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(await response.text());
        const result = await response.json();
        if (result.access_token) {
            localStorage.setItem('token', result.access_token);
            localStorage.setItem('user', JSON.stringify(result.user));
        }
        return result;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getToken: () => localStorage.getItem('token'),
    getUser: () => JSON.parse(localStorage.getItem('user') || '{}'),
};
