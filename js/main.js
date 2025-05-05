// Utility functions
// -----------------------------------------
// Device detection - consolidated into one function
const deviceInfo = (function () {
    const ua = navigator.userAgent;
    const isMobile = /Mobi|Android/i.test(ua);
    const isTablet = /iPad|Tablet|PlayBook|Silk/i.test(ua) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
    const isDesktop = !isMobile && !isTablet;

    return {
        isMobile,
        isTablet,
        isDesktop,
        getDeviceType() {
            return isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop';
        }
    };
})();

// Throttle function - removed duplication
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

// Calculate age
function calculateAge(birthDateString) {
    const today = new Date();
    const birth = new Date(birthDateString);
    const age = today.getFullYear() - birth.getFullYear();
    return today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate()) ? age - 1 : age;
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

// Parallax effects
// -----------------------------------------
// Desktop parallax effect
function parallax(event) {
    const { innerWidth, innerHeight } = window;
    const { pageX, pageY } = event;

    document.querySelectorAll(".shard").forEach((particle) => {
        const position = parseFloat(particle.getAttribute("value"));
        const x = (innerWidth - pageX * position) / 90;
        const y = (innerHeight - pageY * position) / 160;
        particle.style.transform = `translate(${x}px, ${y}px)`;
    });
}

// Clamp helper
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// Mobile parallax effect using accelerometer
function handleMotion(event) {
    const { gamma, beta } = event; // gamma: left-to-right tilt, beta: front-to-back tilt
    const x = clamp(gamma * 0.6, -100, 20);
    const y = clamp((beta - 90) * 0.4, -70, 30);

    document.querySelectorAll(".shard").forEach((particle) => {
        const position = parseFloat(particle.getAttribute("value"));
        const offsetX = x * position;
        const offsetY = y * position;
        particle.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    });
}

// Parallax control functions
const parallaxControl = {
    enableAccelerometer() {
        if (window.DeviceMotionEvent) {
            window.addEventListener("deviceorientation", handleMotion);
        }
    },

    disableAccelerometer() {
        window.removeEventListener("deviceorientation", handleMotion);
    },

    throttledParallax: null, // Will be initialized on setup

    setup() {
        this.throttledParallax = throttle(parallax, 16);

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    if (deviceInfo.isMobile) {
                        this.enableAccelerometer();
                    } else {
                        document.addEventListener("mousemove", this.throttledParallax);
                    }
                } else {
                    document.removeEventListener("mousemove", this.throttledParallax);
                    if (deviceInfo.isMobile) this.disableAccelerometer();
                }
            });
        });

        // Observe all particles
        const particles = document.querySelectorAll(".shard");
        if (particles.length > 0) {
            particles.forEach((particle) => observer.observe(particle));
        }
    }
};

// App initialization modules
// -----------------------------------------
// Initialize smooth scrolling
function initSmoothScroll() {
    // Skip Lenis initialization if we're on section page
    if (window.location.pathname.includes('section.html')) {
        console.log('Skipping Lenis initialization on section.html page');
        return null;
    }

    const lenis = new Lenis({
        duration: 1.0, // Reduced from 1.2 for better performance
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        smoothTouch: false, // Disable on touch devices for better performance
        touchMultiplier: 2,
        wheelMultiplier: 0.8, // Slightly reduced for better control
        lerp: 0.08, // Lower lerp for better performance
    });

    // Only connect with GSAP if lenis was initialized
    if (lenis) {
        // Connect with GSAP - use a throttled callback for better performance
        const throttledUpdate = throttle(() => {
            ScrollTrigger.update();
        }, 100); // Only update ScrollTrigger every 100ms max

        lenis.on("scroll", throttledUpdate);

        // Use requestAnimationFrame instead of gsap.ticker for better performance
        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        // Expose lenis to window for other scripts to detect
        window.lenis = lenis;
    }

    // Prevent unnecessary GSAP lag smoothing
    gsap.ticker.lagSmoothing(0);

    return lenis;
}

// Initialize GSAP and ScrollTrigger
function initGSAP() {
    gsap.registerPlugin(ScrollTrigger);
    gsap.config({
        force3D: "auto"
    });
    // Mark ScrollTrigger to use requestAnimationFrame
    ScrollTrigger.config({
        autoRefreshEvents: "visibilitychange,DOMContentLoaded,load"
    });
}

// Setup image pop-out animations
function setupImageAnimations() {
    const poppers = document.querySelectorAll(".pop-out-image");
    if (poppers.length === 0) return;

    poppers.forEach((pop) => {
        const images = pop.querySelectorAll("img");
        if (images.length === 0) return;

        // Create an efficient ScrollTrigger
        gsap.to(images, {
            scrollTrigger: {
                trigger: pop,
                scrub: 1,
                start: deviceInfo.isMobile ? "bottom bottom+=5" : "bottom bottom+=50",
                end: "top top+=50",
                toggleActions: "play none none reverse"
            },
            filter: (index) => (index === 0 ? "brightness(1)" : "brightness(1.3)"),
            yPercent: -30
        });
    });
}

// Setup age display
function setupAgeDisplay() {
    const ageElement = document.getElementById('age');
    if (ageElement) {
        ageElement.textContent = calculateAge("1996-04-27");
    }
}

// Setup feedback form
function setupFeedbackForm() {
    const feedbackForm = document.getElementById("feedbackMessage");
    const sendButton = document.getElementById("sendFeedback");

    if (sendButton && feedbackForm) {
        // Update button state based on input
        feedbackForm.addEventListener("input", () => {
            sendButton.disabled = !feedbackForm.value.trim();
        });

        // Handle form submission
        sendButton.addEventListener("click", (e) => {
            e.preventDefault();
            const message = feedbackForm.value.trim();

            if (message) {
                showNotification("Thank you for your feedback!");
                feedbackForm.value = ""; // Clear the form
                sendButton.disabled = true; // Disable button after submission
            } else {
                showNotification("Please enter a message before sending.");
            }
        });
    }
}

// Setup device type display
function setupDeviceTypeDisplay() {
    const deviceTypeElement = document.getElementById('deviceType');
    if (deviceTypeElement) {
        deviceTypeElement.textContent = `Detected ${deviceInfo.getDeviceType()} device.`;
    }
}

// Setup random triangle rotations
function setupTriangleAnimations() {
    const triangles = document.querySelectorAll('.triangle');
    if (triangles.length === 0) return;

    triangles.forEach(triangle => {
        const randomStart = Math.floor(Math.random() * 360) - 180;
        const randomEnd = Math.floor(Math.random() * 360) - 180;
        triangle.style.setProperty('--rotation-start', `${randomStart}deg`);
        triangle.style.setProperty('--rotation-end', `${randomEnd}deg`);
    });
}

// Setup video autoplay/pause
function setupVideoControl() {
    const heroVideo = document.getElementById("heroVideo");
    if (!heroVideo) return;

    // Use IntersectionObserver for better performance
    const videoObserver = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.15) {
                    heroVideo.play().catch(() => {
                        // Handle autoplay restrictions
                        console.log("Video autoplay prevented by browser");
                    });
                } else {
                    heroVideo.pause();
                }
            });
        },
        {
            threshold: [0.15, 0.7] // Check at 15% and 70% visibility
        }
    );

    videoObserver.observe(heroVideo);
}

// Back to top button functionality
function setupBackToTopButton() {
    const backToTopBtn = document.getElementById('backToTopBtn');
    const aboutmeSection = document.querySelector('.aboutme');

    if (!backToTopBtn || !aboutmeSection) return;

    // Get the position of the aboutme section
    const aboutmeSectionPosition = aboutmeSection.getBoundingClientRect().top + window.scrollY;

    // Show button when user scrolls past the aboutme section
    function toggleBackToTopButton() {
        if (window.scrollY > aboutmeSectionPosition) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    }

    // Scroll to top smoothly
    function scrollToTop(e) {
        e.preventDefault();

        // If lenis smooth scroll is available, use it
        if (window.lenis) {
            window.lenis.scrollTo(0, { duration: 1.2 });
        } else {
            // Fallback for browsers without smooth scrolling
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }

    // Add event listeners
    window.addEventListener('scroll', throttle(toggleBackToTopButton, 200));
    backToTopBtn.addEventListener('click', scrollToTop);

    // Check position on load (in case page is refreshed while scrolled down)
    toggleBackToTopButton();
}

// Setup color box copy functionality
function setupColorBoxes() {
    const colorBoxes = document.querySelectorAll('.color-box');
    colorBoxes.forEach(box => {
        box.addEventListener('click', function () {
            const colorCode = this.getAttribute('data-tooltip');
            navigator.clipboard.writeText(colorCode).then(() => {
                // Show copied notification
                const notification = document.querySelector('.notification');
                const notificationMessage = document.querySelector('.notification-message');
                if (notification && notificationMessage) {
                    notificationMessage.textContent = `${colorCode} copied to clipboard!`;
                    notification.classList.add('show');
                    setTimeout(() => {
                        notification.classList.remove('show');
                    }, 2000);
                }
            });
        });
    });
}

// Setup SVG animation in footer
function setupSVGAnimation() {
    const svgAnimation = document.querySelector('.footer-center .svg-animation');
    if (!svgAnimation) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                // Add animate class when the element comes into view
                if (entry.isIntersecting) {
                    svgAnimation.classList.add('animate');
                } else {
                    // Optional: Remove the class when out of view to reset animation
                    // Uncomment the next line if you want the animation to repeat each time
                    // svgAnimation.classList.remove('animate');
                }
            });
        },
        {
            threshold: 0.3 // Trigger when 30% of the element is visible
        }
    );

    observer.observe(svgAnimation);
}

// Main initialization
function init() {
    // Initialize GSAP first (needed regardless of page)
    initGSAP();

    // Initialize Lenis smooth scrolling - only if not on section.html
    const lenisInstance = initSmoothScroll();

    // Add a class to body if Lenis is disabled, so CSS can adjust accordingly
    if (!lenisInstance) {
        document.body.classList.add('lenis-disabled');
    }

    // Schedule less critical initializations with small delays
    // to improve initial load performance
    setTimeout(() => {
        // Set up dynamic content and elements
        setupAgeDisplay();
        setupDeviceTypeDisplay();

        // Set up parallax effects - only if Lenis is enabled (not on section page)
        if (lenisInstance) {
            parallaxControl.setup();
        }

        // Set up form interaction
        setupFeedbackForm();
    }, 10);

    // Slightly delay animations to ensure smooth page load
    setTimeout(() => {
        // Set up animations
        setupImageAnimations();
        setupTriangleAnimations();
        setupVideoControl();
        setupBackToTopButton();
        setupSVGAnimation();

        // Set up interactions
        setupSocialInteractions();
        setupColorBoxes();
    }, 100);
}

// Social interactions
// -----------------------------------------
function setupSocialInteractions() {
    // Social links hover effects
    const socialLinks = document.querySelectorAll('.social-link');
    if (socialLinks.length === 0) return;

    socialLinks.forEach(link => {
        // Precomputed selectors for better performance
        const icon = link.querySelector('.social-icon');
        if (!icon) return;

        // Use a simple CSS class for hover instead of GSAP for better performance
        link.addEventListener('mouseenter', () => {
            icon.classList.add('hover-scale');
        });

        link.addEventListener('mouseleave', () => {
            icon.classList.remove('hover-scale');
        });

        // Handle click events - for desktop
        link.addEventListener('click', handleSocialLinkInteraction);

        // Handle touch events - specifically for iOS/mobile
        link.addEventListener('touchend', handleSocialLinkInteraction);
    });

    // Separated event handler function to avoid code duplication
    function handleSocialLinkInteraction(e) {
        e.preventDefault();
        const link = e.currentTarget;
        const platform = link.classList[1];
        const href = link.getAttribute('href');

        // Safety fallback - ensure we always navigate even if animation fails
        setTimeout(() => {
            window.open(href, '_blank');
        }, 500);

        // Animation sequence if possible
        const splash = document.querySelector('.social-splash');
        if (!splash) {
            window.open(href, '_blank');
            return;
        }

        const splashIcon = splash.querySelector('.splash-icon');
        if (!splashIcon) {
            window.open(href, '_blank');
            return;
        }

        // Reset any ongoing animations and states
        gsap.killTweensOf(splashIcon);
        gsap.killTweensOf(splash);
        splash.style.opacity = '';
        splashIcon.style.opacity = '';
        gsap.set(splashIcon, { scale: 0 });

        // Remove any existing platform classes
        splash.className = 'social-splash';

        // Clone the icon and make it white
        const iconSvg = link.querySelector('.social-icon svg');
        if (iconSvg) {
            const iconClone = iconSvg.cloneNode(true);
            iconClone.style.fill = '#FFFFFF';
            splashIcon.innerHTML = '';
            splashIcon.appendChild(iconClone);
        }

        // Add platform class and show splash
        splash.classList.add(platform);
        splash.classList.add('active');

        // Simpler animation sequence with fewer steps
        gsap.timeline()
            .to(splashIcon, {
                scale: 1,
                duration: 0.3,
                ease: "back.out(1.7)"
            })
            .to(splash, {
                opacity: 0,
                duration: 0.3,
                delay: 0.2,
                onComplete: () => {
                    splash.classList.remove('active', platform);
                    splashIcon.style.opacity = '1';
                    gsap.set(splashIcon, { scale: 0 });
                }
            });
    }
}

// Single DOMContentLoaded event listener for all initializations
document.addEventListener("DOMContentLoaded", () => {
    init();
});