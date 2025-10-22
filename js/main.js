// Utility functions
// -----------------------------------------
// Device detection - consolidated into one function
const deviceInfo = (() => {
    const ua = navigator.userAgent;
    const isMobile = /Mobi|Android/i.test(ua);
    const isTablet = /iPad|Tablet|PlayBook|Silk/i.test(ua) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);

    return {
        isMobile,
        isTablet,
        isDesktop: !isMobile && !isTablet,
        getDeviceType: () => isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'
    };
})();

// Throttle function - optimized
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

// Calculate age - simplified
function calculateAge(birthDateString) {
    const today = new Date();
    const birth = new Date(birthDateString);
    const age = today.getFullYear() - birth.getFullYear();
    return today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate()) ? age - 1 : age;
}

// Show notification with timeout reset
let notificationTimeout;
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.querySelector('.notification-message').textContent = message;
    notification.classList.add('show');

    notificationTimeout && clearTimeout(notificationTimeout);
    notificationTimeout = setTimeout(() => notification.classList.remove('show'), 3000);
}

// Parallax effects
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

// Parallax control functions
const parallaxControl = {
    throttledParallax: null, // Will be initialized on setup

    setup() {
        this.throttledParallax = throttle(parallax, 16);
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    document.addEventListener("mousemove", this.throttledParallax);
                } else {
                    document.removeEventListener("mousemove", this.throttledParallax);
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
    const btn = document.getElementById('backToTopBtn');
    const refSection = document.querySelector('.reference-sheet');
    const footer = document.querySelector('.footer');

    if (!btn || !refSection || !footer) return;

    // Calculate trigger position using the reference section
    const triggerPos = refSection.getBoundingClientRect().top + window.scrollY;
    const toggleButton = () => {
        const isVisible = window.scrollY > triggerPos;
        btn.classList.toggle('visible', isVisible);

        if (isVisible) {
            // Handle footer visibility
            document.body.classList.toggle('footer-visible',
                footer.getBoundingClientRect().top < window.innerHeight - 100);
        } else {
            document.body.classList.remove('footer-visible');
        }
    };

    window.addEventListener('scroll', throttle(toggleButton, 200));
    btn.addEventListener('click', e => {
        e.preventDefault();
        window.lenis ? window.lenis.scrollTo(0, { duration: 1.2 })
            : window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    toggleButton(); // Check on load
}

// Setup color box copy functionality - optimized
function setupColorBoxes() {
    document.querySelectorAll('.color-box').forEach(box => {
        box.addEventListener('click', function () {
            const colorCode = this.getAttribute('data-tooltip');
            navigator.clipboard.writeText(colorCode).then(() => {
                showNotification(`${colorCode} copied to clipboard!`);
            });
        });
    });
}

// Setup SVG animation in footer - simplified
function setupSVGAnimation() {
    const svgAnimation = document.querySelector('.footer-center .svg-animation');
    if (!svgAnimation) return;

    new IntersectionObserver(
        entries => entries[0].isIntersecting && svgAnimation.classList.add('animate'),
        { threshold: 0.3 }
    ).observe(svgAnimation);
}

function setupFooterBgAnimation() {
    const footerBg = document.querySelector('.footer-bg img');
    if (!footerBg) return;

    gsap.set(footerBg, { opacity: 0 });
    gsap.to(footerBg, {
        scrollTrigger: {
            trigger: '.footer',
            start: "top bottom+=90%",
            end: "top center+=40%",
            scrub: true,
            toggleActions: "play none none reverse"
        },
        opacity: 1,
        duration: 1,
        ease: "power1.in"
    });
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

// Story Act Reveal with IntersectionObserver
// -----------------------------------------
function setupStoryReveal() {
    const storyActs = document.querySelectorAll('.story-act');

    if (storyActs.length === 0) return;

    // Create IntersectionObserver that triggers when element is centered
    const observerOptions = {
        root: null, // viewport
        rootMargin: '-40% 0px -40% 0px', // Only trigger when in center 20% of viewport
        threshold: 0.5 // Element must be 50% visible
    };

    const storyObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                // Remove revealed class from all other cards first
                storyActs.forEach(act => {
                    if (act !== entry.target) {
                        act.classList.remove('revealed');
                    }
                });

                // Add revealed class to centered element
                entry.target.classList.add('revealed');
            } else {
                // Remove revealed class when element leaves center
                entry.target.classList.remove('revealed');
            }
        });
    }, observerOptions);

    // Observe all story act elements
    storyActs.forEach((act) => {
        storyObserver.observe(act);
    });
}

// Single DOMContentLoaded event listener for all initializations
document.addEventListener("DOMContentLoaded", () => {
    // Initialize GSAP first (needed regardless of page)
    initGSAP();

    // Initialize Lenis smooth scrolling - only if not on section.html
    const lenisInstance = initSmoothScroll();
    if (!lenisInstance) document.body.classList.add('lenis-disabled');

    // Initialize page elements - using requestAnimationFrame for non-critical tasks
    requestAnimationFrame(() => {
        // Essential UI elements first
        setupAgeDisplay();
        setupDeviceTypeDisplay();
        setupFeedbackForm();

        // Set up parallax effects if Lenis is enabled
        if (lenisInstance) parallaxControl.setup();

        // Delay visual enhancements slightly to prioritize core functionality
        setTimeout(() => {
            setupImageAnimations();
            setupTriangleAnimations();
            setupVideoControl();
            setupBackToTopButton();
            setupSVGAnimation();
            setupFooterBgAnimation();
            setupSocialInteractions();
            setupColorBoxes();
            setupStoryReveal();
        }, 50);
    });
});