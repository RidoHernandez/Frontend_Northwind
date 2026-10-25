import { authService } from "../services/authService.js";
import { productService } from "../services/productService.js";
import { categoryService } from "../services/categoryService.js";
import { supplierService } from "../services/supplierService.js";
import { ProductModel } from "../models/productModel.js";
import { baseTableOptions, escapeHtml, initNavbar } from "../utils/tableHelpers.js";

let productosCache = [];
let modalInstancia = null;
let tabla = null;

// Renderiza sólo en modo 'display'; para ordenar/buscar se usa el valor crudo
const display = (fn) => (data, type, row) => type === 'display' ? fn(data, row) : data;

document.addEventListener('DOMContentLoaded', async () => {
    const usuario = await authService.checkSession();
    if (!usuario) {
        window.location.href = './login.html';
        return;
    }
    initNavbar(usuario, authService);

    modalInstancia = new bootstrap.Modal(document.getElementById('modalProducto'));

    inicializarTabla();
    configurarEventos();

    await Promise.all([
        cargarSelects(),
        listarProductos()
    ]);
});

function inicializarTabla() {
    tabla = new DataTable('#tablaProductos', baseTableOptions({
        order: [[0, 'asc']],
        columns: [
            { data: 'productId', render: display(d => `<strong>${escapeHtml(d)}</strong>`) },
            { data: 'productName', render: display(d => escapeHtml(d)) },
            { data: 'unitPrice', defaultContent: 0,
              render: display(d => `$${d != null ? parseFloat(d).toFixed(2) : '0.00'}`) },
            { data: 'unitsInStock', defaultContent: 0, render: display(d => escapeHtml(d ?? 0)) },
            { data: 'unitsOnOrder', defaultContent: 0, render: display(d => escapeHtml(d ?? 0)) },
            { data: 'quantityPerUnit', defaultContent: '', render: display(d => d ? escapeHtml(d) : '-') },
            { data: 'category', defaultContent: '',
              render: display(d => `<span class="badge bg-secondary">${d ? escapeHtml(d) : 'Sin categoría'}</span>`) },
            { data: 'supplier', defaultContent: '', render: display(d => d ? escapeHtml(d) : 'Sin proveedor') },
            { data: 'discontinued', defaultContent: false,
              render: (d, type) => {
                  const texto = d ? 'Descontinuado' : 'Activo';
                  if (type !== 'display') return texto;
                  return d
                      ? '<span class="badge bg-danger">Descontinuado</span>'
                      : '<span class="badge bg-success">Activo</span>';
              } },
            { data: null, orderable: false, searchable: false, className: 'text-center text-nowrap',
              render: (_, __, row) => `
                <button type="button" class="btn btn-sm btn-outline-primary me-1" data-action="editar" data-id="${escapeHtml(row.productId)}">Editar</button>
                <button type="button" class="btn btn-sm btn-outline-danger" data-action="eliminar" data-id="${escapeHtml(row.productId)}">Eliminar</button>` }
        ]
    }));
}

async function cargarSelects() {
    const selectCat = document.getElementById('prodCategory');
    const selectSup = document.getElementById('prodSupplier');

    try {
        const [categorias, proveedores] = await Promise.all([
            categoryService.getCategories(),
            supplierService.getSuppliers()
        ]);

        categorias.forEach(cat => {
            selectCat.add(new Option(cat.categoryName, cat.categoryId));
        });

        proveedores.forEach(prov => {
            selectSup.add(new Option(prov.companyName, prov.supplierId));
        });
    } catch (err) {
        console.warn("Aviso al cargar listas desplegables:", err);
    }
}

async function listarProductos() {
    try {
        productosCache = await productService.getProducts();
        tabla.clear().rows.add(Array.isArray(productosCache) ? productosCache : []).draw();
    } catch (err) {
        tabla.clear().draw();
        alert(err.message);
    }
}

function configurarEventos() {
    const form = document.getElementById('formProducto');

    document.getElementById('btnNuevoProducto').addEventListener('click', () => {
        form.reset();
        form.classList.remove('was-validated');
        document.getElementById('prodId').value = '';
        document.getElementById('modalTitulo').textContent = 'Nuevo Producto';
        modalInstancia.show();
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validación nativa del formulario con estilos de Bootstrap
        if (!form.checkValidity() || document.getElementById('prodName').value.trim() === '') {
            form.classList.add('was-validated');
            return;
        }

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

    // Delegación de eventos para los botones de acción de la tabla
    document.getElementById('tablaProductos').addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        const id = parseInt(btn.dataset.id, 10);
        if (btn.dataset.action === 'editar') editarProducto(id);
        if (btn.dataset.action === 'eliminar') eliminarProducto(id);
    });
}

function editarProducto(id) {
    const prod = productosCache.find(p => p.productId === id);
    if (!prod) return;

    const form = document.getElementById('formProducto');
    form.classList.remove('was-validated');

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
}

async function eliminarProducto(id) {
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
}
