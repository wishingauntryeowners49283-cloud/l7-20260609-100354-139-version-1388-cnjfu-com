import { H as Hls } from "./hls.js";

export function initMoviePlayer(url) {
    const video = document.getElementById("movie-player");
    const startButton = document.getElementById("player-start");
    let hls = null;
    let attached = false;

    if (!video || !startButton || !url) {
        return;
    }

    function attachSource() {
        if (attached) {
            return;
        }

        attached = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
            return;
        }

        if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(Hls.Events.ERROR, function (_, data) {
                if (data && data.fatal && hls) {
                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                        hls = null;
                        video.src = url;
                    }
                }
            });
            return;
        }

        video.src = url;
    }

    function playVideo() {
        attachSource();
        startButton.classList.add("is-hidden");
        const playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
                startButton.classList.remove("is-hidden");
            });
        }
    }

    startButton.addEventListener("click", playVideo);

    video.addEventListener("click", function () {
        if (video.paused) {
            playVideo();
        }
    });

    video.addEventListener("play", function () {
        startButton.classList.add("is-hidden");
    });

    video.addEventListener("ended", function () {
        startButton.classList.remove("is-hidden");
    });
}
