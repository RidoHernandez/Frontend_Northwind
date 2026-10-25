import { authService } from "../services/authService.js";
import { supplierService } from "../services/supplierService.js";

document.addEventListener('DOMContentLoaded', async () => {
    const usuario = await authService.checkSession();
    if (!usuario) {
        window.location.href = './login.html';
        return;
    }

    document.getElementById('lblUsuario').textContent = usuario.nombre || usuario.email;

    document.getElementById('btnLogout').addEventListener('click', () => {
        authService.logout();
    });
    
    await listarProveedores();
});

async function listarProveedores() {
    const tbody = document.getElementById('tbodyProveedores');
    try {
        const proveedores = await supplierService.getSuppliers();

        if (!Array.isArray(proveedores) || proveedores.length === 0) {
            tbody.innerHTML = `<tr><td colspan="2" class="text-center py-4 text-muted">No hay proveedores registrados.</td></tr>`;
            return;
        }

        tbody.innerHTML = proveedores.map(p => `
            <tr>
                <td><strong>${p.supplierId}</strong></td>
                <td>${p.companyName}</td>
            </tr>
        `).join('');
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="2" class="text-center py-4 text-danger">${err.message}</td></tr>`;
    }
}