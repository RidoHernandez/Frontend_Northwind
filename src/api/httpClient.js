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

    const response = await fetch(url, finalOptions);

    if(response.status === 401){
        console.warn("No autenticado o sesión expirada. Debes iniciar sesión.");
    }

    return response;
};
