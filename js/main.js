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
    const x = gamma / 2; // Adjust sensitivity
    const y = beta / 2;

    particles.forEach((particle) => {
        const position = parseFloat(particle.getAttribute("value"));
        const offsetX = x * position;
        const offsetY = y * position;
        particle.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    });
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

//? Color box copy
const hoverBoxes = document.querySelectorAll('.color-box');

hoverBoxes.forEach(hoverBox => {
    const tooltip = hoverBox.querySelector('.tooltip');
    const originalText = hoverBox.getAttribute('data-tooltip');

    hoverBox.addEventListener('mouseenter', function (event) {
        tooltip.style.display = 'block';
    });

    hoverBox.addEventListener('mousemove', function (event) {
        tooltip.style.left = `${event.pageX}px`;
        tooltip.style.top = `${event.pageY - 370}px`;
    });

    hoverBox.addEventListener('mouseleave', function () {
        tooltip.style.display = 'none';
    });

    hoverBox.addEventListener('click', function () {
        // Copy the specific tooltip text to clipboard
        navigator.clipboard.writeText(originalText).then(() => {
            // Change tooltip text to indicate it has been copied
            tooltip.innerText = '✓ Copied!';
            tooltip.classList.add('copied');

            // Change it back after 400 ms
            setTimeout(() => {
                tooltip.innerText = originalText;
                tooltip.classList.remove('copied');
            }, 400);
        });
    });
});