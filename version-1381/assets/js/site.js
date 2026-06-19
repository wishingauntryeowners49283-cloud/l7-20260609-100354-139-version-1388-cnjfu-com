(function () {
    function onReady(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function initNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var menu = document.querySelector("[data-nav-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function initFilters() {
        var input = document.querySelector("[data-filter-input]");
        var yearSelect = document.querySelector("[data-filter-year]");
        var typeSelect = document.querySelector("[data-filter-type]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));
        var empty = document.querySelector("[data-no-results]");
        if (!input || cards.length === 0) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var queryValue = params.get("q");
        if (queryValue && !input.value) {
            input.value = queryValue;
        }

        function applyFilter() {
            var query = normalize(input.value);
            var year = yearSelect ? normalize(yearSelect.value) : "";
            var type = typeSelect ? normalize(typeSelect.value) : "";
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-text"));
                var cardYear = normalize(card.getAttribute("data-year"));
                var cardType = normalize(card.getAttribute("data-type"));
                var matchesQuery = !query || text.indexOf(query) !== -1;
                var matchesYear = !year || cardYear === year;
                var matchesType = !type || cardType === type;
                var show = matchesQuery && matchesYear && matchesType;
                card.hidden = !show;
                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        input.addEventListener("input", applyFilter);
        if (yearSelect) {
            yearSelect.addEventListener("change", applyFilter);
        }
        if (typeSelect) {
            typeSelect.addEventListener("change", applyFilter);
        }
        applyFilter();
    }

    function initHeroSlider() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        if (slides.length <= 1) {
            return;
        }
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
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(index);
                start();
            });
        });

        show(0);
        start();
    }

    onReady(function () {
        initNavigation();
        initFilters();
        initHeroSlider();
    });
}());
