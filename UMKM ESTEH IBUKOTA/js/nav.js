// =============================================
// SHARED NAVBAR - inject ke semua halaman
// =============================================
function renderNavbar(activePage = '') {
  const pages = [
    { id: 'beranda', label: 'Beranda', href: 'index.html', icon: 'fa-house' },
    { id: 'menu', label: 'Menu', href: 'menu.html', icon: 'fa-grid-2' },
    { id: 'tentang', label: 'Tentang', href: 'tentang.html', icon: 'fa-circle-info' },
    { id: 'kontak', label: 'Kontak', href: 'kontak.html', icon: 'fa-envelope' },
  ];

  const navLinks = pages.map(p => {
    const isActive = p.id === activePage;
    return `
      <a href="${p.href}"
        class="nav-link relative text-sm font-semibold px-3 py-2 rounded-lg transition-all
          ${isActive
            ? 'text-green-300 bg-green-900/40'
            : 'text-green-400/70 hover:text-green-200 hover:bg-white/5'}">
        ${p.label}
        ${isActive ? '<span class="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-green-400 rounded-full"></span>' : ''}
      </a>`;
  }).join('');

  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const html = `
    <nav class="navbar sticky top-0 z-50">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <!-- Logo -->
        <a href="index.html" class="flex items-center gap-2.5 flex-shrink-0">
          <div class="w-9 h-9 btn-primary rounded-xl flex items-center justify-center shadow-lg">
            <i class="fas fa-leaf text-white text-sm"></i>
          </div>
          <span class="text-xl font-extrabold text-gradient">Es Teh Ibukota</span>
        </a>

        <!-- Desktop Nav -->
        <div class="hidden md:flex items-center gap-1">
          ${navLinks}
        </div>

        <!-- Right: Cart + Mobile Toggle -->
        <div class="flex items-center gap-2">
          <a href="cart.html" class="relative group">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center border border-green-800 hover:border-green-500 hover:bg-green-900/40 transition-all">
              <i class="fas fa-shopping-cart text-green-400 group-hover:text-green-300 text-sm"></i>
            </div>
            <span id="cart-badge"
              class="badge-pulse absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs rounded-full w-5 h-5 items-center justify-center font-bold shadow-lg
              ${cartCount > 0 ? 'flex' : 'hidden'}">
              ${cartCount}
            </span>
          </a>
          <!-- Mobile hamburger -->
          <button id="mobile-menu-btn"
            class="md:hidden w-10 h-10 rounded-xl flex items-center justify-center border border-green-800 hover:bg-green-900/40 transition-all">
            <i class="fas fa-bars text-green-400 text-sm"></i>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div id="mobile-menu" class="md:hidden hidden border-t border-green-900/50 bg-green-950/95 px-4 py-3">
        <div class="flex flex-col gap-1">
          ${pages.map(p => `
            <a href="${p.href}"
              class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all
                ${p.id === activePage
                  ? 'bg-green-800/50 text-green-300'
                  : 'text-green-400/70 hover:bg-green-900/40 hover:text-green-200'}">
              <i class="fas ${p.icon} w-4 text-center text-green-500"></i>
              ${p.label}
            </a>`).join('')}
        </div>
      </div>
    </nav>
  `;

  document.getElementById('navbar-placeholder').innerHTML = html;

  // Mobile toggle
  document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
    document.getElementById('mobile-menu').classList.toggle('hidden');
  });
}

// Cart badge update utility (shared)
function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const total = cart.reduce((s, i) => s + i.qty, 0);
  const badge = document.getElementById('cart-badge');
  if (badge) {
    badge.textContent = total;
    badge.className = badge.className.replace(/\b(flex|hidden)\b/g, '').trim();
    badge.classList.add(total > 0 ? 'flex' : 'hidden');
  }
}
