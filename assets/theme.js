/* ==========================================================================
   YOU theme — behaviour
   Cart drawer (Section Rendering API), header drawers, hero carousel,
   product gallery + variant picker, sticky ATC, collection filters.
   ========================================================================== */
(function () {
  'use strict';

  /* Helpers ---------------------------------------------------------------- */
  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* Cart drawer -------------------------------------------------------------- */
  var CartDrawer = {
    open: function () {
      var drawer = qs('.cart-drawer');
      var scrim = qs('[data-scrim="cart"]');
      if (!drawer) return;
      drawer.classList.add('is-open');
      if (scrim) scrim.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      var close = qs('.cart-drawer__close', drawer);
      if (close) close.focus();
    },
    close: function () {
      var drawer = qs('.cart-drawer');
      var scrim = qs('[data-scrim="cart"]');
      if (drawer) drawer.classList.remove('is-open');
      if (scrim) scrim.classList.remove('is-open');
      document.body.style.overflow = '';
    },
    isOpen: function () {
      var drawer = qs('.cart-drawer');
      return drawer && drawer.classList.contains('is-open');
    },
    refresh: function (openAfter) {
      return fetch(window.routes.root_url + '?sections=cart-drawer')
        .then(function (r) { return r.json(); })
        .then(function (data) {
          CartDrawer.renderSection(data['cart-drawer']);
          if (openAfter) CartDrawer.open();
        });
    },
    renderSection: function (html) {
      if (!html) return;
      var wrapper = qs('#shopify-section-cart-drawer');
      if (!wrapper) return;
      var doc = new DOMParser().parseFromString(html, 'text/html');
      var fresh = doc.querySelector('.cart-drawer-section');
      var current = qs('.cart-drawer-section', wrapper);
      var wasOpen = CartDrawer.isOpen();
      if (fresh && current) {
        current.replaceWith(fresh);
        if (wasOpen) {
          qs('.cart-drawer', wrapper).classList.add('is-open');
        }
        CartDrawer.updateBubbles(fresh.getAttribute('data-cart-count'));
        CartDrawer.bind(wrapper);
      }
    },
    updateBubbles: function (count) {
      qsa('[data-cart-bubble]').forEach(function (b) {
        b.textContent = count;
        b.setAttribute('data-count', count);
      });
    },
    bind: function (ctx) {
      qsa('[data-cart-drawer-close]', ctx).forEach(function (el) {
        el.addEventListener('click', CartDrawer.close);
      });
      qsa('[data-cart-remove]', ctx).forEach(function (el) {
        el.addEventListener('click', function (e) {
          e.preventDefault();
          CartDrawer.changeLine(el.getAttribute('data-cart-remove'), 0);
        });
      });
      qsa('[data-cart-qty]', ctx).forEach(function (el) {
        el.addEventListener('click', function () {
          CartDrawer.changeLine(el.getAttribute('data-line'), parseInt(el.getAttribute('data-cart-qty'), 10));
        });
      });
    },
    changeLine: function (line, quantity) {
      fetch(window.routes.cart_change_url + '.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ line: parseInt(line, 10), quantity: quantity })
      })
        .then(function (r) { return r.json(); })
        .then(function () { CartDrawer.refresh(false); })
        .catch(function () { window.location.reload(); });
    }
  };

  /* Product forms (AJAX add to cart) ----------------------------------------- */
  function bindProductForms() {
    qsa('form[data-product-form]').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        if (document.body.getAttribute('data-cart-type') === 'page') return;
        e.preventDefault();
        var submit = qs('[type="submit"]', form);
        if (submit) submit.setAttribute('disabled', 'disabled');
        var data = new FormData(form);
        fetch(window.routes.cart_add_url + '.js', { method: 'POST', body: data })
          .then(function (r) { return r.json(); })
          .then(function (item) {
            if (item.status && item.status !== 200) throw new Error(item.description || window.themeStrings.cartError);
            return CartDrawer.refresh(true);
          })
          .catch(function (err) {
            var status = qs('[data-form-status]', form);
            if (status) {
              status.textContent = err.message || window.themeStrings.cartError;
              status.hidden = false;
            }
          })
          .then(function () {
            if (submit) submit.removeAttribute('disabled');
          });
      });
    });
  }

  /* Header: menu drawer + search toggle --------------------------------------- */
  function bindHeader() {
    var menuToggle = qs('[data-menu-toggle]');
    var menuDrawer = qs('.menu-drawer');
    var menuScrim = qs('[data-scrim="menu"]');
    if (menuToggle && menuDrawer) {
      var closeMenu = function () {
        menuDrawer.classList.remove('is-open');
        if (menuScrim) menuScrim.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      };
      menuToggle.addEventListener('click', function () {
        menuDrawer.classList.add('is-open');
        if (menuScrim) menuScrim.classList.add('is-open');
        menuToggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
      });
      qsa('[data-menu-close]').forEach(function (el) { el.addEventListener('click', closeMenu); });
    }

    var searchToggle = qs('[data-search-toggle]');
    var searchBar = qs('.header-search');
    if (searchToggle && searchBar) {
      searchToggle.addEventListener('click', function () {
        var open = searchBar.classList.toggle('is-open');
        searchToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (open) {
          var input = qs('input[type="search"]', searchBar);
          if (input) input.focus();
        }
      });
    }

    qsa('[data-cart-drawer-open]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        if (document.body.getAttribute('data-cart-type') === 'page') return;
        e.preventDefault();
        CartDrawer.open();
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        CartDrawer.close();
        qsa('.menu-drawer.is-open, .header-search.is-open').forEach(function (el) { el.classList.remove('is-open'); });
        qsa('.scrim.is-open').forEach(function (el) { el.classList.remove('is-open'); });
        document.body.style.overflow = '';
      }
    });
  }

  /* Hero carousel -------------------------------------------------------------- */
  function bindHeroCarousels() {
    qsa('[data-hero-carousel]').forEach(function (hero) {
      var slides = qsa('[data-hero-slide]', hero);
      var dots = qsa('[data-hero-dot]', hero);
      if (slides.length < 2) return;
      var index = 0;
      var autoplay = hero.getAttribute('data-autoplay') === 'true';
      var interval = parseInt(hero.getAttribute('data-autoplay-speed'), 10) * 1000 || 5000;
      var timer = null;

      function show(i) {
        index = (i + slides.length) % slides.length;
        slides.forEach(function (s, si) {
          s.classList.toggle('is-active', si === index);
          s.setAttribute('aria-hidden', si === index ? 'false' : 'true');
        });
        dots.forEach(function (d, di) {
          d.classList.toggle('is-active', di === index);
        });
      }
      function start() {
        if (!autoplay || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        stop();
        timer = setInterval(function () { show(index + 1); }, interval);
      }
      function stop() { if (timer) clearInterval(timer); }

      dots.forEach(function (d, di) {
        d.addEventListener('click', function () { show(di); start(); });
      });
      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
      show(0);
      start();
    });
  }

  /* Product gallery -------------------------------------------------------------- */
  function bindProductGalleries() {
    qsa('[data-product-gallery]').forEach(function (gallery) {
      var mainImg = qs('[data-gallery-main]', gallery);
      var thumbs = qsa('[data-gallery-thumb]', gallery);
      if (!mainImg || !thumbs.length) return;
      var index = 0;

      function show(i) {
        index = (i + thumbs.length) % thumbs.length;
        var thumb = thumbs[index];
        var img = qs('img', thumb);
        if (img) {
          mainImg.src = thumb.getAttribute('data-full-src');
          mainImg.srcset = thumb.getAttribute('data-full-srcset') || '';
          mainImg.alt = img.alt;
        }
        thumbs.forEach(function (t, ti) { t.classList.toggle('is-active', ti === index); });
      }

      thumbs.forEach(function (t, ti) {
        t.addEventListener('click', function () { show(ti); });
      });
      var prev = qs('[data-gallery-prev]', gallery);
      var next = qs('[data-gallery-next]', gallery);
      if (prev) prev.addEventListener('click', function () { show(index - 1); });
      if (next) next.addEventListener('click', function () { show(index + 1); });

      gallery.showMediaById = function (mediaId) {
        var ti = thumbs.findIndex(function (t) { return t.getAttribute('data-media-id') === String(mediaId); });
        if (ti >= 0) show(ti);
      };
    });
  }

  /* Variant picker -------------------------------------------------------------- */
  function bindVariantPickers() {
    qsa('[data-variant-picker]').forEach(function (picker) {
      var section = picker.closest('.shopify-section') || document;
      var jsonEl = qs('[data-variant-json]', section);
      var form = qs('form[data-product-form]', section);
      if (!jsonEl || !form) return;
      var variants = JSON.parse(jsonEl.textContent);
      var idInput = qs('input[name="id"]', form);

      function currentOptions() {
        return qsa('fieldset', picker).map(function (fs) {
          var checked = qs('input:checked', fs);
          return checked ? checked.value : null;
        });
      }

      function onChange() {
        var opts = currentOptions();
        var match = variants.find(function (v) {
          return v.options.every(function (o, i) { return o === opts[i]; });
        });
        var submit = qs('[type="submit"]', form);
        var priceEl = qs('[data-product-price]', section);
        var stickyPrice = qs('[data-sticky-price]', section);

        qsa('[data-option-selected]', picker).forEach(function (label) {
          var fs = label.closest('fieldset') || picker;
          var checked = qs('input:checked', fs);
          if (checked) label.textContent = checked.value;
        });

        if (!match) {
          if (submit) { submit.setAttribute('disabled', 'disabled'); submit.textContent = window.themeStrings.unavailable; }
          return;
        }
        if (idInput) idInput.value = match.id;
        if (submit) {
          if (match.available) {
            submit.removeAttribute('disabled');
            submit.textContent = window.themeStrings.addToCart;
          } else {
            submit.setAttribute('disabled', 'disabled');
            submit.textContent = window.themeStrings.soldOut;
          }
        }
        if (priceEl && match.price_formatted) {
          priceEl.innerHTML = match.price_formatted;
          if (stickyPrice) stickyPrice.innerHTML = match.price_formatted;
        }
        if (match.featured_media_id) {
          var gallery = qs('[data-product-gallery]', section);
          if (gallery && gallery.showMediaById) gallery.showMediaById(match.featured_media_id);
        }
        if (window.history.replaceState) {
          var url = new URL(window.location.href);
          url.searchParams.set('variant', match.id);
          window.history.replaceState({}, '', url.toString());
        }
      }

      picker.addEventListener('change', onChange);
    });
  }

  /* Quantity steppers ------------------------------------------------------------ */
  function bindQtySteppers() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-qty-change]');
      if (!btn) return;
      var wrap = btn.closest('.qty');
      var input = qs('.qty__input', wrap);
      if (!input) return;
      var step = parseInt(btn.getAttribute('data-qty-change'), 10);
      var next = Math.max(parseInt(input.min || '1', 10), (parseInt(input.value, 10) || 1) + step);
      input.value = next;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  /* Sticky add-to-cart bar --------------------------------------------------------- */
  function bindStickyAtc() {
    var bar = qs('[data-sticky-atc]');
    var anchor = qs('[data-product-info]');
    if (!bar || !anchor) return;
    var onScroll = function () {
      var rect = anchor.getBoundingClientRect();
      bar.classList.toggle('is-visible', rect.bottom < 80);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* Collection: auto-submit filters + grid toggle ------------------------------------ */
  function bindCollectionControls() {
    var form = qs('[data-filter-form]');
    if (form) {
      qsa('input[type="checkbox"], select', form).forEach(function (el) {
        el.addEventListener('change', function () { form.submit(); });
      });
    }
    var grid = qs('[data-collection-grid]');
    qsa('[data-grid-columns]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var cols = btn.getAttribute('data-grid-columns');
        if (grid) grid.style.setProperty('--collection-columns', cols);
        qsa('[data-grid-columns]').forEach(function (b) { b.classList.toggle('is-active', b === btn); });
        try { localStorage.setItem('you:grid-columns', cols); } catch (err) { /* private mode */ }
      });
    });
    if (grid) {
      try {
        var saved = localStorage.getItem('you:grid-columns');
        if (saved) {
          grid.style.setProperty('--collection-columns', saved);
          qsa('[data-grid-columns]').forEach(function (b) {
            b.classList.toggle('is-active', b.getAttribute('data-grid-columns') === saved);
          });
        }
      } catch (err) { /* private mode */ }
    }
  }

  /* Product recommendations ------------------------------------------------------------ */
  function loadRecommendations() {
    qsa('[data-recommendations]').forEach(function (el) {
      var url = el.getAttribute('data-url');
      if (!url) return;
      fetch(url)
        .then(function (r) { return r.text(); })
        .then(function (text) {
          var doc = new DOMParser().parseFromString(text, 'text/html');
          var fresh = doc.querySelector('[data-recommendations]');
          if (fresh && fresh.innerHTML.trim().length) el.innerHTML = fresh.innerHTML;
        })
        .catch(function () { /* leave empty */ });
    });
  }

  /* Init ------------------------------------------------------------------------------- */
  function init() {
    CartDrawer.bind(document);
    bindProductForms();
    bindHeader();
    bindHeroCarousels();
    bindProductGalleries();
    bindVariantPickers();
    bindQtySteppers();
    bindStickyAtc();
    bindCollectionControls();
    loadRecommendations();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-bind inside the Theme Editor when sections are re-rendered.
  document.addEventListener('shopify:section:load', function () {
    init();
  });

  window.YOUCartDrawer = CartDrawer;
})();
