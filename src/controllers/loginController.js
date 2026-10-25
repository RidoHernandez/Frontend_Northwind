import { authService } from "../services/authService.js";

document.addEventListener('DOMContentLoaded', async () => {
    const usuario = await authService.checkSession();
    if (usuario) {
        window.location.href = './productos.html';
        return;
    }

    const btnLogin = document.getElementById('btnLogin');
    btnLogin.addEventListener('click', () => {
        btnLogin.disabled = true;
        btnLogin.textContent = 'Redirigiendo a Google...';
        authService.login();
    });
});