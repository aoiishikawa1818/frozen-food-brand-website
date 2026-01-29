const DATA_PATH = './data/products.json';

const formatPrice = (price) => `¥${Number(price).toLocaleString('ja-JP')}`;

const renderProductCards = (container, products, options = {}) => {
  if (!container) return;
  if (!products.length) {
    container.innerHTML = '<p class="muted">該当する商品が見つかりませんでした。</p>';
    return;
  }

  const { showFeaturedBadge = false } = options;

  container.innerHTML = products
    .map(
      (product) => `
        <article class="product-card reveal">
          <img src="${product.image || 'assets/placeholder-product.svg'}" alt="${product.name}のイメージ" width="320" height="220" />
          <div>
            <div class="badge-group">
              <span class="badge">${product.category}</span>
              ${product.isFeatured ? '<span class="badge badge--featured">人気</span>' : ''}
            </div>
            <h3>${product.name}</h3>
          </div>
          <div class="product-meta">
            <span>価格: ${formatPrice(product.price)}</span>
            <span>調理: ${product.time}</span>
            <span>カロリー: ${product.kcal}kcal</span>
            <span>アレルゲン: ${product.allergens}</span>
          </div>
          <button class="button ghost" type="button">詳細を見る</button>
        </article>
      `
    )
    .join('');
};

const loadProducts = async () => {
  const response = await fetch(DATA_PATH);
  if (!response.ok) {
    throw new Error('Failed to load products');
  }
  return response.json();
};

const initHomePage = async () => {
  const container = document.getElementById('popular-products');
  if (!container) return;
  try {
    const products = await loadProducts();
    const featured = products.filter((product) => product.isFeatured);
    renderProductCards(container, featured.slice(0, 3));
  } catch (error) {
    container.innerHTML = '<p class="muted">人気商品を読み込めませんでした。</p>';
  }
};

const initProductsPage = async () => {
  const grid = document.getElementById('product-grid');
  const searchInput = document.getElementById('search');
  const categorySelect = document.getElementById('category');
  const resultCount = document.getElementById('result-count');
  if (!grid || !searchInput || !categorySelect || !resultCount) return;

  let products = [];

  const update = () => {
    const keyword = searchInput.value.trim().toLowerCase();
    const category = categorySelect.value;
    const filtered = products.filter((product) => {
      const matchesKeyword = product.name.toLowerCase().includes(keyword);
      const matchesCategory = category ? product.category === category : true;
      return matchesKeyword && matchesCategory;
    });
    renderProductCards(grid, filtered, { showFeaturedBadge: true });
    resultCount.textContent = `${filtered.length}件表示`;
  };

  try {
    products = await loadProducts();
    update();
  } catch (error) {
    grid.innerHTML = '<p class="muted">商品データを読み込めませんでした。</p>';
  }

  searchInput.addEventListener('input', update);
  categorySelect.addEventListener('change', update);
};

const initContactPage = () => {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if (!form || !status) return;

  const setError = (field, message) => {
    const error = form.querySelector(`[data-error-for="${field}"]`);
    if (error) {
      error.textContent = message;
    }
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    status.textContent = '';

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();
    const consent = form.consent.checked;

    setError('name', '');
    setError('email', '');
    setError('message', '');
    setError('consent', '');

    let hasError = false;

    if (!name) {
      setError('name', 'お名前を入力してください。');
      hasError = true;
    }

    if (!email) {
      setError('email', 'メールアドレスを入力してください。');
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('email', 'メールアドレスの形式をご確認ください。');
      hasError = true;
    }

    if (!message) {
      setError('message', 'お問い合わせ内容を入力してください。');
      hasError = true;
    }

    if (!consent) {
      setError('consent', '同意が必要です。');
      hasError = true;
    }

    if (hasError) {
      status.textContent = '入力内容をご確認ください。';
      return;
    }

    status.textContent = '送信しました。担当者よりご連絡します。';
    form.reset();
  });
};

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  if (page === 'home') {
    initHomePage();
  }
  if (page === 'products') {
    initProductsPage();
  }
  if (page === 'contact') {
    initContactPage();
  }
});
