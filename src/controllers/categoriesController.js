import { authService } from "../services/authService.js";
import { categoryService } from "../services/categoryService.js";
import { baseTableOptions, escapeHtml, initNavbar } from "../utils/tableHelpers.js";

let tabla = null;

document.addEventListener('DOMContentLoaded', async () => {
    const usuario = await authService.checkSession();
    if (!usuario) {
        window.location.href = './login.html';
        return;
    }
    initNavbar(usuario, authService);

    tabla = new DataTable('#tablaCategorias', baseTableOptions({
        order: [[0, 'asc']],
        columns: [
            { data: 'categoryId', render: (d) => `<strong>${escapeHtml(d)}</strong>` },
            { data: 'categoryName', render: (d, type) => type === 'display'
                ? `<span class="badge bg-secondary fs-6">${escapeHtml(d)}</span>` : d },
            { data: 'description', defaultContent: '', render: (d, type) => type === 'display'
                ? (d ? escapeHtml(d) : '<span class="text-muted">Sin descripción</span>') : (d ?? '') }
        ]
    }));

    await listarCategorias();
});

async function listarCategorias() {
    try {
        const categorias = await categoryService.getCategories();
        tabla.clear().rows.add(Array.isArray(categorias) ? categorias : []).draw();
    } catch (err) {
        tabla.clear().draw();
        alert(err.message);
    }
}
