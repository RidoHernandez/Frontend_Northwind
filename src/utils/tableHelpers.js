// Utilidades compartidas para las tablas DataTables (Bootstrap 5)

// Traducción oficial de DataTables al español
export const DT_LANGUAGE_URL = 'https://cdn.datatables.net/plug-ins/2.1.8/i18n/es-MX.json';

// Escapa texto proveniente de la API antes de insertarlo como HTML (evita XSS)
export function escapeHtml(value) {
    if (value === null || value === undefined) return '';
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Configuración base común para todas las tablas
export function baseTableOptions(extra = {}) {
    return {
        language: { url: DT_LANGUAGE_URL },
        responsive: true,
        pageLength: 10,
        lengthMenu: [5, 10, 25, 50, 100],
        data: [],
        ...extra
    };
}

// Inicializa el nombre del usuario y el botón de cerrar sesión del navbar
export function initNavbar(usuario, authService) {
    document.getElementById('lblUsuario').textContent = usuario.nombre || usuario.email;
    document.getElementById('btnLogout').addEventListener('click', () => {
        authService.logout();
    });
}
