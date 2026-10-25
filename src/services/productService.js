import { httpClient } from "../api/httpClient.js";

export const productService = {
    getProducts: async () => {
        const response = await httpClient('/api/Products');
        if (response.ok) return await response.json();
        throw new Error(`Error ${response.status}: No se pudieron cargar los productos`);
    },
    createProduct: async (productPayload) => {
        return await httpClient('/api/Products', {
            method: 'POST',
            body: JSON.stringify(productPayload)
        });
    },
    updateProduct: async (id, productPayload) => {
        return await httpClient(`/api/Products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(productPayload)
        });
    },
    deleteProduct: async (id) => {
        return await httpClient(`/api/Products/${id}`, {
            method: 'DELETE'
        });
    }
};