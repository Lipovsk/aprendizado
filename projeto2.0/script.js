// =====================
// CARRINHO
// =====================
let cart = [];
let total = 0;

function toggleCart() {
  document.getElementById('cartSidebar')?.classList.toggle('open');
  document.getElementById('overlay')?.classList.toggle('active');
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
        (item, index) => `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}" class="cart-item-image">

          <div class="cart-item-details">
            <h4>${item.name}</h4>
            <p>R$ ${item.price.toFixed(2).replace('.', ',')}</p>
          </div>

          <button class="remove-item-btn" onclick="removeFromCart(${index})" aria-label="Remover produto">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `
      )
      .join('');
  }
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
  const hint = document.getElementById('searchHint');

  let found = 0;

  cards.forEach((card) => {
    const name = (card.querySelector('.product-name')?.textContent || '').toLowerCase();
    const show = !q || name.includes(q);

    card.style.display = show ? '' : 'none';

    if (show) found++;
  });

  if (hint) {
    hint.textContent = q
      ? (found ? `Encontrados: ${found} produto(s).` : 'Nenhum produto encontrado.')
      : 'Dica: você pode digitar “vestido”, “jaqueta”, “tênis”...';
  }

  closeSearch();

  document.querySelector('#produtos')?.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
}


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

function removeFromCart(index) {
  if (index < 0 || index >= cart.length) return;

  total -= cart[index].price;
  cart.splice(index, 1);

  if (total < 0) total = 0;

  updateCart();
}

function addToCartFromCard(button) {
  const card = button.closest('.product-card');
  if (!card) return;

  const productId = Number(card.dataset.id);
  const name = card.querySelector('.product-name')?.textContent.trim() || 'Produto';
  const priceText = card.querySelector('.product-price')?.textContent.trim() || 'R$ 0,00';
  const image = card.querySelector('.product-image img')?.src || '';

  const price = Number(
    priceText
      .replace('R$', '')
      .replace(/\s/g, '')
      .replace('.', '')
      .replace(',', '.')
  ) || 0;

  cart.push({ productId, name, price, image });
  total += price;
  updateCart();

  const cartIcon = document.querySelector('.cart-icon');
  if (cartIcon) {
    cartIcon.style.transform = 'scale(1.3)';
    setTimeout(() => {
      cartIcon.style.transform = 'scale(1)';
    }, 200);
  }
}


function openAccount(){
document.getElementById('accountOverlay').classList.add('active');
document.getElementById('accountModal').classList.add('open');
}

function closeAccount(){
document.getElementById('accountOverlay').classList.remove('active');
document.getElementById('accountModal').classList.remove('open');
}

function showLogin(){
document.getElementById('loginForm').classList.add('active');
document.getElementById('registerForm').classList.remove('active');

document.querySelectorAll('.tab')[0].classList.add('active');
document.querySelectorAll('.tab')[1].classList.remove('active');
}

function showRegister(){
document.getElementById('loginForm').classList.remove('active');
document.getElementById('registerForm').classList.add('active');

document.querySelectorAll('.tab')[0].classList.remove('active');
document.querySelectorAll('.tab')[1].classList.add('active');
}



// banco de dados
const SUPABASE_URL = "https://xxitjifmychfvvfojxyg.supabase.co";

const SUPABASE_KEY = "sb_publishable_tTH0qxbFIIQ6jKCHxQGlAw_MsEVfioF";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);
async function loadProducts() {
  const { data, error } = await supabaseClient
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('id', { ascending: true });

  console.log(data);
  console.log(error);

  if (error) {
    return;
  }

  const grid = document.getElementById('productGrid');
  if (!grid) return;

  grid.innerHTML = data.map((product) => `
    <div class="product-card" data-category="${product.category || ''}" data-id="${product.id}">
      <div class="product-image">
        <img src="${product.image_url || ''}" alt="${product.name}">
        <div class="quick-add" onclick="addToCartFromCard(this)">ADICIONAR AO CARRINHO</div>
      </div>
      <div class="product-info">
        <div class="product-name">${product.name}</div>
        <div class="product-price">R$ ${Number(product.price).toFixed(2).replace('.', ',')}</div>
      </div>
    </div>
  `).join('');
}

loadProducts();