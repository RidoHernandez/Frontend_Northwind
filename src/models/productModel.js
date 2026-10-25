export class ProductModel {
    static createPayload({
        productId = null,
        productName = '',
        supplierId = null,
        categoryId = null,
        quantityPerUnit = null,
        unitPrice = null,
        unitsInStock = null,
        unitsOnOrder = null,
        reorderLevel = null,
        discontinued = false
    }) {
        const payload = {
            productName: productName.trim(),
            
            // Llaves foráneas: si viene vacío o 0, debe ser null
            supplierId: supplierId ? parseInt(supplierId, 10) : null,
            categoryId: categoryId ? parseInt(categoryId, 10) : null,

            quantityPerUnit: quantityPerUnit && quantityPerUnit.trim() !== '' ? quantityPerUnit.trim() : null,

            // Tipos numéricos requeridos por C# (no strings)
            unitPrice: unitPrice !== null && unitPrice !== '' ? parseFloat(unitPrice) : null,
            unitsInStock: unitsInStock !== null && unitsInStock !== '' ? parseInt(unitsInStock, 10) : null,
            unitsOnOrder: unitsOnOrder !== null && unitsOnOrder !== '' ? parseInt(unitsOnOrder, 10) : null,
            reorderLevel: reorderLevel !== null && reorderLevel !== '' ? parseInt(reorderLevel, 10) : null,

            // Booleano real
            discontinued: Boolean(discontinued)
        };

        // Si es actualización (PUT), el ID del cuerpo debe viajar obligatoriamente
        if (productId) {
            payload.productId = parseInt(productId, 10);
        }

        return payload;
    }
}