// =============================================
// CONFIG - Ganti dengan URL Google Apps Script Anda
// =============================================
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw8Ls0SJxayK391IihvGFqKBR_vEQFlR0m8431iEARi1eQuguAxXXneLH1XRX-3OW8A/exec';

// =============================================
// DATA PRODUK CONTOH (fallback jika API gagal)
// =============================================
const SAMPLE_PRODUCTS = [
  // ── TEA SERIES ──
  { id: 't1', name: 'Original Tea', price: 3000, category: 'Tea Series', description: 'TehPremium + Gula', image: 'png/ori.jpg' },
  { id: 't2', name: 'Lychee Tea', price: 5000, category: 'Tea Series', description: 'TehPremium + Gula + Syrup Lychee', image: 'png/leci.jpg' },
  { id: 't3', name: 'Lemon Tea', price: 5000, category: 'Tea Series', description: 'TehPremium + Gula + Lemon', image: 'png/lemon.jpg' },
  { id: 't4', name: 'Yakult Tea', price: 7000, category: 'Tea Series', description: 'TehPremium + Gula + Yakult', image: 'png/yakult.jpg' },
  { id: 't5', name: 'Moca Tea', price: 5000, category: 'Tea Series', description: 'TehPremium + Gula + Syrup Moca', image: 'png/moca.jpg' },
  { id: 't6', name: 'Milo Tea', price: 7000, category: 'Tea Series', description: 'TehPremium + Gula + Milo', image: 'png/milo.webp' },

  // ── MILK TEA SERIES ──
  { id: 'm1', name: 'Original Milktea', price: 7000, category: 'Milk Tea Series', description: 'TehPremium + UHT + SKM', image: 'png/milkt ori.jpg' },
  { id: 'm2', name: 'Chocolate Milktea', price: 8000, category: 'Milk Tea Series', description: 'TehPremium + UHT + SKM + Bubuk Choco', image: 'png/milkchoc.webp' },
  { id: 'm3', name: 'Beng-beng Milktea', price: 8000, category: 'Milk Tea Series', description: 'TehPremium + UHT + SKM + Bubuk Beng"', image: 'png/beng.webp' },
  { id: 'm4', name: 'Silverqueen Milktea', price: 8000, category: 'Milk Tea Series', description: 'TehPremium + UHT + SKM + Bubuk Silverq', image: 'png/silver.webp' },
  { id: 'm5', name: 'Choco Oreo Milktea', price: 8000, category: 'Milk Tea Series', description: 'TehPremium + UHT + SKM + Choco Oreo', image: 'png/oreo.webp' },
  { id: 'm6', name: 'Choco Cheese Milktea', price: 8000, category: 'Milk Tea Series', description: 'TehPremium + UHT + SKM + Choco Cheese', image: 'png/cheese.webp' },
  { id: 'm7', name: 'Greentea Milktea', price: 8000, category: 'Milk Tea Series', description: 'TehPremium + UHT + SKM + Bubuk Greentea ', image: 'png/ijo.webp' },
  { id: 'm8', name: 'Strawbery Milktea', price: 8000, category: 'Milk Tea Series', description: 'TehPremium + UHT + SKM + Bubuk Strawberry', image: 'png/pink.webp' },
  { id: 'm9', name: 'Redvelve t Milktea', price: 8000, category: 'Milk Tea Series', description: 'TehPremium + UHT + SKM + Bubuk Redvelvet', image: 'png/re.webp' },
  { id: 'm10', name: 'Tiramisu Milktea', price: 8000, category: 'Milk Tea Series', description: 'TehPremium + UHT + SKM + Bubuk Tiramisu', image: 'png/tira.webp' },
  { id: 'm11', name: 'Thaitea Milktea', price: 8000, category: 'Milk Tea Series', description: 'TehPremium + UHT + SKM + Bubuk Thaitea', image: 'png/thai.webp' },
  { id: 'm12', name: 'Taro Milktea', price: 8000, category: 'Milk Tea Series', description: 'TehPremium + UHT + SKM + Bubuk Taro', image: 'png/taro.webp' },


  // ── MILKY SERIES ──
  { id: 'k1', name: 'Mango Milky', price: 120000, category: 'Milky Series', description: 'UHT + Bubuk Mangga + Oreo', image: 'png/mango.webp' },
  { id: 'k2', name: 'Grape Milky ', price: 12000, category: 'Milky Series', description: 'UHT + Bubuk Anggur + Oreo', image: 'png/grape.jpg' },
  { id: 'k3', name: 'Blue Vanilla Milky ', price: 12000, category: 'Milky Series', description: 'UHT + Bubuk Bllue Vanila + Oreo', image: 'png/blue.jpg' },
  
];

let allProducts = [];

// =============================================
// CART UTILITIES
// =============================================
function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
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

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(i => i.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart(cart);
  updateCartBadge();
  showToast(`"${product.name}" ditambahkan ke keranjang`);
}

// =============================================
// TOAST
// =============================================
function showToast(msg, isError = false) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');
  if (!toast) return;
  toastMsg.textContent = msg;
  toast.className = `fixed bottom-6 right-6 text-white px-5 py-3 rounded-lg shadow-lg z-50 transition-all ${isError ? 'bg-red-500' : 'bg-green-500'}`;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3000);
}

// =============================================
// FORMAT CURRENCY
// =============================================
function formatRupiah(num) {
  return 'Rp ' + Number(num).toLocaleString('id-ID');
}

// =============================================
// RENDER PRODUCTS
// =============================================
function renderProducts(products) {
  const grid = document.getElementById('product-grid');
  const noResult = document.getElementById('no-result');
  const countEl = document.getElementById('product-count');
  if (!grid) return;

  grid.innerHTML = '';
  if (countEl) countEl.textContent = `${products.length} produk`;

  if (products.length === 0) {
    noResult.classList.remove('hidden');
    return;
  }
  noResult.classList.add('hidden');

  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card flex flex-col';
    card.innerHTML = `
      <div class="img-wrap relative">
        <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover" loading="lazy"
          onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'" />
        <div class="absolute top-3 left-3">
          <span class="cat-badge">${product.category}</span>
        </div>
      </div>
      <div class="p-4 flex flex-col flex-1">
        <h3 class="font-bold text-gray-800 text-sm mb-1 clamp-2">${product.name}</h3>
        <p class="text-gray-400 text-xs mb-4 flex-1 clamp-2">${product.description}</p>
        <div class="flex items-center justify-between mt-auto">
          <div>
            <p class="text-xs text-gray-400 font-medium">Harga</p>
            <span class="text-green-700 font-extrabold text-base">${formatRupiah(product.price)}</span>
          </div>
          <button onclick='addToCart(${JSON.stringify(product)})'
            style="background:linear-gradient(135deg,#1e8449,#27ae60);box-shadow:0 4px 12px rgba(39,174,96,0.3)"
            class="text-white text-xs px-3.5 py-2 rounded-xl font-semibold flex items-center gap-1.5 hover:opacity-90 transition-all active:scale-95">
            <i class="fas fa-cart-plus"></i> Tambah
          </button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// =============================================
// POPULATE CATEGORIES
// =============================================
function populateCategories(products) {
  const select = document.getElementById('category-filter');
  if (!select) return;
  const categories = [...new Set(products.map(p => p.category))];
  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });
}

// =============================================
// FILTER & SEARCH (untuk halaman selain menu.html)
// =============================================
function applyFilters() {
  const query = document.getElementById('search-input')?.value.toLowerCase() || '';
  const category = document.getElementById('category-filter')?.value || '';
  const filtered = allProducts.filter(p => {
    const matchName = p.name.toLowerCase().includes(query);
    const matchCat = category === '' || p.category === category;
    return matchName && matchCat;
  });
  renderProducts(filtered);
}

// =============================================
// FETCH PRODUCTS FROM GOOGLE APPS SCRIPT
// =============================================
async function fetchProducts() {
  const loading = document.getElementById('loading');
  const errorMsg = document.getElementById('error-msg');
  if (loading) loading.classList.remove('hidden');

  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?action=getProducts`, { mode: 'cors' });
    if (!res.ok) throw new Error('Network error');
    const data = await res.json();
    if (data.status === 'success' && Array.isArray(data.products)) {
      allProducts = data.products;
    } else {
      throw new Error('Invalid data');
    }
  } catch (e) {
    allProducts = SAMPLE_PRODUCTS;
    if (errorMsg) {
      errorMsg.classList.remove('hidden');
      setTimeout(() => errorMsg.classList.add('hidden'), 4000);
    }
  } finally {
    if (loading) loading.classList.add('hidden');
    populateCategories(allProducts);
    // Hanya panggil renderProducts jika bukan halaman menu.html
    if (document.getElementById('product-grid')) {
      renderProducts(allProducts);
    }
    renderHomePreview(allProducts);
    window.dispatchEvent(new Event('productsLoaded'));
  }
}

// =============================================
// RENDER HOME PREVIEW (4 produk di beranda)
// =============================================
function renderHomePreview(products) {
  const grid = document.getElementById('home-product-grid');
  if (!grid) return;
  grid.innerHTML = '';
  products.slice(0, 4).forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card flex flex-col';
    card.innerHTML = `
      <div class="img-wrap relative">
        <img src="${product.image}" alt="${product.name}" class="w-full h-44 object-cover" loading="lazy"
          onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'" />
        <div class="absolute top-3 left-3"><span class="cat-badge">${product.category}</span></div>
      </div>
      <div class="p-4 flex flex-col flex-1">
        <h3 class="font-bold text-gray-800 text-sm mb-1 clamp-2">${product.name}</h3>
        <div class="flex items-center justify-between mt-auto pt-3">
          <span class="text-green-700 font-extrabold text-base">${formatRupiah(product.price)}</span>
          <button onclick='addToCart(${JSON.stringify(product)})'
            style="background:linear-gradient(135deg,#1e8449,#27ae60);box-shadow:0 4px 12px rgba(39,174,96,0.3)"
            class="text-white text-xs px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 hover:opacity-90 transition-all active:scale-95">
            <i class="fas fa-cart-plus"></i> Tambah
          </button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// =============================================
// INIT
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  fetchProducts();

  document.getElementById('search-input')?.addEventListener('input', applyFilters);
  document.getElementById('category-filter')?.addEventListener('change', applyFilters);
});
