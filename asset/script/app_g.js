let mobileObserver = null;
if (detectMobile()) {
  mobileObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      entry.target.classList.toggle('focus', entry.isIntersecting)
    })
  }, {
    threshold: 0.7,
  });
  mobileObserver.observe(document.getElementById('auto-focus1'));
  mobileObserver.observe(document.getElementById('auto-focus2'));
  mobileObserver.observe(document.getElementById('auto-focus3'));
  mobileObserver.observe(document.getElementById('auto-focus4'));
  mobileObserver.observe(document.getElementById('auto-focus5'));
  mobileObserver.observe(document.getElementById('auto-focus6'));
  mobileObserver.observe(document.getElementById('auto-focus7'));
}


// https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
function detectMobile() {
  const toMatch = [
    /Android/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
  ];

  return toMatch.some((toMatchItem) => {
    return navigator.userAgent.match(toMatchItem);
  });
}