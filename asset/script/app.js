// Register service worker
// https://whatwebcando.today/articles/handling-service-worker-updates/
if ('serviceWorker' in navigator) {
  // wait for the page to load
  window.addEventListener('load', async () => {
    // register the service worker from the file specified
    const registration = await navigator.serviceWorker.register('../../serviceWorker.js')

    // ensure the case when the updatefound event was missed is also handled
    // by re-invoking the prompt when there's a waiting Service Worker
    if (registration.waiting) {
      invokeServiceWorkerUpdateFlow(registration)
    }

    // detect Service Worker update available and wait for it to become installed
    registration.addEventListener('updatefound', () => {
      if (registration.installing) {
        // wait until the new Service worker is actually installed (ready to take over)
        registration.installing.addEventListener('statechange', () => {
          if (registration.waiting) {
            // if there's an existing controller (previous Service Worker), show the prompt
            if (navigator.serviceWorker.controller) {
              invokeServiceWorkerUpdateFlow(registration)
            } else {
              // otherwise it's the first install, nothing to do
              console.log('Service Worker initialized for the first time')
            }
          }
        })
      }
    })

    let refreshing = false;

    // detect controller change and refresh the page
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        window.location.reload()
        refreshing = true
      }
    })
  })
}

// Use custom cursor on desktop only
if (!detectMobile()) {
  document.getElementsByTagName("head")[0].insertAdjacentHTML(
    'beforeend',
    '<link rel="stylesheet" href="css/cursor.css" />');
  const body = document.getElementById('body');
  body.insertAdjacentHTML('afterbegin', '<div class="cursor"></div>');
  body.insertAdjacentHTML('afterbegin', '<div class="cursor-outer"></div>');
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

// Switch app theme
if (window.localStorage.getItem("isLightmode") === 'true') {
  document.documentElement.style.setProperty('--white-color', '#000');
  document.documentElement.style.setProperty('--white2-color', '#141414');
  document.documentElement.style.setProperty('--black-color', '#ffffff');
  document.documentElement.style.setProperty('--black2-color', '#E9EDF0');
  document.documentElement.style.setProperty('--card-color', '#E6E9EF');
}

function switchTheme() {
  if (window.localStorage.getItem("isLightmode") === 'true') {
    window.localStorage.setItem("isLightmode", false)
  } else {
    window.localStorage.setItem("isLightmode", true)
  }
  location.reload();
}

function changeImg(imgCase) {
  switch (imgCase) {
    case 0:
      document.getElementById("bioImg").src = "asset/KMMX_Katana.webp";
      document.getElementById("bio_desc").innerHTML = "Arcai charged KMMX";
      break;
    case 1:
      document.getElementById("bioImg").src = "asset/KMMX_Witchhat.webp";
      document.getElementById("bio_desc").innerHTML = "Commission by MegaStone99";
      break;
    case 2:
      document.getElementById("bioImg").src = "asset/KMMX_Sketch.webp";
      document.getElementById("bio_desc").innerHTML = "Sketch by Cool Koinu(Discord access reward)";
      break;
    default:
      document.getElementById("bioImg").src = "asset/KMMX_VRC.webp";
      document.getElementById("bio_desc").innerHTML = "Click around to find out 3 more img >w<";
  }
}

// Fullscreen button and cusor animation
let fullscreen;
const fsEnter = document.getElementById('fullscr');
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

function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
}

// Animation triggering
const animationObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    entry.target.classList.toggle('animate-onscroll', entry.isIntersecting)
  })
}, {
  threshold: 0.05,
});

animationObserver.observe(document.getElementById('logo-stroke'));
animationObserver.observe(document.getElementById('stardate'));
animationObserver.observe(document.getElementById('arcai'));
animationObserver.observe(document.getElementById('ref'));

// Footer
function topFunction() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
  changeImg(2)
}
function onScrollTo(id) {
  document.getElementById(id).scrollIntoView(true);
  changeImg(2)
}

// ---- EXP ----
// https://stackoverflow.com/questions/21090221/calculate-days-remaining-until-next-birthday-in-javascript
let today, bday, diff, days;
const myBirthday = [27, 4];
today = new Date();
bday = new Date(today.getFullYear(), myBirthday[1] - 1, myBirthday[0]);
if (today.getTime() > bday.getTime()) {
  bday.setFullYear(bday.getFullYear() + 1);
}
diff = bday.getTime() - today.getTime();
days = Math.floor(diff / (1000 * 60 * 60 * 24));
let exp = (365 - days) / 365 * 100;
if (exp <= 0) {
  document.getElementById("exp").width = '100%';
} else {
  document.getElementById("exp").width = `${exp}%`;
}
