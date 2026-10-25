import { httpClient } from "../api/httpClient.js";

export const categoryService = {
    getCategories: async () => {
        const response = await httpClient('/api/Categories');
        if (response.ok) return await response.json();
        throw new Error("No se pudieron cargar las categorías");
    }
};