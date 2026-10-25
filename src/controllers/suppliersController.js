import { authService } from "../services/authService.js";
import { supplierService } from "../services/supplierService.js";
import { baseTableOptions, escapeHtml, initNavbar } from "../utils/tableHelpers.js";

let tabla = null;

document.addEventListener('DOMContentLoaded', async () => {
    const usuario = await authService.checkSession();
    if (!usuario) {
        window.location.href = './login.html';
        return;
    }
    initNavbar(usuario, authService);

    tabla = new DataTable('#tablaProveedores', baseTableOptions({
        order: [[0, 'asc']],
        columns: [
            { data: 'supplierId', render: (d) => `<strong>${escapeHtml(d)}</strong>` },
            { data: 'companyName', render: (d) => escapeHtml(d) }
        ]
    }));

    await listarProveedores();
});

async function listarProveedores() {
    try {
        const proveedores = await supplierService.getSuppliers();
        tabla.clear().rows.add(Array.isArray(proveedores) ? proveedores : []).draw();
    } catch (err) {
        tabla.clear().draw();
        alert(err.message);
    }
}
