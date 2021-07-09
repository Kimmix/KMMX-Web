if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("serviceWorker.js")
      .then(res => console.log("service worker registered"))
      .catch(err => console.log("service worker not registered", err))
  })
}

const logoFill = document.getElementById("logoFill");
const title1 = document.getElementById("title1");
const block2 = document.getElementById("block2");

window.addEventListener('scroll', function() {
  const yPosition = window.scrollY
  // console.log(yPosition);
  if (yPosition < 600) {
    logoFill.style.top = yPosition * 1.5 + 'px';
    title1.style.transform = `translateX(${yPosition * 0.5}px)`;
  }
  // transform: translateX(-17px);
})