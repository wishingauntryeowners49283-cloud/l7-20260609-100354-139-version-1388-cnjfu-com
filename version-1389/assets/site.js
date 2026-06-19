(function () {
  var menuButton = document.querySelector('.mobile-menu-button');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('is-missing');
    }, { once: true });
  });

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var nextButton = hero.querySelector('[data-hero-next]');
    var prevButton = hero.querySelector('[data-hero-prev]');
    var current = slides.findIndex(function (slide) {
      return slide.classList.contains('is-active');
    });

    if (current < 0) {
      current = 0;
    }

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', function () {
        show(current + 1);
      });
    }

    if (prevButton) {
      prevButton.addEventListener('click', function () {
        show(current - 1);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        show(current + 1);
      }, 5000);
    }
  });

  document.querySelectorAll('[data-filter-scope]').forEach(function (toolbar) {
    var parent = toolbar.parentElement || document;
    var input = toolbar.querySelector('[data-filter-input]');
    var buttons = Array.prototype.slice.call(toolbar.querySelectorAll('[data-filter-value]'));
    var items = Array.prototype.slice.call(parent.querySelectorAll('[data-filter-item]'));
    var activeValue = '';

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function apply() {
      var query = normalize(input ? input.value : '');
      var buttonValue = normalize(activeValue);

      items.forEach(function (item) {
        var text = normalize(item.getAttribute('data-filter-text'));
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchButton = !buttonValue || text.indexOf(buttonValue) !== -1;
        item.classList.toggle('is-hidden', !(matchQuery && matchButton));
      });
    }

    if (input) {
      var params = new URLSearchParams(window.location.search);
      var initial = params.get('q');
      if (initial) {
        input.value = initial;
      }
      input.addEventListener('input', apply);
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        buttons.forEach(function (otherButton) {
          otherButton.classList.remove('is-active');
        });
        button.classList.add('is-active');
        activeValue = button.getAttribute('data-filter-value') || '';
        apply();
      });
    });

    apply();
  });
})();
