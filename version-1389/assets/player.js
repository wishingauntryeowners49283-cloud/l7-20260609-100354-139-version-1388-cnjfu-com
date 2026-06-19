(function () {
  var Hls = window.Hls;
  var players = Array.prototype.slice.call(document.querySelectorAll('.js-player'));

  function attach(video, playUrl, frame) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = playUrl;
      return;
    }

    if (Hls && Hls.isSupported()) {
      var hls = new Hls({ enableWorker: true });
      hls.loadSource(playUrl);
      hls.attachMedia(video);
      frame.hlsInstance = hls;
      return;
    }

    video.src = playUrl;
  }

  players.forEach(function (frame) {
    var video = frame.querySelector('video');
    var button = frame.querySelector('[data-play]');

    if (!video || !button) {
      return;
    }

    var playUrl = button.getAttribute('data-play');
    var ready = false;

    function start() {
      if (!playUrl) {
        return;
      }

      if (!ready) {
        attach(video, playUrl, frame);
        ready = true;
      }

      button.hidden = true;
      frame.classList.add('is-playing');
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          button.hidden = false;
          frame.classList.remove('is-playing');
        });
      }
    }

    button.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (!ready) {
        start();
      }
    });
    video.addEventListener('play', function () {
      button.hidden = true;
      frame.classList.add('is-playing');
    });
  });
})();
