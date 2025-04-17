// Detect desktop or mobile environment
const isMobile = /Mobi|Android/i.test(navigator.userAgent);
// const isTablet = /iPad|Tablet|PlayBook|Silk/i.test(navigator.userAgent) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
// const isDesktop = !isMobile && !isTablet;

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
    });

    gsap.utils.toArray("[data-speed]").forEach(layer => {
        let speed = layer.dataset.speed;
        let movement = -(layer.offsetHeight * speed)
        gsap.to(layer, {
            y: movement,
            ease: "none",
            scrollTrigger: {
                trigger: "#parallax",
                start: "top top",
                end: "bottom top",
                scrub: true
            }
        }, 0)
    });

    const POPPERS = document.querySelectorAll(".pop-out-image");

    POPPERS.forEach((pop) => {
        const IMG = pop.querySelectorAll("img");
        gsap.to(IMG, {
            scrollTrigger: {
                trigger: pop,
                scrub: 1,
                start: isMobile ? "bottom bottom+=5" : "bottom bottom+=50",
                end: "top top+=50"
            },
            filter: (index) => (index === 0 ? "brightness(1)" : "brightness(1.3)"),
            yPercent: -30
        });
    });

    // Set age and handle feedback form
    const ageElement = document.getElementById('age');
    if (ageElement) {
        ageElement.textContent = calculateAge(1996);
    }

    // Feedback form handling
    const feedbackForm = document.getElementById("feedbackMessage");
    const sendButton = document.getElementById("sendFeedback");

    if (sendButton && feedbackForm) {
        // Add input event listener to check content as user types
        feedbackForm.addEventListener("input", () => {
            const message = feedbackForm.value.trim();
            if (message) {
                sendButton.disabled = false;
            }
        });

        sendButton.addEventListener("click", (e) => {
            e.preventDefault();
            const message = feedbackForm.value.trim();

            // Double check the message content
            if (message && message.length > 0) {
                showNotification("Thank you for your feedback!");
                feedbackForm.value = ""; // Clear the form
            } else {
                showNotification("Please enter a message before sending.");
            }
        });
    }
});

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
    document.getElementById('deviceType').textContent = `Detected ${deviceType} device.`;
});


//? mouse parallax
const particles = document.querySelectorAll(".shard");


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

// Calculate age
function calculateAge(birthYear) {
    const currentDate = new Date();
    return currentDate.getFullYear() - birthYear;
}

// Show notification
function showNotification(message) {
    const notification = document.getElementById('notification');
    const notificationMessage = notification.querySelector('.notification-message');
    notificationMessage.textContent = message;
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Social links hover effects
document.querySelectorAll('.social-link').forEach(link => {
    link.addEventListener('mouseenter', e => {
        const icon = e.currentTarget.querySelector('.social-icon');
        gsap.to(icon, {
            scale: 1.1,
            duration: 0.3,
            ease: "back.out(1.7)"
        });
    });

    link.addEventListener('mouseleave', e => {
        const icon = e.currentTarget.querySelector('.social-icon');
        gsap.to(icon, {
            scale: 1,
            duration: 0.3,
            ease: "back.out(1.7)"
        });
    });
});