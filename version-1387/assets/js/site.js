(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuButton = document.querySelector(".mobile-menu-button");
        var mobileNav = document.querySelector(".mobile-nav");

        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                var expanded = menuButton.getAttribute("aria-expanded") === "true";
                menuButton.setAttribute("aria-expanded", String(!expanded));
                mobileNav.hidden = expanded;
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var prev = document.querySelector(".hero-prev");
        var next = document.querySelector(".hero-next");
        var activeIndex = 0;
        var heroTimer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, offset) {
                slide.classList.toggle("is-active", offset === activeIndex);
            });
            dots.forEach(function (dot, offset) {
                dot.classList.toggle("is-active", offset === activeIndex);
            });
        }

        function restartHero() {
            if (heroTimer) {
                window.clearInterval(heroTimer);
            }
            if (slides.length > 1) {
                heroTimer = window.setInterval(function () {
                    showSlide(activeIndex + 1);
                }, 5200);
            }
        }

        if (slides.length) {
            showSlide(0);
            restartHero();
            if (prev) {
                prev.addEventListener("click", function () {
                    showSlide(activeIndex - 1);
                    restartHero();
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    showSlide(activeIndex + 1);
                    restartHero();
                });
            }
            dots.forEach(function (dot, offset) {
                dot.addEventListener("click", function () {
                    showSlide(offset);
                    restartHero();
                });
            });
        }

        var keyword = document.getElementById("movie-filter-keyword");
        var typeSelect = document.getElementById("movie-filter-type");
        var yearSelect = document.getElementById("movie-filter-year");
        var regionSelect = document.getElementById("movie-filter-region");
        var resetButton = document.getElementById("movie-filter-reset");
        var status = document.getElementById("filter-status");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-grid .movie-card"));

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function applyQueryFromUrl() {
            if (!keyword) {
                return;
            }
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q");
            if (query) {
                keyword.value = query;
            }
        }

        function filterMovies() {
            if (!cards.length) {
                return;
            }
            var query = normalize(keyword && keyword.value);
            var selectedType = normalize(typeSelect && typeSelect.value);
            var selectedYear = normalize(yearSelect && yearSelect.value);
            var selectedRegion = normalize(regionSelect && regionSelect.value);
            var shown = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.dataset.title,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.region,
                    card.dataset.genre,
                    card.dataset.tags,
                    card.textContent
                ].join(" "));
                var cardType = normalize(card.dataset.type);
                var cardCategory = normalize(card.dataset.category);
                var cardYear = normalize(card.dataset.year);
                var cardRegion = normalize(card.dataset.region);
                var typeMatched = !selectedType || cardCategory === selectedType || cardType.indexOf(selectedType) !== -1 || haystack.indexOf(selectedType) !== -1;
                var matched = (!query || haystack.indexOf(query) !== -1) && typeMatched && (!selectedYear || cardYear === selectedYear) && (!selectedRegion || cardRegion === selectedRegion);
                card.classList.toggle("is-hidden", !matched);
                if (matched) {
                    shown += 1;
                }
            });

            if (status) {
                status.textContent = shown ? "已筛选出匹配影片，点击卡片进入详情播放。" : "暂未找到匹配影片，可调整关键词或筛选条件。";
            }
        }

        if (cards.length) {
            applyQueryFromUrl();
            [keyword, typeSelect, yearSelect, regionSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", filterMovies);
                    control.addEventListener("change", filterMovies);
                }
            });
            if (resetButton) {
                resetButton.addEventListener("click", function () {
                    if (keyword) {
                        keyword.value = "";
                    }
                    if (typeSelect) {
                        typeSelect.value = "";
                    }
                    if (yearSelect) {
                        yearSelect.value = "";
                    }
                    if (regionSelect) {
                        regionSelect.value = "";
                    }
                    filterMovies();
                });
            }
            filterMovies();
        }
    });
})();
