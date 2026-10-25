import { httpClient } from "../api/httpClient.js";

export const supplierService = {
    getSuppliers: async () => {
        const response = await httpClient('/api/Suppliers');
        if (response.ok) return await response.json();
        throw new Error("No se pudieron cargar los proveedores");
    }
};