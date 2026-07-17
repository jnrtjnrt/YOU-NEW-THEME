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

  /* Money formatting, mirroring Shopify's shop.money_format placeholders ------------- */
  function formatMoney(cents) {
    var format = window.themeMoneyFormat || '${{amount}}';
    var value = (cents / 100);
    function withDelimiters(num, decimals, thousands, decimalSep) {
      var fixed = num.toFixed(decimals);
      var parts = fixed.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousands);
      return parts.join(decimalSep);
    }
    var replacements = {
      amount: withDelimiters(value, 2, ',', '.'),
      amount_no_decimals: withDelimiters(value, 0, ',', '.'),
      amount_with_comma_separator: withDelimiters(value, 2, '.', ','),
      amount_no_decimals_with_comma_separator: withDelimiters(value, 0, '.', ','),
      amount_with_space_separator: withDelimiters(value, 2, ' ', ','),
      amount_no_decimals_with_space_separator: withDelimiters(value, 0, ' ', '')
    };
    return format.replace(/\{\{\s*(\w+)\s*\}\}/g, function (m, key) {
      return replacements[key] !== undefined ? replacements[key] : m;
    });
  }

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
            document.dispatchEvent(new CustomEvent('you:cart:added', { detail: { item: item } }));
            var claimed = document.dispatchEvent(new CustomEvent('you:cart:added:claimable', { detail: { item: item }, cancelable: true }));
            return CartDrawer.refresh(claimed);
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
        qsa('.menu-drawer.is-open, .header-search.is-open, [data-cross-sell-modal].is-open').forEach(function (el) { el.classList.remove('is-open'); });
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

      function visibleIndexes() {
        var out = [];
        thumbs.forEach(function (t, ti) { if (!t.hidden) out.push(ti); });
        return out.length ? out : thumbs.map(function (_, ti) { return ti; });
      }

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

      function step(direction) {
        var visible = visibleIndexes();
        var pos = visible.indexOf(index);
        if (pos < 0) pos = 0;
        show(visible[(pos + direction + visible.length) % visible.length]);
      }

      thumbs.forEach(function (t, ti) {
        t.addEventListener('click', function () { show(ti); });
      });
      var prev = qs('[data-gallery-prev]', gallery);
      var next = qs('[data-gallery-next]', gallery);
      if (prev) prev.addEventListener('click', function () { step(-1); });
      if (next) next.addEventListener('click', function () { step(1); });

      gallery.showMediaById = function (mediaId) {
        var ti = thumbs.findIndex(function (t) { return t.getAttribute('data-media-id') === String(mediaId); });
        if (ti >= 0) show(ti);
      };

      // Filter the gallery to the selected color's media, matching image alt
      // text against the color option value. Media whose alt mentions no color
      // at all is treated as shared and stays visible for every variant.
      gallery.filterByColor = function (selectedValue, allValues) {
        if (!gallery.hasAttribute('data-group-by-color') || !selectedValue) return;
        var selected = selectedValue.toLowerCase();
        var others = (allValues || [])
          .map(function (v) { return v.toLowerCase(); })
          .filter(function (v) { return v !== selected; });

        var anyColorMentioned = thumbs.some(function (t) {
          var alt = (t.getAttribute('data-media-alt') || '').toLowerCase();
          if (alt.indexOf(selected) !== -1) return true;
          return others.some(function (v) { return alt.indexOf(v) !== -1; });
        });
        if (!anyColorMentioned) {
          thumbs.forEach(function (t) { t.hidden = false; });
          return;
        }

        thumbs.forEach(function (t) {
          var alt = (t.getAttribute('data-media-alt') || '').toLowerCase();
          var mentionsSelected = alt.indexOf(selected) !== -1;
          var mentionsOther = others.some(function (v) { return alt.indexOf(v) !== -1; });
          t.hidden = !mentionsSelected && mentionsOther;
        });

        if (thumbs[index] && thumbs[index].hidden) {
          show(visibleIndexes()[0]);
        }
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

      function applyMediaFilter() {
        var colorFs = qs('fieldset[data-option-is-color]', picker);
        if (!colorFs) return;
        var checked = qs('input:checked', colorFs);
        var allValues = qsa('input', colorFs).map(function (i) { return i.value; });
        var gallery = qs('[data-product-gallery]', section);
        if (gallery && gallery.filterByColor && checked) {
          gallery.filterByColor(checked.value, allValues);
        }
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
        applyMediaFilter();
        if (match.featured_media_id) {
          var gallery = qs('[data-product-gallery]', section);
          if (gallery && gallery.showMediaById) gallery.showMediaById(match.featured_media_id);
        }
        if (window.history.replaceState) {
          var url = new URL(window.location.href);
          url.searchParams.set('variant', match.id);
          window.history.replaceState({}, '', url.toString());
        }
        document.dispatchEvent(new CustomEvent('you:variant:change', {
          detail: { variant: match, productId: form.closest('[data-product-id]') ? form.closest('[data-product-id]').getAttribute('data-product-id') : null }
        }));
      }

      picker.addEventListener('change', onChange);
      applyMediaFilter();
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
    if (!bar) return;
    var anchor = qs(bar.getAttribute('data-watch') || '[data-product-info]');
    var offset = parseInt(bar.getAttribute('data-reveal-offset'), 10) || 80;

    if (anchor) {
      var onScroll = function () {
        var rect = anchor.getBoundingClientRect();
        bar.classList.toggle('is-visible', rect.bottom < offset);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    var addBtn = qs('[data-sticky-add]', bar);
    if (addBtn) {
      addBtn.addEventListener('click', function () {
        var realSubmit = qs('form[data-product-form] [name="add"]');
        if (realSubmit) realSubmit.click();
      });
    }

    document.addEventListener('you:variant:change', function (e) {
      var variant = e.detail && e.detail.variant;
      if (!variant) return;
      var priceEl = qs('[data-sticky-price]', bar);
      if (priceEl && variant.price_formatted) priceEl.innerHTML = variant.price_formatted;
      var imgEl = qs('[data-sticky-image]', bar);
      if (imgEl && variant.featured_media_url) imgEl.src = variant.featured_media_url;
      if (addBtn) {
        var label = qs('[data-sticky-add-label]', addBtn);
        if (variant.available) {
          addBtn.removeAttribute('disabled');
          if (label) label.textContent = window.themeStrings.addToCart;
        } else {
          addBtn.setAttribute('disabled', 'disabled');
          if (label) label.textContent = window.themeStrings.soldOut;
        }
      }
    });
  }

  /* Quick-add cards (cross-sell modal / grid / recently viewed) ---------------------- */
  function findQuickAddVariant(card, colorValue) {
    var jsonEl = qs('[data-quick-add-variants]', card);
    if (!jsonEl) return null;
    var variants;
    try { variants = JSON.parse(jsonEl.textContent); } catch (err) { return null; }
    var swatches = qs('[data-quick-add-swatches]', card);
    var position = swatches ? parseInt(swatches.getAttribute('data-option-position'), 10) - 1 : -1;
    if (position < 0) return variants[0] || null;
    var matches = variants.filter(function (v) { return v.options[position] === colorValue; });
    var available = matches.filter(function (v) { return v.available; });
    return available[0] || matches[0] || null;
  }

  function bindQuickAddCards() {
    if (bindQuickAddCards._bound) return;
    bindQuickAddCards._bound = true;
    document.addEventListener('click', function (e) {
      var swatch = e.target.closest('[data-quick-add-swatches] .quick-add-card__swatch');
      if (swatch) {
        var card = swatch.closest('[data-quick-add-card]');
        var swatchesWrap = swatch.closest('[data-quick-add-swatches]');
        qsa('.quick-add-card__swatch', swatchesWrap).forEach(function (s) {
          s.classList.toggle('is-active', s === swatch);
          s.setAttribute('aria-pressed', s === swatch ? 'true' : 'false');
        });
        var variant = findQuickAddVariant(card, swatch.getAttribute('data-swatch-value'));
        var button = qs('[data-quick-add-button]', card);
        var priceEl = qs('[data-quick-add-price]', card);
        if (variant && button) {
          button.setAttribute('data-variant-id', variant.id);
          var label = qs('[data-quick-add-label]', button);
          if (variant.available) {
            button.removeAttribute('disabled');
            if (label && label.getAttribute('data-original-label')) label.textContent = label.getAttribute('data-original-label');
          } else {
            button.setAttribute('disabled', 'disabled');
            if (label) {
              if (!label.getAttribute('data-original-label')) label.setAttribute('data-original-label', label.textContent);
              label.textContent = window.themeStrings.soldOut;
            }
          }
          if (priceEl && variant.price_formatted) priceEl.innerHTML = variant.price_formatted;
        }
        return;
      }

      var addBtn = e.target.closest('[data-quick-add-button]');
      if (addBtn) {
        if (addBtn.hasAttribute('disabled')) return;
        var variantId = addBtn.getAttribute('data-variant-id');
        if (!variantId) return;
        addBtn.setAttribute('disabled', 'disabled');
        fetch(window.routes.cart_add_url + '.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: variantId, quantity: 1 })
        })
          .then(function (r) { return r.json(); })
          .then(function (item) {
            if (item.status && item.status !== 200) throw new Error(item.description || window.themeStrings.cartError);
            document.dispatchEvent(new CustomEvent('you:cart:added', { detail: { item: item } }));
            var modal = addBtn.closest('[data-cross-sell-modal]');
            if (modal) {
              document.body.style.overflow = '';
              modal.classList.remove('is-open');
              modal.setAttribute('aria-hidden', 'true');
            }
            // Quick add is intentionally silent — it only refreshes the cart count,
            // it doesn't pop the drawer open (matches the source designs).
            return CartDrawer.refresh(false);
          })
          .catch(function () { /* silent: card stays interactive, drawer just won't update */ })
          .then(function () { addBtn.removeAttribute('disabled'); });
      }
    });
  }

  /* Cross-sell modal (e.g. "complete the look" after add to cart) -------------------- */
  function bindCrossSellModal() {
    var modal = qs('[data-cross-sell-modal]');
    if (!modal) return;
    var scroller = qs('[data-cross-sell-scroll]', modal);

    function open() {
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    qsa('[data-cross-sell-close]', modal).forEach(function (el) {
      el.addEventListener('click', close);
    });
    var prev = qs('[data-cross-sell-prev]', modal);
    var next = qs('[data-cross-sell-next]', modal);
    if (prev && scroller) prev.addEventListener('click', function () { scroller.scrollBy({ left: -420, behavior: 'smooth' }); });
    if (next && scroller) next.addEventListener('click', function () { scroller.scrollBy({ left: 420, behavior: 'smooth' }); });

    if (modal.getAttribute('data-auto-open') === 'true') {
      // Only the main product form's submit dispatches this (quick-add buttons inside
      // the modal itself use a plain fetch and never fire it), so there's no risk of
      // the modal re-claiming its own quick-add clicks.
      document.addEventListener('you:cart:added:claimable', function (e) {
        e.preventDefault();
        open();
      });
    }
  }

  /* Recently viewed (localStorage, no app required) ----------------------------------- */
  function bindRecentlyViewed() {
    var STORAGE_KEY = 'you:recently-viewed';
    var section = qs('[data-recently-viewed]');

    function readHandles() {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch (err) { return []; }
    }
    function writeHandles(handles) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(handles.slice(0, 20))); } catch (err) { /* private mode */ }
    }

    var currentHandle = section ? section.getAttribute('data-current-handle') : null;
    if (currentHandle) {
      var handles = readHandles().filter(function (h) { return h !== currentHandle; });
      handles.unshift(currentHandle);
      writeHandles(handles);
    }

    if (!section) return;
    var row = qs('[data-recently-viewed-row]', section);
    var max = parseInt(section.getAttribute('data-max-items'), 10) || 4;
    var toShow = readHandles().filter(function (h) { return h !== currentHandle; }).slice(0, max);
    if (!toShow.length) return;

    Promise.all(toShow.map(function (handle) {
      return fetch('/products/' + handle + '.js').then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
    })).then(function (products) {
      products.filter(Boolean).forEach(function (product) {
        var variant = product.variants[0];
        if (!variant) return;
        var card = document.createElement('div');
        card.className = 'quick-add-card';
        card.innerHTML =
          '<a href="' + product.url + '" class="quick-add-card__media">' +
            (product.featured_image ? '<img src="' + product.featured_image.replace(/(\.[a-z]+)(\?|$)/i, '_400x$1$2') + '" alt="" loading="lazy">' : '') +
          '</a>' +
          '<div class="quick-add-card__info">' +
            '<a href="' + product.url + '" class="quick-add-card__title">' + product.title + '</a>' +
            '<div class="quick-add-card__price">' + formatMoney(variant.price) + '</div>' +
          '</div>' +
          '<button type="button" class="button button--md quick-add-card__button" data-quick-add-button data-variant-id="' + variant.id + '"' + (variant.available ? '' : ' disabled') + '>' +
            '<span data-quick-add-label>' + (variant.available ? window.themeStrings.addToCart : window.themeStrings.soldOut) + '</span>' +
          '</button>';
        row.appendChild(card);
      });
      if (row.children.length) section.hidden = false;
    });
  }

  /* Style Lab: bag + strap set builder ------------------------------------------------ */
  function bindStyleLab() {
    var builder = qs('[data-style-lab-builder]');
    if (!builder) return;

    var pickers = {};

    function variantFor(product, colorIdx) {
      if (!product.variants.length) return null;
      if (!product.colors.length || product.colorPosition < 1) return product.variants[0];
      var value = product.colors[colorIdx] ? product.colors[colorIdx].value : null;
      var pos = product.colorPosition - 1;
      var matches = product.variants.filter(function (v) { return v.options[pos] === value; });
      var available = matches.filter(function (v) { return v.available; });
      return available[0] || matches[0] || product.variants[0];
    }

    qsa('[data-style-lab-picker]', builder).forEach(function (el) {
      var jsonEl = qs('[data-style-lab-data]', el);
      var products;
      try { products = JSON.parse(jsonEl.textContent); } catch (err) { products = []; }
      if (!products.length) return;

      var state = { index: 0, colorIdx: 0, products: products, el: el };
      pickers[el.getAttribute('data-style-lab-picker')] = state;
      el.hidden = false;

      function render() {
        var product = state.products[state.index];
        var variant = variantFor(product, state.colorIdx);
        var img = qs('[data-style-lab-image]', el);
        if (img) {
          if (product.image) { img.src = product.image; img.alt = product.title; }
          else { img.removeAttribute('src'); }
        }
        var nameEl = qs('[data-style-lab-name]', el);
        if (nameEl) nameEl.textContent = product.title;
        var priceEl = qs('[data-style-lab-price]', el);
        if (priceEl && variant) priceEl.textContent = variant.price_formatted;

        var swatches = qs('[data-style-lab-swatches]', el);
        if (swatches) {
          swatches.innerHTML = '';
          product.colors.forEach(function (c, ci) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'style-lab-swatch' + (ci === state.colorIdx ? ' is-active' : '');
            btn.style.background = c.hex;
            btn.setAttribute('aria-label', c.value);
            btn.setAttribute('aria-pressed', ci === state.colorIdx ? 'true' : 'false');
            btn.addEventListener('click', function () {
              state.colorIdx = ci;
              render();
              renderSummary();
            });
            swatches.appendChild(btn);
          });
        }
      }

      var prev = qs('[data-style-lab-prev]', el);
      var next = qs('[data-style-lab-next]', el);
      if (prev) prev.addEventListener('click', function () {
        state.index = (state.index - 1 + state.products.length) % state.products.length;
        state.colorIdx = 0;
        render();
        renderSummary();
      });
      if (next) next.addEventListener('click', function () {
        state.index = (state.index + 1) % state.products.length;
        state.colorIdx = 0;
        render();
        renderSummary();
      });

      state.render = render;
      render();
    });

    var summary = qs('[data-style-lab-summary]');
    function renderSummary() {
      if (!summary || !pickers.bag || !pickers.strap) return;
      var bag = pickers.bag.products[pickers.bag.index];
      var strap = pickers.strap.products[pickers.strap.index];
      var bagVariant = variantFor(bag, pickers.bag.colorIdx);
      var strapVariant = variantFor(strap, pickers.strap.colorIdx);
      var bagImg = qs('[data-style-lab-summary-image="bag"]', summary);
      var strapImg = qs('[data-style-lab-summary-image="strap"]', summary);
      if (bagImg && bag.image) { bagImg.src = bag.image; bagImg.alt = bag.title; }
      if (strapImg && strap.image) { strapImg.src = strap.image; strapImg.alt = strap.title; }
      var nameEl = qs('[data-style-lab-summary-name]', summary);
      if (nameEl) nameEl.textContent = bag.title + ' + ' + strap.title;
      var totalEl = qs('[data-style-lab-summary-total]', summary);
      if (totalEl && bagVariant && strapVariant) totalEl.textContent = formatMoney(bagVariant.price + strapVariant.price);
      summary.hidden = false;
    }
    renderSummary();

    var addSet = qs('[data-style-lab-add-set]');
    if (addSet) {
      addSet.addEventListener('click', function () {
        if (!pickers.bag || !pickers.strap) return;
        var bagVariant = variantFor(pickers.bag.products[pickers.bag.index], pickers.bag.colorIdx);
        var strapVariant = variantFor(pickers.strap.products[pickers.strap.index], pickers.strap.colorIdx);
        if (!bagVariant || !strapVariant) return;
        addSet.setAttribute('disabled', 'disabled');
        fetch(window.routes.cart_add_url + '.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: [
            { id: bagVariant.id, quantity: 1 },
            { id: strapVariant.id, quantity: 1 }
          ] })
        })
          .then(function (r) { return r.json(); })
          .then(function (result) {
            if (result.status && result.status !== 200) throw new Error(result.description || window.themeStrings.cartError);
            return CartDrawer.refresh(true);
          })
          .catch(function () { /* leave the builder usable */ })
          .then(function () { addSet.removeAttribute('disabled'); });
      });
    }

    // "Use this set" cards: jump both pickers to the referenced products.
    qsa('[data-style-lab-set]').forEach(function (card) {
      var btn = qs('[data-style-lab-use-set]', card);
      if (!btn) return;
      btn.addEventListener('click', function () {
        var bagId = card.getAttribute('data-bag-id');
        var strapId = card.getAttribute('data-strap-id');
        ['bag', 'strap'].forEach(function (kind) {
          var picker = pickers[kind];
          if (!picker) return;
          var targetId = kind === 'bag' ? bagId : strapId;
          var idx = picker.products.findIndex(function (p) { return String(p.id) === targetId; });
          if (idx >= 0) {
            picker.index = idx;
            picker.colorIdx = 0;
            picker.render();
          }
        });
        renderSummary();
        builder.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    // Bundled-sets carousel arrows.
    var setsRow = qs('[data-style-lab-sets-scroll]');
    var setsPrev = qs('[data-style-lab-sets-prev]');
    var setsNext = qs('[data-style-lab-sets-next]');
    if (setsPrev && setsRow) setsPrev.addEventListener('click', function () { setsRow.scrollBy({ left: -460, behavior: 'smooth' }); });
    if (setsNext && setsRow) setsNext.addEventListener('click', function () { setsRow.scrollBy({ left: 460, behavior: 'smooth' }); });
  }

  /* Legal page: auto-generate a sticky TOC from <h2> headings in page.content -------- */
  function slugify(text) {
    return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'section';
  }

  function bindLegalToc() {
    var body = qs('[data-legal-body]');
    var toc = qs('[data-legal-toc]');
    var nav = qs('[data-legal-toc-nav]');
    var grid = qs('[data-legal-grid]');
    if (!body || !toc || !nav) return;

    var headings = qsa('h2', body);
    if (!headings.length) {
      if (grid) grid.classList.add('legal-grid--no-toc');
      return;
    }

    nav.innerHTML = '';
    var used = {};
    var links = headings.map(function (h) {
      if (!h.id) {
        var base = slugify(h.textContent);
        var id = base;
        var i = 1;
        while (used[id]) { id = base + '-' + (++i); }
        h.id = id;
      }
      used[h.id] = true;
      var a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = h.textContent;
      nav.appendChild(a);
      return { link: a, heading: h };
    });
    toc.hidden = false;

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var match = links.find(function (l) { return l.heading === entry.target; });
          if (match && entry.isIntersecting) {
            links.forEach(function (l) { l.link.classList.remove('is-active'); });
            match.link.classList.add('is-active');
          }
        });
      }, { rootMargin: '-20% 0px -70% 0px' });
      headings.forEach(function (h) { observer.observe(h); });
    }
  }

  /* Cart page: apply quantity changes automatically ----------------------------------- */
  function bindCartPage() {
    var form = qs('[data-cart-page-form]');
    if (!form) return;
    qsa('[data-cart-page-qty]', form).forEach(function (input) {
      input.addEventListener('change', function () {
        // Submit through the "update" button so the POST applies quantities
        // without the checkout parameter (checkout redirects are reserved for
        // the actual "Continue to checkout" click).
        var updateBtn = qs('[name="update"]', form);
        if (updateBtn && form.requestSubmit) {
          form.requestSubmit(updateBtn);
        } else {
          form.submit();
        }
      });
    });
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
    bindQuickAddCards();
    bindCrossSellModal();
    bindRecentlyViewed();
    bindStyleLab();
    bindLegalToc();
    bindCartPage();
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
