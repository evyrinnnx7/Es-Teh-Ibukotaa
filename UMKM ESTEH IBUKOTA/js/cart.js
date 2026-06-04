// =============================================
// CART PAGE LOGIC
// =============================================

function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function formatRupiah(num) {
  return 'Rp ' + Number(num).toLocaleString('id-ID');
}

function updateCartBadge() {
  const cart = getCart();
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  const badge = document.getElementById('cart-badge');
  if (badge) {
    badge.textContent = total;
    badge.classList.toggle('hidden', total === 0);
  }
}

function showToast(msg, isError = false) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');
  if (!toast) return;
  toastMsg.textContent = msg;
  toast.className = `fixed bottom-6 right-6 text-white px-5 py-3 rounded-lg shadow-lg z-50 ${isError ? 'bg-red-500' : 'bg-green-500'}`;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3000);
}

function changeQty(id, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeItem(id);
    return;
  }
  saveCart(cart);
  renderCart();
}

function removeItem(id) {
  let cart = getCart();
  const item = cart.find(i => i.id === id);
  cart = cart.filter(i => i.id !== id);
  saveCart(cart);
  renderCart();
  if (item) showToast(`"${item.name}" dihapus dari keranjang`);
}

function clearCart() {
  if (!confirm('Kosongkan semua keranjang?')) return;
  localStorage.removeItem('cart');
  renderCart();
  showToast('Keranjang dikosongkan');
}

function renderCart() {
  const cart = getCart();
  const container = document.getElementById('cart-container');
  const emptyCart = document.getElementById('empty-cart');
  const itemsEl = document.getElementById('cart-items');

  updateCartBadge();

  if (cart.length === 0) {
    container.classList.add('hidden');
    emptyCart.classList.remove('hidden');
    return;
  }

  container.classList.remove('hidden');
  emptyCart.classList.add('hidden');

  itemsEl.innerHTML = '';
  let totalPrice = 0;
  let totalItems = 0;

  cart.forEach(item => {
    totalPrice += item.price * item.qty;
    totalItems += item.qty;

    const el = document.createElement('div');
    el.className = 'cart-item p-4 flex gap-4 items-center';
    el.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-cover rounded-xl flex-shrink-0 border border-gray-100"
        onerror="this.src='https://via.placeholder.com/80?text=No+Image'" />
      <div class="flex-1 min-w-0">
        <h3 class="font-bold text-gray-800 text-sm truncate">${item.name}</h3>
        <p class="text-green-700 font-extrabold text-sm mt-0.5">${formatRupiah(item.price)}</p>
        <div class="flex items-center gap-2 mt-2.5">
          <button onclick="changeQty('${item.id}', -1)" class="qty-btn">−</button>
          <span class="text-sm font-bold w-7 text-center text-gray-700">${item.qty}</span>
          <button onclick="changeQty('${item.id}', 1)" class="qty-btn">+</button>
        </div>
      </div>
      <div class="text-right flex-shrink-0">
        <p class="text-sm font-extrabold text-gray-800">${formatRupiah(item.price * item.qty)}</p>
        <button onclick="removeItem('${item.id}')"
          class="text-red-400 hover:text-red-600 text-xs mt-2 flex items-center gap-1 ml-auto transition-colors">
          <i class="fas fa-trash text-xs"></i> Hapus
        </button>
      </div>
    `;
    itemsEl.appendChild(el);
  });

  document.getElementById('total-items').textContent = `${totalItems} item`;
  document.getElementById('total-price').textContent = formatRupiah(totalPrice);
}

document.addEventListener('DOMContentLoaded', () => {
  renderCart();
});
