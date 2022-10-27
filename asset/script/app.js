// Register service worker
// https://whatwebcando.today/articles/handling-service-worker-updates/
// function invokeServiceWorkerUpdateFlow(registration) {
//   console.log('New update avaliable')
//   const notification = document.getElementById('update');
//   notification.style.display = "flex";
//   notification.addEventListener('click', () => {
//     console.log('Updating')
//     if (registration.waiting) {
//       // let waiting Service Worker know it should became active
//       registration.waiting.postMessage('SKIP_WAITING')
//     }
//   })
// }
// if ('serviceWorker' in navigator) {
//   // wait for the page to load
//   window.addEventListener('load', async () => {
//     // register the service worker from the file specified
//     const registration = await navigator.serviceWorker.register('../../serviceWorker.js')

//     // ensure the case when the updatefound event was missed is also handled
//     // by re-invoking the prompt when there's a waiting Service Worker
//     if (registration.waiting) {
//       invokeServiceWorkerUpdateFlow(registration)
//     }

//     // detect Service Worker update available and wait for it to become installed
//     registration.addEventListener('updatefound', () => {
//       if (registration.installing) {
//         // wait until the new Service worker is actually installed (ready to take over)
//         registration.installing.addEventListener('statechange', () => {
//           if (registration.waiting) {
//             // if there's an existing controller (previous Service Worker), show the prompt
//             if (navigator.serviceWorker.controller) {
//               invokeServiceWorkerUpdateFlow(registration)
//             } else {
//               // otherwise it's the first install, nothing to do
//               console.log('Service Worker initialized for the first time')
//             }
//           }
//         })
//       }
//     })
//     console.log('ServiceWorker registration successful with scope: ', registration.scope);

//     let refreshing = false;

//     // detect controller change and refresh the page
//     navigator.serviceWorker.addEventListener('controllerchange', () => {
//       if (!refreshing) {
//         window.location.reload()
//         refreshing = true
//       }
//     })
//   })
// }

function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
}


// Animation triggering
const animateOnscroll = document.querySelectorAll('#animate-onscroll')
const animationObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    entry.target.classList.toggle('animate-onscroll', entry.isIntersecting)
  })
}, {
  threshold: 0.05,
});
animateOnscroll.forEach(ele => {
  animationObserver.observe(ele)
})

// Navdot
const pages = document.querySelectorAll("section");
const navdot = document.getElementById("navdot");
pages.forEach(e => {
  const newdot = document.createElement("div");
  newdot.setAttribute("id", "sectiondot");
  navdot.appendChild(newdot)
})
// https://dev.to/ljcdev/introduction-to-scroll-animations-with-intersection-observer-d05
const tabs = document.querySelectorAll("#sectiondot")
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
  threshold: 0.05,
});
pages.forEach(page => {
  scrollingObserver.observe(page)
})

// Mobile gallery auto focus
// https://htmldom.dev/detect-mobile-browsers/
const detectMobile = function () {
  const match = window.matchMedia('(pointer:coarse)');
  return match && match.matches;
};
let mobileObserver = null;
if (detectMobile()) {
  console.log('Mobile Detected!');
  const mobileAF = document.querySelectorAll('#auto-focus')
  mobileObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      entry.target.classList.toggle('focus', entry.isIntersecting)
    })
  }, {
    threshold: 0.7,
  });
  mobileAF.forEach(ele => {
    mobileObserver.observe(ele)
  })
} else {
  // Drag gallery
  const galleryDrag = document.getElementById('gallery-drag');
  let galleryPos = { left: 0, x: 0 };
  const mouseDownHandler = (e) => {
    galleryPos = {
      left: galleryDrag.scrollLeft,
      x: e.clientX,
    };
    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
  };
  const mouseMoveHandler = (e) => {
    galleryDrag.scrollLeft = galleryPos.left - (e.clientX - galleryPos.x);
  };
  const mouseUpHandler = () => {
    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);
  };
  galleryDrag.addEventListener('mousedown', mouseDownHandler);
}

// Footer
function topFunction() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}
function onScrollTo(id) {
  document.getElementById(id).scrollIntoView(true);
}

// LocomotiveScroll
const scroller = new LocomotiveScroll({
  el: document.querySelector('[data-scroll-container]'),
  scrollFromAnywhere: true,
  reloadOnContextChange: true,
  smooth: true,
  firefoxMultiplier: 50,
  // touchMultiplier: 2,
  // resetNativeScroll: !0,
  mobile: {
    smooth: false,
  },
  tablet: {
    breakpoint: 0,
    smooth: true,
    getDirection: true,
  },
})