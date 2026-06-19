(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMobileNav() {
    var button = document.querySelector("[data-mobile-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");

    if (!button || !nav) {
      return;
    }

    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initImageFallback() {
    document.querySelectorAll("img").forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("image-fallback");
        image.removeAttribute("src");
      }, { once: true });
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");

    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var previous = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (previous) {
      previous.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.dataset.heroDot || 0));
        restart();
      });
    });

    restart();
  }

  function initCategoryFilters() {
    var grid = document.querySelector("[data-filter-grid]");
    var filterBox = document.querySelector("[data-filter-box]");

    if (!grid || !filterBox) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    var keyword = filterBox.querySelector("[data-filter-keyword]");
    var region = filterBox.querySelector("[data-filter-region]");
    var type = filterBox.querySelector("[data-filter-type]");
    var year = filterBox.querySelector("[data-filter-year]");
    var reset = filterBox.querySelector("[data-filter-reset]");
    var count = document.querySelector("[data-filter-count]");
    var empty = document.querySelector("[data-filter-empty]");

    function value(node) {
      return node ? String(node.value || "").trim().toLowerCase() : "";
    }

    function applyFilters() {
      var q = value(keyword);
      var selectedRegion = value(region);
      var selectedType = value(type);
      var selectedYear = value(year);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.dataset.title,
          card.dataset.tags,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year
        ].join(" ").toLowerCase();
        var matched = true;

        if (q && haystack.indexOf(q) === -1) {
          matched = false;
        }

        if (selectedRegion && String(card.dataset.region || "").toLowerCase() !== selectedRegion) {
          matched = false;
        }

        if (selectedType && String(card.dataset.type || "").toLowerCase() !== selectedType) {
          matched = false;
        }

        if (selectedYear && String(card.dataset.year || "") !== selectedYear) {
          matched = false;
        }

        card.hidden = !matched;

        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = String(visible);
      }

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [keyword, region, type, year].forEach(function (node) {
      if (node) {
        node.addEventListener("input", applyFilters);
        node.addEventListener("change", applyFilters);
      }
    });

    if (reset) {
      reset.addEventListener("click", function () {
        [keyword, region, type, year].forEach(function (node) {
          if (node) {
            node.value = "";
          }
        });
        applyFilters();
      });
    }
  }

  function initPlayer() {
    var video = document.querySelector(".movie-player[data-hls-source]");

    if (!video) {
      return;
    }

    var source = video.dataset.hlsSource;
    var playButton = document.querySelector("[data-player-play]");
    var layer = document.querySelector("[data-player-layer]");
    var status = document.querySelector("[data-player-status]");
    var hlsInstance = null;
    var initialized = false;

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function attachSource() {
      if (initialized) {
        return Promise.resolve();
      }

      initialized = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus("播放源加载完成");
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus("视频加载失败，请刷新页面重试");
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else {
        video.src = source;
        setStatus("浏览器正在尝试直接播放该视频源");
      }

      video.setAttribute("controls", "controls");
      return Promise.resolve();
    }

    function play() {
      attachSource().then(function () {
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            setStatus("浏览器阻止了自动播放，请再次点击播放按钮");
          });
        }
      });
    }

    if (playButton) {
      playButton.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });

    video.addEventListener("play", function () {
      if (layer) {
        layer.classList.add("is-hidden");
      }
    });

    video.addEventListener("pause", function () {
      if (layer && video.currentTime === 0) {
        layer.classList.remove("is-hidden");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  function escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initSearchPage() {
    var form = document.querySelector("[data-search-form]");
    var input = document.querySelector("[data-search-input]");
    var results = document.querySelector("[data-search-results]");
    var summary = document.querySelector("[data-search-summary]");
    var data = window.MOVIE_SEARCH_DATA || [];

    if (!form || !input || !results || !data.length) {
      return;
    }

    function card(movie) {
      return [
        "<article class=\"movie-card\" data-title=\"" + escapeHtml(movie.title) + "\">",
        "  <a href=\"" + escapeHtml(movie.href) + "\" class=\"movie-card-link\">",
        "    <div class=\"movie-card-cover-wrap\">",
        "      <img class=\"movie-card-cover\" src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
        "      <div class=\"movie-card-overlay\"></div>",
        "      <span class=\"movie-card-type\">" + escapeHtml(movie.type) + "</span>",
        "    </div>",
        "    <div class=\"movie-card-body\">",
        "      <h3>" + escapeHtml(movie.title) + "</h3>",
        "      <p>" + escapeHtml(movie.oneLine) + "</p>",
        "      <div class=\"movie-card-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.year) + "</span></div>",
        "    </div>",
        "  </a>",
        "</article>"
      ].join("");
    }

    function runSearch(query) {
      var q = String(query || "").trim().toLowerCase();
      var matches = q ? data.filter(function (movie) {
        return movie.searchText.indexOf(q) !== -1;
      }) : data.slice(0, 60);

      results.innerHTML = matches.slice(0, 120).map(card).join("\n");
      initImageFallback();

      if (summary) {
        summary.textContent = q
          ? "找到 " + matches.length + " 部相关影片，当前显示前 " + Math.min(matches.length, 120) + " 部。"
          : "可搜索全部 " + data.length + " 部影片，默认展示最新内容。";
      }
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var query = input.value || "";
      var url = new URL(window.location.href);
      url.searchParams.set("q", query);
      window.history.replaceState({}, "", url.toString());
      runSearch(query);
    });

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (initialQuery) {
      input.value = initialQuery;
      runSearch(initialQuery);
    }
  }

  ready(function () {
    initMobileNav();
    initImageFallback();
    initHeroSlider();
    initCategoryFilters();
    initPlayer();
    initSearchPage();
  });
}());
