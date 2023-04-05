// Fading FavIcon
const favicon = document.querySelector('link[rel="icon"]')
document.addEventListener("visibilitychange", () => {
  const hidden = document.hidden
  favicon.setAttribute("href", `/favicon${hidden ? "-hidden" : ""}.png`)
})
// Register service worker
// https://whatwebcando.today/articles/handling-service-worker-updates/
function invokeServiceWorkerUpdateFlow(registration) {
  console.log('New update avaliable')
  const notification = document.getElementById('update');
  notification.style.display = "flex";
  notification.addEventListener('click', () => {
    console.log('Updating')
    if (registration.waiting) {
      // let waiting Service Worker know it should became active
      registration.waiting.postMessage('SKIP_WAITING')
    }
  })
}
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
    console.log('ServiceWorker registration successful with scope: ', registration.scope);

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

// Background music control
var audio = document.getElementById("bgAudio");
var audioPlayer = document.getElementById("audioPlayer");
audioPlayer.onclick = function play() {
  if (audioPlayer.classList.contains("stop")) {
    audioPlayer.classList.remove("stop");
    audio.play();
  }
  else {
    audioPlayer.classList.add("stop");
    audio.pause();
  }
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

// https://dev.to/ljcdev/introduction-to-scroll-animations-with-intersection-observer-d05
const tabs = document.querySelectorAll(".dot")
const pages = document.querySelectorAll(".page")
// Scrolling triggering
const scrollingObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const index = Array.from(pages).indexOf(entry.target)
      tabs.forEach(tab => {
        tab.classList.remove("active")
      })
      tabs[index].classList.add("active")
    }
  })
}, {
  rootMargin: '-100px 0px',
  threshold: 0.25,
});

pages.forEach(page => {
  scrollingObserver.observe(page)
})

// Footer
function topFunction() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}
function onScrollTo(id) {
  document.getElementById(id).scrollIntoView(true);
}

// Get age
const myBirthday = [27, 4]; // How dare you peek at my birtday (; ･`д･´)​
let today = new Date()
let age = Math.floor((today - new Date(1996, myBirthday[1] - 1, myBirthday[0])) / 31557600000);
document.getElementById("Page").innerHTML = age;
document.getElementById("age").innerHTML = age;

// Get EXP
let bday = new Date(today.getFullYear(), myBirthday[1] - 1, myBirthday[0]);
if (today.getTime() > bday.getTime()) {
  bday.setFullYear(bday.getFullYear() + 1);
}
let days = Math.floor((bday.getTime() - today.getTime())) / (1000 * 60 * 60 * 24);
let exp = (365.25 - days) / 365.25 * 100;
if (exp < 0.5) {
  document.getElementById("exp").style.width = '100%';
  document.getElementById("exp-percent").innerHTML = 'FULL';
} else {
  document.getElementById("exp").style.width = `${exp}%`;
  document.getElementById("exp-percent").innerHTML = `${exp.toFixed(2)}%`;
}

// Discord webhook
let msg = document.getElementById("feedback");
// Yeah you can't really secure token key on VanillaJS
// 🍍🍕 Begone Italian nerd
let webhookId = '966309917', webhookToken = 'RThTNG9VUktyQWpIRkQ2OVpnWHB0OTJxVGduLThvUDBHeE5rTHhCYko5dTlaRHVocUdrcThBUGJ6SWVPMWd5Q1IzNjY='
async function Firewebhook() {
  document.getElementById("feedback-container").classList.add("loading");
  await fetch(`https://discord.com/api/webhooks/${webhookId + 50646809 * 2}/${atob(webhookToken)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: `${msg.value}` })
    })
    .then(response => {
      document.getElementById("feedback-container").classList.remove("loading");
      if (!response.ok) {
        throw new Error('Webhook was not OK');
      }
    })
    .catch((error) => {
      document.getElementById("feedback").placeholder = "Error";
      document.getElementById("feedback").disabled = true;
      document.getElementById("feedback-container").classList.add("err");
      console.error('Error:', error);
    });
  msg.value = null;
  document.getElementById("input-counter").style.display = "none"
}

// Execute a function when the user releases a key on the keyboard
msg.addEventListener("keyup", ({ key }) => {
  if (key === "Enter") {
    Firewebhook()
  }
})

function counter(e) {
  let inputLength = e.value.length;
  document.getElementById("msg-length").innerHTML = inputLength;
  document.getElementById("input-counter").style.display = inputLength > 0 ? "initial" : "none";
}