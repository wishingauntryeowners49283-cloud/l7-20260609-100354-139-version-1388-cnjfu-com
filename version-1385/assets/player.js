(function () {
  function initPlayer(root) {
    var video = root.querySelector('video');
    var button = root.querySelector('[data-player-button]');
    var source = root.getAttribute('data-source');

    if (!video || !source) {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      root.hlsInstance = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else {
      video.src = source;
    }

    function start() {
      if (button) {
        button.classList.add('is-hidden');
      }

      video.setAttribute('controls', 'controls');
      video.play().catch(function () {});
    }

    if (button) {
      button.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('is-hidden');
      }
    });
  }

  document.querySelectorAll('[data-player]').forEach(initPlayer);
})();
