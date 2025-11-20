(function () {
  const CART_KEY = 'rasi_cart';
  const WINDOW_CART_PREFIX = '__RASI_CART__=';
  const TOAST_DURATION = 1800;
  const PRODUCT_CATALOG = {
    ragi: {
      id: 'ragi',
      name: 'Ragi Flour',
      prices: {
        '250g': 149.0,
        '500g': 248.0,
        '1kg': 449.0
      },
      defaultPrice: 449.0,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCAXsimWTziVX9rjLwumg7Yqq_9OZTIzGBGOOWx_PXuwPEmudvbTTfNkp3lWK3F7RWyqswRxVHgn0qAw3iXK5icRKfFzWMtCceGauqLOpwkB7jhjbnpzLwOnWmjoMhf6XivQ86N4NXYGq4XluAQXU54lPuoh-hiR2o8xvVVxYIduCywTMG_Ko36j9n-S1kyanv6rFLs5NI0mdKV5u7dC8-_3G57rCkLeoxWfFuFoUGq37EWyahSxVJh7iJ5-n8YALi_wk0mya4DsnWv'
    },
    kambhu: {
      id: 'kambhu',
      name: 'Kambhu Flour',
      prices: {
        '250g': 149.0,
        '500g': 248.0,
        '1kg': 449.0
      },
      defaultPrice: 449.0,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCaxhUc72kYYSm-lQxPmh7mg5VVN56HkpG02Xt8YWNMyraQsYDk6wmA0qCyFlQWaky6jIDD5vkBNbhn0DfplUrSxECgpWdCeYJaWZIEW2oAiPm4a_1SuaOYGETQlWtD5n-QTTGzeSMUfVTboO9VPuTnWaUsPugtyS4RxU_AFZ-9v7xMCKq_4KA4QnEIYLXT8AgDfJtpCjZ9RnkIz2INgupIXXNDl7ODtXgz_i6BvnM117anfnGF-sm3DqVQPUmYdZoY8aHGdCYN-JGZ'
    },
    athirasam: {
      id: 'athirasam',
      name: 'Traditional Athirasam Flour Mix',
      prices: {
        '250g': 149.0,
        '500g': 248.0,
        '1kg': 449.0
      },
      defaultPrice: 449.0,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBcfZOYGsdZO6MqqZ2SKZXSPSXgXwsg_s2tBxQ20BuEacQ4iJPJ_7gMS0k4582lB9mkjbJLkfYkmthPfMaTcXCkmZklMR_XNxgmh09nooFw0CnZtTPQBj7euCY3ZkL71UiMTujl6WbFqegmEuda761x_lKIWZnTduHcQ3oDF79B58nWK8z-55NLmB5iYxqJIkGNwP8L9AEOL43L6T9_SmznpUyLGr5a5DRUjaixQbhhDq09Et4O4fq4iSN0wZLcgl6ZSMwaw7WxW_im'
    },
    'spice-blend': {
      id: 'spice-blend',
      name: 'Aromatic Spice Blend',
      prices: {
        '250g': 149.0,
        '500g': 248.0,
        '1kg': 449.0
      },
      defaultPrice: 449.0,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCVqqK1j2VQCAGMY4uMBgcktYglFoq3KMuhPbSqovwG0MpuE8g3MKZE-1jptNCb55QNfOW9BoRirax9zn7LTiY3szR4BlBZQizICbdPtCNQxC-KnUWwHrN3q0VV24efLI4BUvyg2NcI6CXanqCrkHgaE3sbFoPms2XA2uAEXk4GVHn5zVsT0ukqQxMRFRZqUbDJT7KiQjMkSh1bqBDf7GDUuJMw5T27w6dithhKMEQy_Dni8V59NMu95efsBhv8AyEoxPD9-M8AZ2zV'
    }
  };

  function safeJSONParse(text, fallback) {
    try {
      return JSON.parse(text);
    } catch (err) {
      console.warn('Failed to parse cart JSON', err);
      return fallback;
    }
  }

  function loadFromWindowName() {
    try {
      if (!window.name || !window.name.startsWith(WINDOW_CART_PREFIX)) return null;
      const payload = window.name.slice(WINDOW_CART_PREFIX.length);
      return safeJSONParse(payload, null);
    } catch {
      return null;
    }
  }

  function persistToWindowName(cart) {
    try {
      window.name = WINDOW_CART_PREFIX + JSON.stringify(cart);
    } catch (err) {
      console.warn('Failed to persist cart to window.name', err);
    }
  }

  function loadCart() {
    const raw = localStorage.getItem(CART_KEY);
    let parsed = safeJSONParse(raw, null);
    if (!Array.isArray(parsed)) {
      const fromName = loadFromWindowName();
      if (Array.isArray(fromName)) {
        parsed = fromName;
        try {
          localStorage.setItem(CART_KEY, JSON.stringify(parsed));
        } catch (_) {
          // ignore write issues (e.g., file:// origin)
        }
      }
    }
    if (!Array.isArray(parsed)) parsed = [];
    return parsed.map((item) => ({
      ...item,
      qty: Math.max(1, parseInt(item.qty || 1, 10) || 1)
    }));
  }

  function saveCart(cart) {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (err) {
      console.warn('Failed to persist cart to localStorage', err);
    }
    persistToWindowName(cart);
  }

  function getCartCount() {
    return loadCart().reduce((sum, item) => sum + (item.qty || 1), 0);
  }

  function updateCartBadge() {
    const count = getCartCount();
    const badges = document.querySelectorAll('[data-cart-count], #cart-count');
    badges.forEach((el) => {
      el.textContent = String(count);
      if ('hidden' in el) {
        el.hidden = count === 0;
      }
    });
  }

  let toastTimeout;
  function showToast(message) {
    if (!document.body) return;
    const existing = document.querySelector('.rasi-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className =
      'rasi-toast fixed bottom-6 right-6 z-50 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg';
    toast.textContent = message;
    document.body.appendChild(toast);
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.remove(), TOAST_DURATION);
  }

  function addToCart(productId, qty = 1, size = null) {
    const product = PRODUCT_CATALOG[productId];
    if (!product) {
      console.warn('Unknown product id:', productId);
      return false;
    }
    const cart = loadCart();
    const cartId = size ? `${productId}-${size}` : productId;
    const existing = cart.find((item) => item.cartId === cartId);
    const price = (size && product.prices && product.prices[size]) || product.defaultPrice || product.price;

    if (existing) {
      existing.qty = (existing.qty || 1) + qty;
    } else {
      cart.push({
        cartId,
        id: product.id,
        name: size ? `${product.name} (${size})` : product.name,
        price: price,
        qty,
        size,
        image: product.image
      });
    }
    saveCart(cart);
    updateCartBadge();
    showToast('Added to cart');
    return true;
  }

  function resolveQty(btn) {
    const explicitQty = parseInt(btn.dataset.qty || '1', 10);
    if (explicitQty > 0) return explicitQty;
    const selector = btn.dataset.qtyInput;
    if (selector) {
      const input = document.querySelector(selector);
      if (input) {
        const fromInput = parseInt(input.value, 10);
        if (fromInput > 0) return fromInput;
      }
    }
    return 1;
  }

  function resolveSize() {
    const sizeInput = document.getElementById('product-size');
    return sizeInput ? sizeInput.value : null;
  }

  function bindAddButtons(root = document) {
    root.querySelectorAll('[data-add]').forEach((btn) => {
      if (btn.dataset.cartBound === 'true') return;
      btn.dataset.cartBound = 'true';
      btn.addEventListener('click', (event) => {
        const id = btn.dataset.add;
        if (!id) return;
        if (btn.tagName === 'A') event.preventDefault();
        const qty = resolveQty(btn);
        const size = resolveSize();
        const success = addToCart(id, qty, size);
        if (!success) return;
        const toastMsg = btn.dataset.toast;
        if (toastMsg) showToast(toastMsg);
        const redirect = btn.dataset.redirect;
        if (redirect) {
          setTimeout(() => {
            window.location.href = redirect;
          }, 200);
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    bindAddButtons();
  });

  window.RasiCart = {
    add: addToCart,
    load: loadCart,
    save: saveCart,
    updateBadge: updateCartBadge,
    toast: showToast,
    products: PRODUCT_CATALOG,
    bindAddButtons
  };
})();

