(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var open = mobilePanel.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer;

    function setHero(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startHero() {
      timer = window.setInterval(function () {
        setHero(current + 1);
      }, 5000);
    }

    function resetHero() {
      window.clearInterval(timer);
      startHero();
    }

    if (prev) {
      prev.addEventListener('click', function () {
        setHero(current - 1);
        resetHero();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        setHero(current + 1);
        resetHero();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        setHero(Number(dot.getAttribute('data-hero-dot')) || 0);
        resetHero();
      });
    });

    setHero(0);
    startHero();
  }

  var shareButtons = document.querySelectorAll('[data-share-button]');

  shareButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var title = button.getAttribute('data-share-title') || document.title;
      var payload = {
        title: title,
        url: window.location.href
      };

      if (navigator.share) {
        navigator.share(payload).catch(function () {});
        return;
      }

      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href).then(function () {
          button.textContent = '已复制链接';
          window.setTimeout(function () {
            button.textContent = '分享';
          }, 1600);
        });
      }
    });
  });

  var searchIndex = window.SEARCH_INDEX || [];
  var results = document.querySelector('[data-search-results]');
  var searchInput = document.querySelector('[data-search-input]');
  var searchTitle = document.querySelector('[data-search-title]');
  var searchSubtitle = document.querySelector('[data-search-subtitle]');

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, function (item) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[item];
    });
  }

  function renderSearch(query) {
    if (!results || !query) {
      return;
    }

    var keywords = query.toLowerCase().split(/\s+/).filter(Boolean);
    var matched = searchIndex.filter(function (item) {
      var haystack = [item.title, item.region, item.type, item.year, item.genre, item.tags, item.description].join(' ').toLowerCase();
      return keywords.every(function (keyword) {
        return haystack.indexOf(keyword) !== -1;
      });
    }).slice(0, 80);

    if (searchTitle) {
      searchTitle.textContent = '搜索结果';
    }

    if (searchSubtitle) {
      searchSubtitle.textContent = matched.length ? '已找到匹配影片，点击卡片进入详情页' : '暂未找到匹配影片，可尝试更换关键词';
    }

    if (!matched.length) {
      results.innerHTML = '';
      return;
    }

    results.innerHTML = matched.map(function (item) {
      return '<article class="movie-card">' +
        '<a class="poster" href="./' + escapeHtml(item.href) + '" style="--cover: url(\'' + escapeHtml(item.cover) + '\')">' +
        '<span class="category-pill">' + escapeHtml(item.genre || item.type) + '</span>' +
        '<span class="play-badge">▶</span>' +
        '<span class="duration">' + escapeHtml(item.duration) + '</span>' +
        '</a>' +
        '<div class="card-body">' +
        '<h3><a href="./' + escapeHtml(item.href) + '">' + escapeHtml(item.title) + '</a></h3>' +
        '<p>' + escapeHtml(item.description) + '</p>' +
        '<div class="meta-row"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.views) + '观看</span></div>' +
        '</div>' +
        '</article>';
    }).join('');
  }

  var params = new URLSearchParams(window.location.search);
  var query = params.get('q') || '';

  if (searchInput) {
    searchInput.value = query;
  }

  renderSearch(query.trim());
})();
