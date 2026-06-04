// =============================================
// CONFIG
// =============================================
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyhxIgggPqa0jlMrCXJBokiRZ6iVl6N_XbGg377QRJNI7YqKfndeDE8KNM8YNAc-arYcg/exec';

// Ganti dengan nomor WhatsApp penjual (format: 62xxx tanpa + atau 0)
const WA_PENJUAL = '6285792053739'; // ← GANTI INI

// =============================================
// UTILITIES
// =============================================
function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
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

function showToast(msg, isError = true) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');
  if (!toast) return;
  toastMsg.textContent = msg;
  toast.className = `toast-box toast-enter fixed bottom-6 right-6 text-white px-5 py-3.5 rounded-2xl z-50 flex items-center gap-3 min-w-[260px] ${isError ? 'error' : ''}`;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 4000);
}

// =============================================
// PAYMENT METHOD SELECTOR
// =============================================
let selectedPayment = 'qris';

function selectPayment(method) {
  selectedPayment = method;

  // Reset semua option
  ['qris', 'transfer'].forEach(m => {
    const label = document.getElementById(`pay-${m}-label`);
    const check = document.getElementById(`check-${m}`);
    const dot = check?.querySelector('div');
    if (label) label.classList.remove('selected');
    if (dot) dot.classList.replace('bg-green-400', 'bg-transparent');
    if (check) check.classList.replace('border-green-400', 'border-green-800');
  });

  // Aktifkan yang dipilih
  const activeLabel = document.getElementById(`pay-${method}-label`);
  const activeCheck = document.getElementById(`check-${method}`);
  const activeDot = activeCheck?.querySelector('div');
  if (activeLabel) activeLabel.classList.add('selected');
  if (activeDot) activeDot.classList.replace('bg-transparent', 'bg-green-400');
  if (activeCheck) activeCheck.classList.replace('border-green-800', 'border-green-400');

  // Tampilkan detail panel
  document.getElementById('detail-qris').classList.toggle('hidden', method !== 'qris');
  document.getElementById('detail-transfer').classList.toggle('hidden', method !== 'transfer');
}

// Salin nomor rekening
function copyText(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(`Nomor ${text} berhasil disalin!`, false);
  }).catch(() => {
    // fallback
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    showToast(`Nomor ${text} berhasil disalin!`, false);
  });
}

// =============================================
// RENDER ORDER SUMMARY
// =============================================
function renderSummary() {
  const cart = getCart();
  const summaryEl = document.getElementById('order-summary');
  const totalEl = document.getElementById('order-total');
  const emptyNotice = document.getElementById('empty-notice');

  if (cart.length === 0) {
    emptyNotice.classList.remove('hidden');
    document.getElementById('checkout-form').classList.add('opacity-50', 'pointer-events-none');
    return;
  }

  let total = 0;
  summaryEl.innerHTML = '';

  cart.forEach(item => {
    total += item.price * item.qty;
    const el = document.createElement('div');
    el.className = 'flex items-center gap-3 py-2 border-b border-green-800/30 last:border-0';
    el.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="w-12 h-12 object-cover rounded-xl flex-shrink-0 border border-green-800/30"
        onerror="this.src='https://via.placeholder.com/48?text=?'" />
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold text-white truncate">${item.name}</p>
        <p class="text-xs text-green-400/70 mt-0.5">${item.qty} x ${formatRupiah(item.price)}</p>
      </div>
      <span class="text-sm font-bold text-green-400 flex-shrink-0">${formatRupiah(item.price * item.qty)}</span>
    `;
    summaryEl.appendChild(el);
  });

  totalEl.textContent = formatRupiah(total);
  const subtotalEl = document.getElementById('order-subtotal');
  if (subtotalEl) subtotalEl.textContent = formatRupiah(total);
}

// =============================================
// SUBMIT ORDER
// =============================================
async function submitOrder(e) {
  e.preventDefault();

  const cart = getCart();
  if (cart.length === 0) { showToast('Keranjang kosong!'); return; }

  const name    = document.getElementById('buyer-name').value.trim();
  const phone   = document.getElementById('buyer-phone').value.trim();
  const address = document.getElementById('buyer-address').value.trim();

  if (!name || !phone || !address) {
    showToast('Lengkapi semua data pembeli!');
    return;
  }

  const paymentLabel = selectedPayment === 'qris' ? 'QRIS' : 'Transfer Bank';
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const orderData = {
    action: 'saveOrder',
    name, phone, address,
    payment: paymentLabel,
    items: cart.map(i => `${i.name} (x${i.qty})`).join(', '),
    total,
    timestamp: new Date().toLocaleString('id-ID'),
  };

  document.getElementById('loading-overlay').classList.remove('hidden');
  document.getElementById('submit-btn').disabled = true;

  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(orderData),
    });

    // no-cors tidak bisa baca response, anggap sukses jika tidak error
    localStorage.removeItem('cart');
    updateCartBadge();
    document.getElementById('loading-overlay').classList.add('hidden');
    showSuccessModal(paymentLabel, total, orderData);

  } catch (err) {
    document.getElementById('loading-overlay').classList.add('hidden');
    document.getElementById('submit-btn').disabled = false;
    showToast('Gagal mengirim pesanan. Coba lagi.');
  }
}

// =============================================
// SUCCESS MODAL — tampilkan info pembayaran + buka WA
// =============================================
function showSuccessModal(paymentLabel, total, orderData) {
  const isQris = paymentLabel === 'QRIS';

  document.getElementById('success-payment-info').innerHTML = isQris
    ? `<div class="bg-green-900/40 border border-green-700/40 rounded-xl p-4 text-left mt-4">
        <p class="text-green-300 text-xs font-semibold mb-2 flex items-center gap-1.5">
          <i class="fas fa-qrcode"></i> Bayar via QRIS
        </p>
        <p class="text-green-400/70 text-xs">Scan QR Code yang tersedia, lalu kirim bukti pembayaran ke WhatsApp kami.</p>
        <p class="text-white font-extrabold text-base mt-2">${formatRupiah(total)}</p>
      </div>`
    : `<div class="bg-green-900/40 border border-green-700/40 rounded-xl p-4 text-left mt-4">
        <p class="text-green-300 text-xs font-semibold mb-2 flex items-center gap-1.5">
          <i class="fas fa-building-columns"></i> Transfer Bank
        </p>
        <p class="text-green-400/70 text-xs">Transfer <span class="text-white font-bold">${formatRupiah(total)}</span> ke:</p>
        <p class="text-white text-xs font-bold mt-1.5">BCA: 1234567890 &nbsp;|&nbsp; BNI: 0987654321</p>
        <p class="text-green-400/60 text-xs mt-0.5">a.n. Es Teh Ibukota</p>
      </div>`;

  // Buat pesan WhatsApp otomatis
  const waMsg = buildWAMessage(orderData, paymentLabel, total);
  const waUrl = `https://wa.me/${WA_PENJUAL}?text=${encodeURIComponent(waMsg)}`;

  // Update tombol kirim bukti bayar
  const waBtn = document.getElementById('wa-confirm-btn');
  if (waBtn) waBtn.href = waUrl;

  document.getElementById('success-modal').classList.remove('hidden');

  // Buka WA otomatis setelah 1.5 detik
  setTimeout(() => window.open(waUrl, '_blank'), 1500);
}

function buildWAMessage(order, paymentLabel, total) {
  const items = order.items.split(', ').map(i => `  • ${i}`).join('\n');
  return `🧋 *PESANAN BARU - Es Teh Ibukota*
━━━━━━━━━━━━━━━━━━━━
👤 *Nama:* ${order.name}
📱 *No. HP:* ${order.phone}
📍 *Alamat:* ${order.address}
━━━━━━━━━━━━━━━━━━━━
🛒 *Item Pesanan:*
${items}
━━━━━━━━━━━━━━━━━━━━
💳 *Metode Bayar:* ${paymentLabel}
💰 *Total:* ${formatRupiah(total)}
━━━━━━━━━━━━━━━━━━━━
📅 ${new Date().toLocaleString('id-ID')}`;
}

// =============================================
// INIT
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  renderSummary();
  selectPayment('qris'); // default
  document.getElementById('checkout-form').addEventListener('submit', submitOrder);
});
