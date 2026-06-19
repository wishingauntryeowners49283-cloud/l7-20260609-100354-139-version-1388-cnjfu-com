(function () {
  function bySelector(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, "");
  }

  function initMobileMenu() {
    var button = document.querySelector("[data-mobile-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = bySelector("[data-hero-slide]", hero);
    var dots = bySelector("[data-hero-dot]", hero);
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilters() {
    bySelector("[data-filter-scope]").forEach(function (scope) {
      var input = scope.querySelector("[data-filter-input]");
      var select = scope.querySelector("[data-filter-select]");
      var summary = scope.querySelector("[data-filter-summary]");
      var cards = bySelector("[data-filter-card]", scope);
      if (!input && !select) {
        return;
      }

      function apply() {
        var keyword = normalize(input ? input.value : "");
        var year = select ? select.value : "";
        var shown = 0;
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-filter-text"));
          var cardYear = card.getAttribute("data-year") || "";
          var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchedYear = !year || cardYear === year;
          var visible = matchedKeyword && matchedYear;
          card.hidden = !visible;
          if (visible) {
            shown += 1;
          }
        });
        if (summary) {
          summary.textContent = shown > 0 ? "已显示匹配影片" : "没有找到匹配的影片";
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (select) {
        select.addEventListener("change", apply);
      }
      apply();
    });
  }

  function initPlayer() {
    var video = document.querySelector("[data-player]");
    if (!video) {
      return;
    }
    var overlay = document.querySelector("[data-player-overlay]");
    var stream = video.getAttribute("data-stream");
    var hls = null;

    function load() {
      if (!stream || video.getAttribute("data-ready") === "1") {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
      video.setAttribute("data-ready", "1");
    }

    function play() {
      load();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });

    video.addEventListener("ended", function () {
      if (overlay) {
        overlay.classList.remove("is-hidden");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  function renderMovieCard(movie) {
    var tags = Array.isArray(movie.tags) ? movie.tags.slice(0, 2) : [];
    return [
      '<article class="movie-card" data-filter-card data-year="' + escapeHtml(movie.year) + '" data-filter-text="' + escapeHtml([movie.title, movie.year, movie.region, movie.type, movie.genre, movie.category, (movie.tags || []).join(" ")].join(" ")) + '">',
      '<a class="poster-link" href="' + escapeHtml(movie.url) + '">',
      '<img src="./' + escapeHtml(movie.cover) + '.jpg" alt="' + escapeHtml(movie.title) + '" loading="lazy" decoding="async">',
      '<span class="card-badge">' + escapeHtml(movie.year) + '</span>',
      '<span class="play-badge">▶</span>',
      '</a>',
      '<div class="card-body">',
      '<a class="card-title" href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a>',
      '<p class="card-line">' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="card-meta">',
      '<span>' + escapeHtml(movie.region) + '</span>',
      '<span>' + escapeHtml(movie.genre) + '</span>',
      tags.map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join(""),
      '</div>',
      '</div>',
      '</article>'
    ].join("");
  }

  function initSearchPage() {
    var box = document.querySelector("[data-search-page]");
    if (!box || typeof MovieIndex === "undefined") {
      return;
    }
    var input = box.querySelector("[data-search-input]");
    var select = box.querySelector("[data-search-year]");
    var results = box.querySelector("[data-search-results]");
    var summary = box.querySelector("[data-search-summary]");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    if (input && initial) {
      input.value = initial;
    }

    function years() {
      var set = {};
      MovieIndex.forEach(function (movie) {
        if (movie.year) {
          set[movie.year] = true;
        }
      });
      return Object.keys(set).sort(function (a, b) {
        return Number(b) - Number(a);
      });
    }

    if (select && !select.getAttribute("data-ready")) {
      years().slice(0, 18).forEach(function (year) {
        var option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        select.appendChild(option);
      });
      select.setAttribute("data-ready", "1");
    }

    function apply() {
      var keyword = normalize(input ? input.value : "");
      var year = select ? select.value : "";
      var matched = MovieIndex.filter(function (movie) {
        var text = normalize([movie.title, movie.year, movie.region, movie.type, movie.genre, movie.category, (movie.tags || []).join(" ")].join(" "));
        var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchedYear = !year || movie.year === year;
        return matchedKeyword && matchedYear;
      }).slice(0, 120);

      if (summary) {
        summary.textContent = matched.length > 0 ? "以下是相关影片" : "没有找到匹配的影片";
      }

      if (results) {
        if (!keyword && !year) {
          results.innerHTML = '<div class="search-empty">输入片名、题材、年份或地区，即可浏览匹配影片。</div>';
        } else if (matched.length === 0) {
          results.innerHTML = '<div class="search-empty">没有找到匹配的影片。</div>';
        } else {
          results.innerHTML = matched.map(renderMovieCard).join("");
        }
      }
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    if (select) {
      select.addEventListener("change", apply);
    }
    apply();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initHero();
    initFilters();
    initPlayer();
    initSearchPage();
  });
})();
