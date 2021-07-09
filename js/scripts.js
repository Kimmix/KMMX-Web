const logoFill = document.getElementById("logoFill");
const title1 = document.getElementById("title1");

window.addEventListener('scroll', function() {
  const yPosition = window.scrollY
  logoFill.style.top = yPosition * 0.5 + 'px';
  title1.style.transform = `translateX(${yPosition * 0.5}px)`;
  // transform: translateX(-17px);
})