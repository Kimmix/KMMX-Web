// Show content based on active sidebar link
function showContent(contentId, event) {
    if (event) {
        event.preventDefault();
    }

    // Hide all content sections with proper animation
    const sections = document.querySelectorAll('.content-section');
    const activeSection = document.querySelector('.content-section.active');

    // Update active class on sidebar links
    const links = document.querySelectorAll('.sidebar a');
    links.forEach(link => {
        link.classList.remove('active');
    });

    // Add active class to clicked link
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    } else {
        const activeLink = document.querySelector(`.sidebar a[href="#${contentId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    // Show selected content
    const selectedContent = document.getElementById(contentId);

    // If there's an active section and it's not the one we want to show
    if (activeSection && activeSection !== selectedContent) {
        // Add fade-out class to active section
        activeSection.classList.add('fade-out');

        // After animation completes, hide old content and show new content
        setTimeout(() => {
            sections.forEach(section => {
                section.classList.remove('active', 'fade-out');
            });

            if (selectedContent) {
                selectedContent.classList.add('active');
            }
        }, 300); // Match the CSS animation duration
    } else {
        // If there's no active section or it's the same one, just show the selected content
        sections.forEach(section => {
            section.classList.remove('active', 'fade-out');
        });

        if (selectedContent) {
            selectedContent.classList.add('active');
        }
    }
}

// Add interactive glow effect to cards
function initCardGlowEffect() {
    const cards = document.querySelectorAll('.equipment-card, .stat-card, .visualization, .skill-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const mouseX = Math.max(0, Math.min(1, x / card.clientWidth)) * 100;
            const mouseY = Math.max(0, Math.min(1, y / card.clientHeight)) * 100;

            card.style.setProperty('--mouse-x', `${mouseX}%`);
            card.style.setProperty('--mouse-y', `${mouseY}%`);

            // Different variables for different card types
            if (card.classList.contains('equipment-card')) {
                card.style.setProperty('--glow-opacity', '1');
            } else if (card.classList.contains('skill-card')) {
                card.style.setProperty('--card-glow-opacity', '1');
            }
        });

        card.addEventListener('mouseleave', () => {
            if (card.classList.contains('equipment-card')) {
                card.style.setProperty('--glow-opacity', '0');
            } else if (card.classList.contains('skill-card')) {
                card.style.setProperty('--card-glow-opacity', '0');
            }
        });
    });
}

// Initialize smooth scrolling with Lenis if available
function initSmoothScroll() {
    if (typeof Lenis !== 'undefined') {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
            infinite: false,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);
    }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Show default content (info)
    showContent('info');

    // Set all equipment cards to expanded by default
    document.querySelectorAll('.equipment-card').forEach(card => {
        card.classList.add('expanded');
    });

    // Initialize glow effect on cards
    initCardGlowEffect();

    // Initialize smooth scrolling
    initSmoothScroll();
});

