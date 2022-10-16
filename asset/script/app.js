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

// Mobile gallery auto focus
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
  mobileObserver.observe(document.getElementById('auto-focus8'));
  mobileObserver.observe(document.getElementById('auto-focus9'));
  mobileObserver.observe(document.getElementById('auto-focus10'));
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

// Footer
function topFunction() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}
function onScrollTo(id) {
  document.getElementById(id).scrollIntoView(true);
}

const scroller = new LocomotiveScroll({
  el: document.querySelector('[data-scroll-container]'),
  smooth: true,
  multiplier: 1,
  firefoxMultiplier: 20,
  mobile: {
    smooth: true,
  },
  tablet: {
    smooth: true,
  },
})