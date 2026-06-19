(function () {
    var header = document.querySelector('.site-header');
    var toggle = document.querySelector('.menu-toggle');

    if (toggle && header) {
        toggle.addEventListener('click', function () {
            header.classList.toggle('menu-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('.hero-prev');
    var next = document.querySelector('.hero-next');
    var heroIndex = 0;
    var heroTimer = null;

    function showHero(index) {
        if (!slides.length) {
            return;
        }

        heroIndex = (index + slides.length) % slides.length;

        slides.forEach(function (slide, i) {
            slide.classList.toggle('is-active', i === heroIndex);
        });

        dots.forEach(function (dot, i) {
            dot.classList.toggle('is-active', i === heroIndex);
        });
    }

    function startHero() {
        if (slides.length < 2) {
            return;
        }

        heroTimer = window.setInterval(function () {
            showHero(heroIndex + 1);
        }, 5200);
    }

    function restartHero() {
        if (heroTimer) {
            window.clearInterval(heroTimer);
        }
        startHero();
    }

    if (prev) {
        prev.addEventListener('click', function () {
            showHero(heroIndex - 1);
            restartHero();
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            showHero(heroIndex + 1);
            restartHero();
        });
    }

    dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
            showHero(i);
            restartHero();
        });
    });

    showHero(0);
    startHero();

    var lists = Array.prototype.slice.call(document.querySelectorAll('.js-card-list'));
    var filterInput = document.querySelector('.js-filter-input');
    var yearFilter = document.querySelector('.js-year-filter');

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function runFilter() {
        if (!lists.length) {
            return;
        }

        var keyword = normalize(filterInput ? filterInput.value : '');
        var year = yearFilter ? String(yearFilter.value || '') : '';

        lists.forEach(function (list) {
            Array.prototype.slice.call(list.querySelectorAll('.movie-card')).forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year')
                ].join(' '));
                var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchesYear = !year || card.getAttribute('data-year') === year;

                card.classList.toggle('is-filter-hidden', !(matchesKeyword && matchesYear));
            });
        });
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (query && filterInput) {
        filterInput.value = query;
    }

    if (filterInput) {
        filterInput.addEventListener('input', runFilter);
    }

    if (yearFilter) {
        yearFilter.addEventListener('change', runFilter);
    }

    runFilter();

    Array.prototype.slice.call(document.querySelectorAll('.player-frame')).forEach(function (frame) {
        var video = frame.querySelector('video');
        var overlay = frame.querySelector('.player-overlay');
        var loaded = false;
        var hlsInstance = null;

        function bindStream() {
            if (!video || loaded) {
                return;
            }

            var stream = video.getAttribute('data-stream');
            if (!stream) {
                return;
            }

            loaded = true;

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else {
                video.src = stream;
            }
        }

        function startPlayback() {
            if (!video) {
                return;
            }

            bindStream();

            if (overlay) {
                overlay.classList.add('is-hidden');
            }

            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    video.controls = true;
                });
            }
        }

        if (overlay) {
            overlay.addEventListener('click', startPlayback);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    startPlayback();
                }
            });

            video.addEventListener('play', function () {
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
            });
        }

        window.addEventListener('pagehide', function () {
            if (hlsInstance && typeof hlsInstance.destroy === 'function') {
                hlsInstance.destroy();
            }
        });
    });
})();
