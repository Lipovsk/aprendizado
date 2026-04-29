// =====================
// SUPABASE
// =====================
const SUPABASE_URL = "https://xxitjifmychfvvfojxyg.supabase.co";
const SUPABASE_KEY = "sb_publishable_tTH0qxbFIIQ6jKCHxQGlAw_MsEVfioF";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// =====================
// MODAL CONTA
// =====================
function closeAccount() {
  document.getElementById('accountOverlay')?.classList.remove('active');
  document.getElementById('accountModal')?.classList.remove('open');
}

async function openAccount() {
  document.getElementById('accountOverlay')?.classList.add('active');
  document.getElementById('accountModal')?.classList.add('open');

  const { data: { session } } = await supabaseClient.auth.getSession();

  if (session?.user) {
    const user = session.user;

    document.getElementById('accountTabs').style.display = 'none';
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('userPanel').style.display = 'block';

    document.getElementById('userGreeting').textContent =
      'Olá, ' + (user.user_metadata?.full_name?.split(' ')[0] ?? 'Cliente') + '!';

    document.getElementById('userEmail').textContent = user.email;
  } else {
    document.getElementById('accountTabs').style.display = '';
    document.getElementById('userPanel').style.display = 'none';
    showLogin();
  }
}

function showLogin() {
  document.getElementById('userPanel').style.display = 'none';
  document.getElementById('accountTabs').style.display = '';

  document.getElementById('loginForm').style.display = '';
  document.getElementById('registerForm').style.display = '';

  document.getElementById('loginForm').classList.add('active');
  document.getElementById('registerForm').classList.remove('active');

  document.querySelectorAll('.tab')[0]?.classList.add('active');
  document.querySelectorAll('.tab')[1]?.classList.remove('active');
}

function showRegister() {
  document.getElementById('userPanel').style.display = 'none';
  document.getElementById('accountTabs').style.display = '';

  document.getElementById('loginForm').style.display = '';
  document.getElementById('registerForm').style.display = '';

  document.getElementById('loginForm').classList.remove('active');
  document.getElementById('registerForm').classList.add('active');

  document.querySelectorAll('.tab')[0]?.classList.remove('active');
  document.querySelectorAll('.tab')[1]?.classList.add('active');
}

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
    return;
  }

  cartItems.innerHTML = cart.map((item, index) => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" class="cart-item-image">

      <div class="cart-item-details">
        <h4>${item.name}</h4>
        <p>R$ ${item.price.toFixed(2).replace('.', ',')}</p>
      </div>

      <button class="remove-item-btn" onclick="removeFromCart(${index})">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `).join('');
}

function removeFromCart(index) {
  if (index < 0 || index >= cart.length) return;

  total -= cart[index].price;
  cart.splice(index, 1);

  if (total < 0) total = 0;

  updateCart();
}

async function addToCartFromCard(button) {
  const { data: { session } } = await supabaseClient.auth.getSession();

  if (!session) {
    openAccount();
    showLogin();
    showMsg(document.getElementById('loginMsg'), '⚠ Faça login para adicionar ao carrinho.', 'error');
    return;
  }

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

// =====================
// LOGIN / CADASTRO
// =====================
supabaseClient.auth.onAuthStateChange((_event, session) => {
  updateUserUI(session?.user ?? null);
});

supabaseClient.auth.getSession().then(({ data: { session } }) => {
  updateUserUI(session?.user ?? null);
});

function updateUserUI(user) {
  const icon = document.querySelector('.user-icon i');
  if (!icon) return;

  if (user) {
    icon.className = 'fa-solid fa-user';
    icon.parentElement.title = user.user_metadata?.full_name || user.email;
  } else {
    icon.className = 'fa-regular fa-user';
    icon.parentElement.title = '';
  }
}

async function handleLogin() {
  const email = document.querySelector('#loginForm input[type="email"]').value.trim();
  const password = document.querySelector('#loginForm input[type="password"]').value;
  const btn = document.querySelector('#loginForm .account-btn');
  const msgEl = document.getElementById('loginMsg');

  if (!email || !password) {
    showMsg(msgEl, 'Preencha todos os campos.', 'error');
    return;
  }

  btn.textContent = 'Entrando...';
  btn.disabled = true;

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  btn.textContent = 'Entrar';
  btn.disabled = false;

  if (error) {
    const messages = {
      'Invalid login credentials': 'E-mail ou senha incorretos.',
      'Email not confirmed': 'Confirme seu e-mail antes de entrar.'
    };

    showMsg(msgEl, messages[error.message] || error.message, 'error');
    return;
  }

  closeAccount();
  showToast('Login realizado com sucesso! ✓');
}

async function handleRegister() {
  const name = document.querySelector('#registerForm input[type="text"]').value.trim();
  const email = document.querySelector('#registerForm input[type="email"]').value.trim();
  const password = document.querySelector('#registerForm input[type="password"]').value;
  const btn = document.querySelector('#registerForm .account-btn');
  const msgEl = document.getElementById('registerMsg');

  if (!name || !email || !password) {
    showMsg(msgEl, 'Preencha todos os campos.', 'error');
    return;
  }

  if (password.length < 8) {
    showMsg(msgEl, 'Senha deve ter ao menos 8 caracteres.', 'error');
    return;
  }

  btn.textContent = 'Criando conta...';
  btn.disabled = true;

  const { error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name
      }
    }
  });

  btn.textContent = 'Criar conta';
  btn.disabled = false;

  if (error) {
    const messages = {
      'User already registered': 'Este e-mail já está cadastrado.'
    };

    showMsg(msgEl, messages[error.message] || error.message, 'error');
    return;
  }

  showMsg(msgEl, '✓ Conta criada! Verifique seu e-mail para confirmar.', 'success');

  setTimeout(() => {
    showLogin();
  }, 1500);
}

async function handleLogout() {
  await supabaseClient.auth.signOut();

  closeAccount();
  showToast('Você saiu da conta.');
}

// =====================
// REENVIAR CONFIRMAÇÃO
// =====================
function showResendConfirmation(email, msgEl) {
  const existingBtn = document.getElementById('resendBtn');
  if (existingBtn) existingBtn.remove();

  const btn = document.createElement('button');
  btn.id = 'resendBtn';
  btn.textContent = 'Reenviar e-mail de confirmação';

  btn.style.cssText = `
    width: 100%;
    margin-top: 8px;
    padding: 10px;
    background: transparent;
    border: 1px solid #1a1a1a;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
  `;

  btn.onclick = async () => {
    btn.textContent = 'Enviando...';
    btn.disabled = true;

    const { error } = await supabaseClient.auth.resend({
      type: 'signup',
      email,
    });

    if (error) {
      showMsg(msgEl, 'Erro ao reenviar: ' + error.message, 'error');
      btn.textContent = 'Reenviar e-mail de confirmação';
      btn.disabled = false;
      return;
    }

    showMsg(msgEl, '✓ E-mail reenviado! Verifique sua caixa de entrada.', 'success');
    btn.remove();
  };

  msgEl.insertAdjacentElement('afterend', btn);
}

// =====================
// MENSAGENS
// =====================
function showMsg(el, text, type) {
  if (!el) return;

  el.textContent = text;
  el.className = 'auth-msg ' + type;
  el.style.display = 'block';
}

function showToast(msg) {
  const toast = document.createElement('div');
  toast.textContent = msg;

  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    background: '#1a1a1a',
    color: 'white',
    padding: '12px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    zIndex: 9999,
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    transition: 'opacity 0.4s',
  });

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
  }, 2500);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// =====================
// BUSCA
// =====================
function openSearch() {
  document.getElementById('searchOverlay')?.classList.add('active');
  document.getElementById('searchModal')?.classList.add('open');

  const input = document.getElementById('searchInput');

  if (input) {
    input.value = '';
    setTimeout(() => input.focus(), 50);
  }
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
      ? found
        ? `Encontrados: ${found} produto(s).`
        : 'Nenhum produto encontrado.'
      : 'Dica: você pode digitar “vestido”, “jaqueta”, “tênis”...';
  }

  closeSearch();

  document.querySelector('#produtos')?.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
}

// =====================
// FILTROS
// =====================
const products = () => document.querySelectorAll('.product-card');

function showAllProducts() {
  products().forEach((p) => {
    p.style.display = '';
  });
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
// PRODUTOS SUPABASE
// =====================
async function loadProducts() {
  const { data, error } = await supabaseClient
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('id', { ascending: true });

  console.log(data);
  console.log(error);

  if (error) return;

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

// =====================
// CHECKOUT
// =====================
document.querySelector('.checkout-btn')?.addEventListener('click', async () => {
  const { data: { session } } = await supabaseClient.auth.getSession();

  if (!session) {
    toggleCart();

    setTimeout(() => {
      openAccount();
      showLogin();
      showMsg(document.getElementById('loginMsg'), '⚠ Faça login para finalizar sua compra.', 'error');
    }, 300);

    return;
  }

  if (cart.length === 0) {
    alert('Seu carrinho está vazio.');
    return;
  }

  alert('Redirecionando para o checkout...');
});

// =====================
// RECUPERAR SENHA
// =====================
async function requestPasswordReset() {
  const emailInput = document.querySelector('#loginForm input[type="email"]');
  const email = emailInput?.value.trim();
  const msgEl = document.getElementById('loginMsg');

  if (!email) {
    showMsg(msgEl, '⚠ Digite seu e-mail no campo acima primeiro.', 'error');
    emailInput?.focus();
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showMsg(msgEl, '⚠ Digite um e-mail válido.', 'error');
    return;
  }

  const linkEl = document.querySelector('.auth-link a');

  if (linkEl) {
    linkEl.textContent = 'Enviando...';
  }

  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password.html`,
  });

  if (linkEl) {
    linkEl.textContent = 'Esqueci minha senha';
  }

  if (error) {
    showMsg(msgEl, error.message, 'error');
    return;
  }

  showMsg(
    msgEl,
    '✓ Se este e-mail estiver cadastrado, você receberá o link em instantes. Verifique também o spam.',
    'success'
  );
}

// =====================
// TECLADO
// =====================
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.getElementById('cartSidebar')?.classList.remove('open');
    document.getElementById('overlay')?.classList.remove('active');

    closeSearch();
    closeAccount();
  }

  if (e.key === 'Enter' && document.activeElement?.id === 'searchInput') {
    e.preventDefault();
    applySearch();
  }
});

// =====================
// INICIAR
// =====================
loadProducts();