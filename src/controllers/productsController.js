import { authService } from "../services/authService.js";
import { productService } from "../services/productService.js";
import { categoryService } from "../services/categoryService.js";
import { supplierService } from "../services/supplierService.js";
import { ProductModel } from "../models/productModel.js";

(async () => {
    const usuario = await authService.checkSession();
    if (!usuario) {
        window.location.replace('./login.html');
        return;
    }
    document.addEventListener('DOMContentLoaded', () => {
        document.getElementById('lblUsuario').textContent = usuario.nombre || usuario.email;
        document.getElementById('btnLogout').addEventListener('click', () => {
            authService.logout();
        });
        const modalEl = document.getElementById('modalProducto');
        if (modalEl && window.bootstrap) {
            modalInstancia = new bootstrap.Modal(modalEl);
        }
        configurarEventos();
        cargarSelects();
        listarProductos();
    });
})();


let productosCache = [];
let modalInstancia = null;

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


    modalInstancia = new bootstrap.Modal(document.getElementById('modalProducto'));

    configurarEventos();

    await Promise.all([
        cargarSelects(),
        listarProductos()
    ]);
});

async function cargarSelects() {
    const selectCat = document.getElementById('prodCategory');
    const selectSup = document.getElementById('prodSupplier');

    try {
        const [categorias, proveedores] = await Promise.all([
            categoryService.getCategories(),
            supplierService.getSuppliers()
        ]);

        categorias.forEach(cat => {
            selectCat.innerHTML += `<option value="${cat.categoryId}">${cat.categoryName}</option>`;
        });

        proveedores.forEach(prov => {
            selectSup.innerHTML += `<option value="${prov.supplierId}">${prov.companyName}</option>`;
        });
    } catch (err) {
        console.warn("Aviso al cargar listas desplegables:", err);
    }
}

async function listarProductos() {
    const tbody = document.getElementById('tbodyProductos');
    try {
        productosCache = await productService.getProducts();

        if (productosCache.length === 0) {
            tbody.innerHTML = `<tr><td colspan="10" class="text-center py-4 text-muted">No hay productos registrados.</td></tr>`;
            return;
        }

        tbody.innerHTML = productosCache.map(p => `
            <tr>
                <td><strong>${p.productId}</strong></td>
                <td>${p.productName}</td>
                <td>$${p.unitPrice != null ? parseFloat(p.unitPrice).toFixed(2) : '0.00'}</td>
                <td>${p.unitsInStock ?? 0}</td>
                <td>${p.unitsOnOrder ?? 0}</td>
                <td>${p.quantityPerUnit || '-'}</td>
                <td><span class="badge bg-secondary">${p.category || 'Sin categoría'}</span></td>
                <td>${p.supplier || 'Sin proveedor'}</td>
                <td>
                    ${p.discontinued 
                        ? '<span class="badge bg-danger">Descontinuado</span>' 
                        : '<span class="badge bg-success">Activo</span>'}
                </td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="window.editarProducto(${p.productId})">Editar</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="window.eliminarProducto(${p.productId})">Eliminar</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="10" class="text-center py-4 text-danger">${err.message}</td></tr>`;
    }
}

function configurarEventos() {
    document.getElementById('btnNuevoProducto').addEventListener('click', () => {
        document.getElementById('formProducto').reset();
        document.getElementById('prodId').value = '';
        document.getElementById('modalTitulo').textContent = 'Nuevo Producto';
        modalInstancia.show();
    });
    document.getElementById('formProducto').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btnGuardar = document.getElementById('btnGuardar');
        const id = document.getElementById('prodId').value;
        const esEdicion = Boolean(id);

        const payload = ProductModel.createPayload({
            productId: id,
            productName: document.getElementById('prodName').value,
            categoryId: document.getElementById('prodCategory').value,
            supplierId: document.getElementById('prodSupplier').value,
            unitPrice: document.getElementById('prodPrice').value,
            quantityPerUnit: document.getElementById('prodQuantity').value,
            unitsInStock: document.getElementById('prodStock').value,
            unitsOnOrder: document.getElementById('prodOrder').value,
            reorderLevel: document.getElementById('prodReorder').value,
            discontinued: document.getElementById('prodDiscontinued').checked
        });

        try {
            btnGuardar.disabled = true;
            btnGuardar.textContent = 'Guardando...';

            const resp = esEdicion 
                ? await productService.updateProduct(id, payload)
                : await productService.createProduct(payload);

            if (!resp.ok) {
                const detalle = await resp.text();
                throw new Error(detalle || `HTTP ${resp.status}`);
            }

            modalInstancia.hide();
            await listarProductos();
            alert(esEdicion ? 'Producto actualizado' : 'Producto creado');
        } catch (err) {
            alert('Error al guardar: ' + err.message);
        } finally {
            btnGuardar.disabled = false;
            btnGuardar.textContent = 'Guardar';
        }
    });

    window.editarProducto = (id) => {
        const prod = productosCache.find(p => p.productId === id);
        if (!prod) return;

        document.getElementById('prodId').value = prod.productId;
        document.getElementById('prodName').value = prod.productName;
        document.getElementById('prodCategory').value = prod.categoryId || '';
        document.getElementById('prodSupplier').value = prod.supplierId || '';
        document.getElementById('prodPrice').value = prod.unitPrice ?? '';
        document.getElementById('prodQuantity').value = prod.quantityPerUnit || '';
        document.getElementById('prodStock').value = prod.unitsInStock ?? 0;
        document.getElementById('prodOrder').value = prod.unitsOnOrder ?? 0;
        document.getElementById('prodReorder').value = prod.reorderLevel ?? 0;
        document.getElementById('prodDiscontinued').checked = Boolean(prod.discontinued);

        document.getElementById('modalTitulo').textContent = `Editar Producto #${prod.productId}`;
        modalInstancia.show();
    };

    window.eliminarProducto = async (id) => {
        const confirmar = confirm(`¿Estás seguro de eliminar el producto #${id}?`);
        if (!confirmar) return;

        try {
            const resp = await productService.deleteProduct(id);
            if (!resp.ok) {
                const errorData = await resp.json().catch(() => null);
                const msg = errorData?.message || `No se pudo eliminar (HTTP ${resp.status})`;
                throw new Error(msg);
            }
            await listarProductos();
            alert('Producto eliminado exitosamente');
        } catch (err) {
            alert(err.message);
        }
    };
}