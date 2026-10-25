import { httpClient, BASE_URL } from "../api/httpClient.js";

export const authService = {
    checkSession: async () => {
        try {
            const response = await httpClient('/auth/GoogleOAuth/response');
            if (response.ok) {
                return await response.json();
            }
            return null;
        } catch {
            return null;
        }
    },
    login: () => {
        const returnUrl = encodeURIComponent(`${window.location.origin}/productos.html`);
        window.location.href = `${BASE_URL}/auth/GoogleOAuth/google?returnUrl=${returnUrl}`;
    },
    logout: () => {
        const returnUrl = encodeURIComponent(`${window.location.origin}/login.html`);
        window.location.href = `${BASE_URL}/auth/GoogleOAuth/logout?returnUrl=${returnUrl}`;
    }
};