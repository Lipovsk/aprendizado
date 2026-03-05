// =====================
// CARRINHO
// =====================
let cart = [];
let total = 0;

function toggleCart() {
  document.getElementById('cartSidebar')?.classList.toggle('open');
  document.getElementById('overlay')?.classList.toggle('active');
}

function addToCart(name, price) {
  cart.push({ name, price });
  total += price;
  updateCart();

  const cartIcon = document.querySelector('.cart-icon');
  if (cartIcon) {
    cartIcon.style.transform = 'scale(1.3)';
    setTimeout(() => (cartIcon.style.transform = 'scale(1)'), 200);
  }
}

function updateCart() {
  const cartCount = document.getElementById('cartCount');
  const cartTotal = document.getElementById('cartTotal');
  const cartItems = document.getElementById('cartItems');

  if (cartCount) cartCount.textContent = cart.length;
  if (cartTotal) cartTotal.textContent = 'R$ ' + total.toFixed(2).replace('.', ',');

  if (!cartItems) return;

  if (cart.length === 0) {
    cartItems.innerHTML =
      '<p style="text-align: center; color: #999; margin-top: 2rem;">Seu carrinho está vazio</p>';
  } else {
    cartItems.innerHTML = cart
      .map(
        (item) => `
        <div class="cart-item">
          <img src="https://via.placeholder.com/80x100/333/fff?text=${item.name.charAt(0)}" alt="${item.name}">
          <div class="cart-item-details">
            <h4>${item.name}</h4>
            <p>R$ ${item.price.toFixed(2).replace('.', ',')}</p>
          </div>
        </div>
      `
      )
      .join('');
  }
}

// =====================
// CONTA (placeholder)
// =====================
function openAccount() {
  alert('Área da conta (em construção).');
}

// =====================
// PRODUTOS + FILTRO (pelo menu)
// =====================
const products = () => document.querySelectorAll('.product-card');

function showAllProducts() {
  products().forEach((p) => (p.style.display = ''));
}

function filterProducts(filter) {
  const f = (filter || '').toLowerCase();

  if (f === 'home' || f === 'all' || !f) {
    showAllProducts();
    return;
  }

  products().forEach((p) => {
    const cats = (p.dataset.category || '').toLowerCase();
    p.style.display = cats.includes(f) ? '' : 'none';
  });
}

document.querySelectorAll('nav a').forEach((link) => {
  link.addEventListener('click', (e) => {
    const id = (link.getAttribute('href') || '').replace('#', '').toLowerCase();
    const filtros = ['home', 'feminino', 'masculino', 'acessorios', 'sale'];

    if (!filtros.includes(id)) return;

    e.preventDefault();
    filterProducts(id);

    document.querySelector('#produtos')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  });
});

// =====================
// SMOOTH SCROLL (para outros anchors)
// =====================
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (!href) return;

    const id = href.replace('#', '').toLowerCase();
    const filtros = ['home', 'feminino', 'masculino', 'acessorios', 'sale'];

    // se for filtro do menu, não aplica smooth aqui (já foi tratado acima)
    if (this.closest('nav') && filtros.includes(id)) return;

    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// =====================
// SEARCH MODAL (bonito)
// =====================
function openSearch() {
  document.getElementById('searchOverlay')?.classList.add('active');
  document.getElementById('searchModal')?.classList.add('open');

  const input = document.getElementById('searchInput');
  if (input) {
    input.value = '';
    setTimeout(() => input.focus(), 50);
  }

  const hint = document.getElementById('searchHint');
  if (hint) hint.textContent = 'Dica: você pode digitar “vestido”, “jaqueta”, “tênis”...';
}

function closeSearch() {
  document.getElementById('searchOverlay')?.classList.remove('active');
  document.getElementById('searchModal')?.classList.remove('open');
}

function applySearch() {
  const input = document.getElementById('searchInput');
  const q = (input?.value || '').trim().toLowerCase();
  const cards = document.querySelectorAll('.product-card');

  if (!q) {
    cards.forEach((c) => (c.style.display = ''));
    return;
  }

  let found = 0;
  cards.forEach((card) => {
    const name = (card.querySelector('.product-name')?.textContent || '').toLowerCase();
    const show = name.includes(q);
    card.style.display = show ? '' : 'none';
    if (show) found++;
  });

  const hint = document.getElementById('searchHint');
  if (hint) {
    hint.textContent = found ? `Encontrados: ${found} produto(s).` : 'Nenhum produto encontrado. Tente outro termo.';
  }

  document.querySelector('#produtos')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// filtra enquanto digita
document.addEventListener('input', (e) => {
  if (e.target && e.target.id === 'searchInput') applySearch();
});

// ESC: fecha busca e carrinho (um único handler)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    // fecha carrinho
    document.getElementById('cartSidebar')?.classList.remove('open');
    document.getElementById('overlay')?.classList.remove('active');

    // fecha busca
    closeSearch();
  }

  if (e.key === 'Enter' && document.activeElement?.id === 'searchInput') {
    e.preventDefault();
    applySearch();
  }
});