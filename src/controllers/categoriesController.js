import { authService } from "../services/authService.js";
import { categoryService } from "../services/categoryService.js";

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

    await listarCategorias();
});

async function listarCategorias() {
    const tbody = document.getElementById('tbodyCategorias');
    try {
        const categorias = await categoryService.getCategories();

        if (!Array.isArray(categorias) || categorias.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" class="text-center py-4 text-muted">No hay categorías registradas.</td></tr>`;
            return;
        }

        tbody.innerHTML = categorias.map(c => `
            <tr>
                <td><strong>${c.categoryId}</strong></td>
                <td><span class="badge bg-secondary fs-6">${c.categoryName}</span></td>
                <td>${c.description || '<span class="text-muted">Sin descripción</span>'}</td>
            </tr>
        `).join('');
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center py-4 text-danger">${err.message}</td></tr>`;
    }
}