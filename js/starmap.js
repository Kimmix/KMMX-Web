// Initialize smooth scroll with Lenis
document.addEventListener("DOMContentLoaded", () => {
    // Initialize smooth scrolling
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        smooth: true,
        smoothTouch: false
    });

    // Connect Lenis to ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
    gsap.registerPlugin(ScrollTrigger);

    // Set up the starmap experience
    initStarmapExperience();
});

function initStarmapExperience() {
    // Set up parallax effect for starmap background
    gsap.to(".starmap-bg .star-map", {
        yPercent: -15,
        ease: "none",
        scrollTrigger: {
            trigger: ".star-chart",
            start: "top top",
            end: "bottom top",
            scrub: true
        }
    });

    // Handle story panels and timeline nodes
    const storyPanels = document.querySelectorAll('.story-panel');
    const timelineNodes = document.querySelectorAll('.timeline-node');
    let activeIndex = -1;

    // Create ScrollTrigger for each story panel
    storyPanels.forEach((panel, index) => {
        ScrollTrigger.create({
            trigger: panel,
            start: "top 60%",
            end: "bottom 40%",
            onEnter: () => activatePanel(index),
            onEnterBack: () => activatePanel(index),
            onLeave: () => {
                if (index === storyPanels.length - 1) {
                    // Keep the last panel active when scrolling past it
                    activeIndex = index;
                }
            },
            markers: false
        });
    });

    // Activate a panel and update timeline
    function activatePanel(index) {
        if (activeIndex === index) return;
        activeIndex = index;

        // Update active classes on panels
        storyPanels.forEach((panel, i) => {
            if (i <= index) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });

        // Update timeline nodes
        timelineNodes.forEach((node, i) => {
            if (i <= index) {
                node.classList.add('active');
            } else {
                node.classList.remove('active');
            }
        });

        // Update timeline progress bar
        const progress = (index / (timelineNodes.length - 1)) * 100;
        document.querySelector('.timeline-progress').style.width = `${progress}%`;
    }

    // Make timeline nodes clickable for navigation
    timelineNodes.forEach((node, index) => {
        node.addEventListener('click', () => {
            // Get the corresponding story panel
            const targetPanel = document.querySelector(`.story-panel[data-year="${node.dataset.year}"]`);

            // Scroll to that panel
            if (targetPanel) {
                const targetY = targetPanel.getBoundingClientRect().top + window.scrollY - 100;
                lenis.scrollTo(targetY, { duration: 1.5 });
            }
        });
    });

    // Create floating effect for visual elements
    gsap.utils.toArray('.story-visual').forEach(visual => {
        gsap.to(visual, {
            y: "10px",
            rotation: 2,
            duration: 2.5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
    });

    // Create typing effect for classification status
    setTimeout(() => {
        const status = document.querySelector('.classification .status');
        if (status) {
            status.style.visibility = 'visible';
        }
    }, 500);

    // Add scrolling title effect
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                document.querySelectorAll('.lore-header h1')[0].classList.add('visible');
                document.querySelectorAll('.subtitle')[0].classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    observer.observe(document.querySelector('.lore-header'));
}

// Add a resize handler to ensure the scrolltrigger positions update correctly
window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
});
