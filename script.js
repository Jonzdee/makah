// Makah Serenity Foods — shared site script
// Cart state persists across page navigation using window.name
// (localStorage/sessionStorage intentionally avoided; window.name survives same-tab
// navigation without touching browser storage APIs).

(function () {
    "use strict";

    /* ---------------- Product catalog ---------------- */
    const PRODUCTS = [
        {
            id: "ijebu-garri",
            name: "Ijebu Garri",
            category: "Flours & Swallow",
            price: 8500,
            unit: "2kg pack",
            blurb: "Sharp, fine-grained and sun-fermented the traditional way.",
            color: "husk",
        },
        {
            id: "lafun",
            name: "Lafun (Cassava Flour)",
            category: "Flours & Swallow",
            price: 7200,
            unit: "2kg pack",
            blurb: "Smooth-swelling cassava flour for a soft, stretchy swallow.",
            color: "gold-light",
        },
        {
            id: "ogbono",
            name: "Ground Ogbono",
            category: "Soup Thickeners",
            price: 11000,
            unit: "500g pack",
            blurb: "Finely milled for a proper draw, no grit left behind.",
            color: "green-soft",
        },
        {
            id: "palm-oil",
            name: "Pure Palm Oil",
            category: "Oils",
            price: 9500,
            unit: "1L bottle",
            blurb: "Cold-pressed, unrefined, and consistent bottle to bottle.",
            color: "orange",
        },
        {
            id: "yam-flour",
            name: "Elubo (Yam Flour)",
            category: "Flours & Swallow",
            price: 8000,
            unit: "2kg pack",
            blurb: "Bright, true yam flavor — no fillers, no shortcuts.",
            color: "gold-light",
        },
        {
            id: "egusi",
            name: "Shelled Egusi",
            category: "Soup Thickeners",
            price: 10500,
            unit: "500g pack",
            blurb: "Clean-shelled melon seed, ready to grind or blend.",
            color: "green-soft",
        },
    ];

    const COLOR_CLASSES = {
        husk: "from-husk to-gold-light",
        "gold-light": "from-gold-light to-gold",
        "green-soft": "from-green-soft to-green-mid/40",
        orange: "from-orange to-orange-deep",
    };

    /* ---------------- Cart persistence (window.name) ---------------- */
    const NAME_PREFIX = "MAKAH_CART::";

    function readCart() {
        try {
            if (window.name && window.name.startsWith(NAME_PREFIX)) {
                const json = window.name.slice(NAME_PREFIX.length);
                const parsed = JSON.parse(json);
                if (parsed && typeof parsed === "object") return parsed;
            }
        } catch (e) {
            /* fall through to empty cart */
        }
        return {};
    }

    function writeCart(cart) {
        window.name = NAME_PREFIX + JSON.stringify(cart);
    }

    let cart = readCart();

    function cartCount() {
        return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
    }

    function addToCart(id, qty) {
        qty = qty || 1;
        cart[id] = (cart[id] || 0) + qty;
        writeCart(cart);
        updateCartBadge();
    }

    function setQty(id, qty) {
        if (qty <= 0) {
            delete cart[id];
        } else {
            cart[id] = qty;
        }
        writeCart(cart);
        updateCartBadge();
    }

    function removeFromCart(id) {
        delete cart[id];
        writeCart(cart);
        updateCartBadge();
    }

    function updateCartBadge() {
        const badge = document.getElementById("cart-badge");
        if (badge) badge.textContent = String(cartCount());
    }

    function formatNaira(amount) {
        return "₦" + amount.toLocaleString("en-NG");
    }

    /* ---------------- Add-to-cart wiring (works on ANY page/markup) ----------------
       Any button anywhere in the document with data-add-to-cart="<product-id>"
       gets wired up automatically — whether it's part of a JS-rendered grid
       (home page) or static hand-written markup (shop page). This is the piece
       that was missing before: Shop.html's buttons weren't calling addToCart()
       at all, so nothing ever reached the shared cart state. */
    function showCartToast(id) {
        const toast = document.getElementById("cart-toast");
        if (!toast) return;
        const p = PRODUCTS.find((x) => x.id === id);
        toast.textContent = p ? `${p.name} added to cart` : "Added to cart";
        toast.classList.remove("hidden");
        toast.classList.add("show");
        clearTimeout(showCartToast._timer);
        showCartToast._timer = setTimeout(() => {
            toast.classList.remove("show");
            toast.classList.add("hidden");
        }, 1800);
    }

    function initAddToCartButtons() {
        document.querySelectorAll("[data-add-to-cart]").forEach((btn) => {
            if (btn.dataset.cartBound === "true") return; // don't double-bind on re-render
            btn.dataset.cartBound = "true";
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-add-to-cart");
                addToCart(id, 1);

                btn.classList.add("added");
                const original = btn.textContent;
                btn.textContent = "Added ✓";
                btn.disabled = true;
                setTimeout(() => {
                    btn.classList.remove("added");
                    btn.textContent = original;
                    btn.disabled = false;
                }, 900);

                showCartToast(id);
            });
        });
    }

    /* ---------------- Product grid (home page) ---------------- */
    function renderProductGrid() {
        const grid = document.getElementById("product-grid");
        if (!grid) return;

        grid.innerHTML = PRODUCTS.map((p) => `
      <div class="card-lift bg-cream rounded-2xl overflow-hidden border border-black/5">
        <div class="h-40 bg-gradient-to-br ${COLOR_CLASSES[p.color] || "from-husk to-gold-light"} flex items-center justify-center">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#1B5E20" stroke-width="1.5">
            <circle cx="12" cy="12" r="9" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          </svg>
        </div>
        <div class="p-6">
          <span class="text-orange font-display font-semibold text-[11px] uppercase tracking-wide">${p.category}</span>
          <h3 class="font-display font-700 text-lg text-ink mt-1">${p.name}</h3>
          <p class="text-ink/60 text-sm mt-2 leading-relaxed">${p.blurb}</p>
          <div class="flex items-center justify-between mt-5">
            <div>
              <span class="font-display font-800 text-green-deep text-lg">${formatNaira(p.price)}</span>
              <span class="text-ink/50 text-xs block">${p.unit}</span>
            </div>
            <button
              type="button"
              data-add-to-cart="${p.id}"
              class="bg-green-deep hover:bg-green-mid text-white font-display font-semibold text-sm px-4 py-2.5 rounded-full transition-colors focus-ring">
              Add to cart
            </button>
          </div>
        </div>
      </div>
    `).join("");

        initAddToCartButtons();
    }

    /* ---------------- Cart page ---------------- */
    function renderCartPage() {
        const root = document.getElementById("cart-page-root");
        if (!root) return;

        const emptyState = document.getElementById("cart-empty-state");
        const itemsWrap = document.getElementById("cart-items");
        const summaryWrap = document.getElementById("cart-summary");
        const entries = Object.entries(cart).filter(([, qty]) => qty > 0);

        if (entries.length === 0) {
            if (emptyState) emptyState.classList.remove("hidden");
            if (itemsWrap) itemsWrap.classList.add("hidden");
            if (summaryWrap) summaryWrap.classList.add("hidden");
            return;
        }

        if (emptyState) emptyState.classList.add("hidden");
        if (itemsWrap) itemsWrap.classList.remove("hidden");
        if (summaryWrap) summaryWrap.classList.remove("hidden");

        let subtotal = 0;

        itemsWrap.innerHTML = entries.map(([id, qty]) => {
            const p = PRODUCTS.find((x) => x.id === id);
            if (!p) return "";
            const lineTotal = p.price * qty;
            subtotal += lineTotal;
            return `
        <div class="cart-row flex items-center gap-4 sm:gap-6 py-5 border-b border-black/5" data-row="${id}">
          <div class="w-16 h-16 rounded-xl bg-gradient-to-br ${COLOR_CLASSES[p.color] || "from-husk to-gold-light"} flex items-center justify-center shrink-0">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1B5E20" stroke-width="1.5">
              <circle cx="12" cy="12" r="9" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-display font-700 text-ink text-base truncate">${p.name}</h3>
            <p class="text-ink/50 text-xs mt-0.5">${p.unit} · ${formatNaira(p.price)} each</p>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button type="button" data-decrement="${id}" aria-label="Decrease quantity"
              class="qty-btn w-8 h-8 rounded-full bg-husk hover:bg-gold-light text-green-deep font-display font-700 focus-ring">−</button>
            <span class="w-6 text-center font-display font-700 text-ink">${qty}</span>
            <button type="button" data-increment="${id}" aria-label="Increase quantity"
              class="qty-btn w-8 h-8 rounded-full bg-husk hover:bg-gold-light text-green-deep font-display font-700 focus-ring">+</button>
          </div>
          <div class="w-24 text-right shrink-0">
            <span class="font-display font-800 text-green-deep">${formatNaira(lineTotal)}</span>
          </div>
          <button type="button" data-remove="${id}" aria-label="Remove ${p.name}"
            class="shrink-0 p-2 rounded-full hover:bg-red-50 text-ink/40 hover:text-red-500 transition-colors focus-ring">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
            </svg>
          </button>
        </div>
      `;
        }).join("");

        const shipping = subtotal >= 30000 || subtotal === 0 ? 0 : 3500;
        const bulkDiscount = entries.length >= 3 ? Math.round(subtotal * 0.1) : 0;
        const total = subtotal - bulkDiscount + shipping;

        summaryWrap.innerHTML = `
      <div class="flex justify-between text-sm text-ink/70">
        <span>Subtotal</span><span>${formatNaira(subtotal)}</span>
      </div>
      ${bulkDiscount > 0 ? `
      <div class="flex justify-between text-sm text-orange-deep">
        <span>Bulk discount (10%)</span><span>−${formatNaira(bulkDiscount)}</span>
      </div>` : ""}
      <div class="flex justify-between text-sm text-ink/70">
        <span>Shipping</span><span>${shipping === 0 ? "Free" : formatNaira(shipping)}</span>
      </div>
      <div class="flex justify-between font-display font-800 text-lg text-green-deep pt-3 border-t border-black/10 mt-1">
        <span>Total</span><span>${formatNaira(total)}</span>
      </div>
      ${entries.length < 3 ? `<p class="text-xs text-ink/50 mt-2">Add ${3 - entries.length} more staple${3 - entries.length > 1 ? "s" : ""} to unlock 10% off.</p>` : ""}
    `;

        itemsWrap.querySelectorAll("[data-increment]").forEach((btn) => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-increment");
                setQty(id, (cart[id] || 0) + 1);
                renderCartPage();
            });
        });
        itemsWrap.querySelectorAll("[data-decrement]").forEach((btn) => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-decrement");
                setQty(id, (cart[id] || 0) - 1);
                renderCartPage();
            });
        });
        itemsWrap.querySelectorAll("[data-remove]").forEach((btn) => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-remove");
                const row = itemsWrap.querySelector(`[data-row="${id}"]`);
                if (row) row.classList.add("removing");
                setTimeout(() => {
                    removeFromCart(id);
                    renderCartPage();
                }, 180);
            });
        });
    }

    /* ---------------- Shared UI: nav + newsletter ----------------
       Consolidated into single listeners. Previously the mobile-menu
       button had a second, duplicate click handler defined further down
       this file, which toggled the menu open then immediately closed
       again on every click. */
    function initMobileMenu() {
        const btn = document.getElementById("menu-btn");
        const menu = document.getElementById("mobile-menu");
        if (!btn || !menu) return;
        btn.addEventListener("click", () => {
            const nowHidden = menu.classList.toggle("hidden");
            btn.setAttribute("aria-expanded", String(!nowHidden));
        });
    }

    function initNavScrollShadow() {
        const nav = document.getElementById("site-nav");
        if (!nav) return;
        window.addEventListener("scroll", () => {
            nav.classList.toggle("scrolled", window.scrollY > 8);
        }, { passive: true });
    }

    function initNewsletterForm() {
        const form = document.getElementById("newsletter-form");
        const msg = document.getElementById("newsletter-msg");
        if (!form) return;
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            msg.textContent = "Thanks! You're on the restock list.";
            form.reset();
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        initMobileMenu();
        initNavScrollShadow();
        initNewsletterForm();
        renderProductGrid();   // no-op on pages without #product-grid (e.g. Shop.html)
        initAddToCartButtons(); // wires up any static data-add-to-cart buttons (e.g. Shop.html)
        renderCartPage();
        updateCartBadge();
    });
})();


