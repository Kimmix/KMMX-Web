// Check device type
function getDeviceType() {
    const ua = navigator.userAgent;

    if (/Mobi|Android/i.test(ua)) {
        return 'Mobile';
    }
    if (/iPad|Tablet|PlayBook|Silk/i.test(ua) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2)) {
        return 'Tablet';
    }
    return 'Desktop';
}

// Display the detected device type
document.addEventListener('DOMContentLoaded', () => {
    const deviceType = getDeviceType();
    document.getElementById('deviceType').textContent = `You are using a ${deviceType} device.`;
});


//? mouse parallax
const particles = document.querySelectorAll(".hero-particle");

// Detect desktop or mobile environment
const isMobile = /Mobi|Android/i.test(navigator.userAgent);

// Initialize IntersectionObserver
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            if (isMobile) {
                enableAccelerometerParallax();
            } else {
                document.addEventListener("mousemove", throttledParallax);
            }
        } else {
            document.removeEventListener("mousemove", throttledParallax);
            if (isMobile) disableAccelerometerParallax();
        }
    });
});

// Observe particles
particles.forEach((particle) => observer.observe(particle));

// Throttle function for smoother performance
const throttledParallax = throttle(parallax, 16);

// Desktop parallax effect
function parallax(event) {
    const { innerWidth, innerHeight } = window;
    const { pageX, pageY } = event;

    particles.forEach((particle) => {
        const position = parseFloat(particle.getAttribute("value"));
        const x = (innerWidth - pageX * position) / 90;
        const y = (innerHeight - pageY * position) / 160;
        particle.style.transform = `translate(${x}px, ${y}px)`;
    });
}

// Mobile parallax effect using accelerometer
function handleMotion(event) {
    const { gamma, beta } = event; // gamma: left-to-right tilt, beta: front-to-back tilt
    const x = clamp(gamma * 0.6, -100, 20);
    const y = clamp((beta - 90) * 0.4, -70, 30);

    console.log('handleMotion');


    particles.forEach((particle) => {
        const position = parseFloat(particle.getAttribute("value"));
        const offsetX = x * position;
        const offsetY = y * position;
        particle.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    });
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// Enable accelerometer parallax
function enableAccelerometerParallax() {
    if (window.DeviceMotionEvent) {
        window.addEventListener("deviceorientation", handleMotion);
    }
}

// Disable accelerometer parallax
function disableAccelerometerParallax() {
    window.removeEventListener("deviceorientation", handleMotion);
}

// Throttle function to limit event frequency
function throttle(func, limit) {
    let lastCall = 0;
    return function (...args) {
        const now = Date.now();
        if (now - lastCall >= limit) {
            lastCall = now;
            func.apply(this, args);
        }
    };
}


// Throttle function to limit execution frequency
function throttle(func, limit) {
    let lastCall = 0;
    return function (...args) {
        const now = Date.now();
        if (now - lastCall >= limit) {
            lastCall = now;
            func.apply(this, args);
        }
    };
}

document.querySelectorAll('.triangle').forEach(triangle => {
    const randomStart = Math.floor(Math.random() * 360) - 180; // Random between -180 and 180 degrees
    const randomEnd = Math.floor(Math.random() * 360) - 180;   // Random between -180 and 180 degrees
    triangle.style.setProperty('--rotation-start', `${randomStart}deg`);
    triangle.style.setProperty('--rotation-end', `${randomEnd}deg`);
});

// Auto pause video
var heroVideo = document.getElementById("heroVideo");

var io = new IntersectionObserver(
    entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                heroVideo.play();
            } else {
                heroVideo.pause();
            }
        });
    },
    {
        root: null,
        rootMargin: "0px",
        threshold: 0.1
    }
);

// after confirming the element exists, look for the #heroVideo when visible in viewport
if (heroVideo) {
    io.observe(heroVideo)
}

// Popup elements
const popup = document.getElementById('popup');
const popupImg = document.getElementById('popup-img');
const closeBtn = document.querySelector('.popup .close');

// Function to show the full-size image in popup
function showPopup(imgSrc) {
    popup.style.display = 'flex';
    popupImg.src = imgSrc;
}

// Close the popup when 'x' is clicked
closeBtn.onclick = function () {
    popup.style.display = 'none';
}

// Close the popup when clicking outside the image
popup.onclick = function (event) {
    if (event.target === popup) {
        popup.style.display = 'none';
    }
}

// Close the popup when pressing the ESC key
document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        popup.style.display = 'none';
    }
});

// Fetch gallery items and add click event for full-size popup
fetch('/assets/gallery/galleryItems.json')
    .then(response => response.json())
    .then(galleryItems => {
        const galleryContainer = document.getElementById('galleryContainer');

        galleryItems.forEach(item => {
            const galleryItem = `
                <div class="g-img" style="max-height: ${item.maxHeight};">
                    <img src="${item.imgSrc}" loading="lazy" style="height: ${item.height}; object-position: ${item.objectPosition};">
                    <div class="info">
                        <h3>${item.title}</h3>
                        <h4>${item.artist}</h4>
                    </div>
                </div>
            `;
            galleryContainer.innerHTML += galleryItem;
        });

        // Add click event listener to each .g-img div for popup
        document.querySelectorAll('.g-img').forEach(galleryDiv => {
            galleryDiv.addEventListener('click', function () {
                const img = galleryDiv.querySelector('img');
                showPopup(img.src);
            });
        });
    })
    .catch(error => console.error('Error loading gallery items:', error));
