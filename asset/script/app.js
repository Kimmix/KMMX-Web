if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("serviceWorker.js")
      .then(res => console.log("service worker registered"))
      .catch(err => console.log("service worker not registered", err))
  })
}

let fullscreen;
const fsEnter = document.getElementById('fullscr');
// let fsSvg = document.getElementsByClassName('fs')
const elem = document.documentElement;
fsEnter.addEventListener('click', function (e) {
  e.preventDefault();
  if (!fullscreen) {
    fullscreen = true;
    document.getElementById('fsSvg').classList.add("active")
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
      elem.webkitRequestFullscreen();
    }
  }
  else {
    fullscreen = false;
    document.getElementById('fsSvg').classList.remove("active")
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { /* Safari */
      document.webkitExitFullscreen();
    }
  }
});

fsEnter.addEventListener("mouseover", function (event) {
  document.documentElement.style.setProperty('--cursor-visibility', 'hidden');
}, false);
fsEnter.addEventListener("mouseout", function (event) {
  document.documentElement.style.setProperty('--cursor-visibility', 'show');
}, false);