export const BASE_URL = 'https://api-outh-nwind8.westus3.cloudapp.azure.com';

export const httpClient = async (endpoint, options = {}) => {
    const url = `${BASE_URL}${endpoint}`;

    const defaultOptions = {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...(options.headers || {})
        }
    };
    
    try {
        const response = await fetch(url, finalOptions);
        if(response.status === 401){
            console.warn("401 Unauthorized: Sesión no válida o expirada.");
        } else if(response.status === 404){
            console.warn(`404 Not Found: El recurso en ${endpoint} no existe en la API.`);
        } else if(response.status === 500){
            console.error("500 Server Error: Fallo interno del servidor API.");
        }
        return response;
    } catch (error){
        console.error("Error de conexión con el servidor:", error);
        throw error;
    }
};
