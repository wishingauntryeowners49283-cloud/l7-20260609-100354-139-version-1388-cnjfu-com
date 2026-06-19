
var SitePlayer = (function() {
  function create(options) {
    var video = options && options.video;
    var button = options && options.button;
    var shell = options && options.shell;
    var source = options && options.source;

    if (!video || !button || !source) {
      return;
    }

    function markPlaying() {
      button.classList.add("is-hidden");
      if (shell) {
        shell.classList.add("is-playing");
      }
    }

    function playVideo() {
      markPlaying();

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        if (video.src !== source) {
          video.src = source;
        }
        video.play().catch(function() {});
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        if (!video.__hlsInstance) {
          var hls = new window.Hls();
          video.__hlsInstance = hls;
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
            video.play().catch(function() {});
          });
        } else {
          video.play().catch(function() {});
        }
        return;
      }

      if (video.src !== source) {
        video.src = source;
      }
      video.play().catch(function() {});
    }

    button.addEventListener("click", playVideo);
    video.addEventListener("play", markPlaying);
  }

  return {
    create: create
  };
})();
