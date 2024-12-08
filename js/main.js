// Initialize Lenis
document.addEventListener("DOMContentLoaded", () => {
    const lenis = new Lenis()
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    })
    gsap.ticker.lagSmoothing(0);

    gsap.registerPlugin(ScrollTrigger);
    const stickySection = document.querySelector(".sticky");
    const stickyHeader = document.querySelector(".sticky-header");
    const stickyHeight = window.innerHeight * 2;

    ScrollTrigger.create({
        trigger: stickySection,
        start: "top top",
        end: `+=${stickyHeight}px`,
        pin: true,
        pinSpacing: true,
        onUpdate: (self) => {
            const progress = self.progress;
            const maxTranslate = stickyHeader.offsetWidth - window.innerWidth;
            const translateX = -progress * maxTranslate;
            gsap.set(stickyHeader, { x: translateX });
        },
    })

})

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

//! BIO
function showContent(sectionId, event) {
    event.preventDefault();
    // Hide all content sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Remove active class from all sidebar links
    document.querySelectorAll('.sidebar a').forEach(link => {
        link.classList.remove('active');
    });

    // Show the selected section and activate the link
    document.getElementById(sectionId).classList.add('active');
    event.target.classList.add('active');
}

document.querySelectorAll('.stat-bar').forEach((div) => {
    const position = div.getAttribute('data-position');
    div.style.background = `linear-gradient(90deg, #cb2040 0%, #893b85 ${position}, #3c405d 100%)`;
});


//! Star-chart
const professionContainer = document.querySelector('.star-chart');
const professionItems = professionContainer.querySelectorAll('#profession');

window.addEventListener('scroll', () => {
    const rect = professionContainer.getBoundingClientRect();
    const totalHeight = professionContainer.offsetHeight;
    // Calculate scroll percentage
    const percentage = Math.max(0, Math.min(100, ((window.innerHeight - rect.top) / totalHeight) * 100));
    // console.log(percentage);
    // Apply highlighting based on percentage ranges
    professionItems.forEach((item, index) => {
        item.classList.remove('highlight'); // Reset all highlights
        if (index === 0 && percentage > 0 && percentage <= 30) {
            item.classList.add('highlight');
        } else if (index === 1 && percentage > 30 && percentage <= 49) {
            item.classList.add('highlight');
        } else if (index === 2 && percentage >= 50) {
            item.classList.add('highlight');
        }
    });
});