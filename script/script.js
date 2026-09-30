/* =============================================
   VESTA — E-commerce de Ropa
   app.js
   ============================================= */

// ---- Estado del carrito ----
let cart = [];

// ---- Elementos del DOM ----
const cartToggle   = document.getElementById('cartToggle');
const cartClose    = document.getElementById('cartClose');
const cartSidebar  = document.getElementById('cartSidebar');
const cartOverlay  = document.getElementById('cartOverlay');
const cartCount    = document.getElementById('cartCount');
const cartItems    = document.getElementById('cartItems');
const cartTotal    = document.getElementById('cartTotal');
const checkoutBtn  = document.getElementById('checkoutBtn');

const modalOverlay = document.getElementById('modalOverlay');
const modalClose   = document.getElementById('modalClose');
const modalTotal   = document.getElementById('modalTotal');
const checkoutForm = document.getElementById('checkoutForm');

// ---- Abrir / cerrar carrito ----
cartToggle.addEventListener('click', () => {
  cartSidebar.classList.add('open');
  cartOverlay.classList.add('active');
});

function closeCart() {
  cartSidebar.classList.remove('open');
  cartOverlay.classList.remove('active');
}

cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

// ---- Seleccionar talle ----
document.querySelectorAll('.size-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    // Deselecciona los otros talles del mismo producto
    const card = btn.closest('.product-card');
    card.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  });
});

// ---- Agregar producto al carrito ----
document.querySelectorAll('.add-to-cart').forEach(button => {
  button.addEventListener('click', () => {
    const card  = button.closest('.product-card');
    const id    = card.dataset.id;
    const name  = card.dataset.name;
    const price = parseInt(card.dataset.price);

    // Verificar que eligió un talle
    const selectedSizeBtn = card.querySelector('.size-btn.selected');
    if (!selectedSizeBtn) {
      alert('Por favor elegí un talle antes de agregar al carrito.');
      return;
    }
    const size = selectedSizeBtn.dataset.size;

    // El ID incluye el talle para permitir el mismo producto en talles distintos
    const cartId = `${id}-${size}`;
    const existing = cart.find(item => item.cartId === cartId);

    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ cartId, id, name, price, size, qty: 1 });
    }

    renderCart();
    openCart();
  });
});

function openCart() {
  cartSidebar.classList.add('open');
  cartOverlay.classList.add('active');
}

// ---- Eliminar producto del carrito ----
function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  renderCart();
}

// ---- Renderizar carrito ----
function renderCart() {
  // Calcular total
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  // Actualizar badge
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  cartCount.textContent = totalQty;

  // Actualizar total visible
  cartTotal.textContent  = '$ ' + total.toLocaleString('es-CO');
  modalTotal.textContent = '$ ' + total.toLocaleString('es-CO');

  // Habilitar/deshabilitar botón de checkout
  checkoutBtn.disabled = cart.length === 0;

  // Renderizar ítems
  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="cart-empty">Tu carrito está vacío.</p>';
    return;
  }

  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item__info">
        <p class="cart-item__name">${item.name} — Talle ${item.size} × ${item.qty}</p>
        <p class="cart-item__price">$ ${(item.price * item.qty).toLocaleString('es-CO')}</p>
      </div>
      <button class="cart-item__remove" onclick="removeFromCart('${item.id}')" aria-label="Eliminar">✕</button>
    </div>
  `).join('');
}

// ---- Abrir modal de checkout ----
checkoutBtn.addEventListener('click', () => {
  closeCart();
  modalOverlay.classList.add('active');
});

// ---- Cerrar modal ----
modalClose.addEventListener('click', () => {
  modalOverlay.classList.remove('active');
});

modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) {
    modalOverlay.classList.remove('active');
  }
});

// ---- Enviar pedido por WhatsApp ----
checkoutForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const nombre    = document.getElementById('nombre').value.trim();
  const email     = document.getElementById('email').value.trim();
  const telefono  = document.getElementById('telefono').value.trim();
  const direccion = document.getElementById('direccion').value.trim();
  const notas     = document.getElementById('notas').value.trim();

  // Validación básica
  if (!nombre || !email || !telefono || !direccion) {
    alert('Por favor completá todos los campos obligatorios.');
    return;
  }

  // Armar resumen del pedido
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const productLines = cart.map(item =>
    `• ${item.name} x${item.qty} — $${(item.price * item.qty).toLocaleString('es-CO')}`
  ).join('\n');

  const mensaje = `
🛍️ *NUEVO PEDIDO — VESTA*

👤 *Cliente:* ${nombre}
📧 *Email:* ${email}
📱 *WhatsApp:* ${telefono}
📍 *Dirección:* ${direccion}
${notas ? `📝 *Notas:* ${notas}` : ''}

*Productos:*
${productLines}

💰 *Total a pagar: $${total.toLocaleString('es-CO')}*
💳 *Pago: Nequi 311 456 4706*

_Por favor enviame el comprobante de pago para confirmar el pedido._
  `.trim();

  const whatsappURL = `https://wa.me/573151123003?text=${encodeURIComponent(mensaje)}`;
  window.open(whatsappURL, '_blank');

  // Limpiar todo
  cart = [];
  renderCart();
  checkoutForm.reset();
  modalOverlay.classList.remove('active');
});