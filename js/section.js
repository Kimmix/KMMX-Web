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

    // Equipment card glow effect
    const cards = document.querySelectorAll('.equipment-card');
    let coords = { x: 0, y: 0 };
    let frame;

    const updateMousePosition = (e, card) => {
        const rect = card.getBoundingClientRect();
        coords.x = ((e.clientX - rect.left) / card.offsetWidth) * 100;
        coords.y = ((e.clientY - rect.top) / card.offsetHeight) * 100;

        // Only schedule an animation frame if we don't have one pending
        if (!frame) {
            frame = requestAnimationFrame(() => {
                card.style.setProperty('--mouse-x', `${coords.x}%`);
                card.style.setProperty('--mouse-y', `${coords.y}%`);
                frame = null;
            });
        }
    };

    cards.forEach(card => {
        // Use passive event listener for better scroll performance
        card.addEventListener('mousemove', e => updateMousePosition(e, card), { passive: true });

        // Reset position on mouse leave with slight delay for smoother transition
        card.addEventListener('mouseleave', () => {
            if (frame) {
                cancelAnimationFrame(frame);
                frame = null;
            }
            requestAnimationFrame(() => {
                card.style.setProperty('--mouse-x', '50%');
                card.style.setProperty('--mouse-y', '50%');
            });
        });
    });

    // Mouse movement effect for stat rows
    const statRows = document.querySelectorAll('.stat-row');

    statRows.forEach(row => {
        row.addEventListener('mousemove', e => {
            const rect = row.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            row.style.setProperty('--mouse-x', `${x}px`);
            row.style.setProperty('--mouse-y', `${y}px`);
        });
    });
});

//! BIO
// Enhanced showContent function with smooth transitions
function showContent(sectionId, event) {
    event.preventDefault();

    const sections = document.querySelectorAll('.content-section');
    const links = document.querySelectorAll('.sidebar a');
    const targetSection = document.getElementById(sectionId);

    // Fade out all sections
    sections.forEach(section => {
        if (section.classList.contains('active')) {
            section.style.opacity = '0';
            setTimeout(() => {
                section.classList.remove('active');
                // Fade in target section
                if (targetSection) {
                    targetSection.classList.add('active');
                    setTimeout(() => {
                        targetSection.style.opacity = '1';
                    }, 50);
                }
            }, 300);
        } else {
            section.classList.remove('active');
        }
    });

    // Update navigation state
    links.forEach(link => {
        if (link === event.target) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        } else {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        }
    });

    // Scroll into view on mobile
    if (window.innerWidth <= 768) {
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Enhanced stat bars animation
document.querySelectorAll('.stat-bar').forEach((bar) => {
    const position = bar.getAttribute('data-position');
    bar.style.width = '0%';

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    bar.style.width = position;
                }, 200);
                observer.unobserve(bar);
            }
        });
    }, { threshold: 0.5 });

    observer.observe(bar);
});

// Responsive sidebar
const sidebar = document.querySelector('.sidebar');
if (sidebar) {
    const stickyHeader = document.querySelector('.sticky-logo');
    const stickyHeaderHeight = stickyHeader ? stickyHeader.offsetHeight : 0;

    const updateSidebarPosition = () => {
        if (window.innerWidth > 768) {
            sidebar.style.top = `${stickyHeaderHeight + 20}px`;
        } else {
            sidebar.style.top = '0';
        }
    };

    window.addEventListener('resize', updateSidebarPosition);
    updateSidebarPosition();
}

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

// Toggle equipment cards with enhanced functionality
function toggleEquipment(card) {
    const wasExpanded = card.classList.contains('expanded');
    const equipmentSection = card.parentElement;
    const cards = Array.from(equipmentSection.children);
    const originalOrder = parseInt(card.dataset.order);

    // Use transform instead of transition for better performance
    requestAnimationFrame(() => {
        if (wasExpanded) {
            card.classList.add('closing');

            setTimeout(() => {
                card.classList.remove('expanded', 'closing');

                // Restore original order
                const cardArray = Array.from(equipmentSection.children);
                cardArray.sort((a, b) => parseInt(a.dataset.order) - parseInt(b.dataset.order));

                equipmentSection.style.willChange = 'transform';
                cards.forEach(c => c.style.willChange = 'transform');

                cardArray.forEach(c => equipmentSection.appendChild(c));

                // Force reflow
                void equipmentSection.offsetWidth;

                // Reset styles
                equipmentSection.style.willChange = 'auto';
                cards.forEach(c => c.style.willChange = 'auto');
            }, 300);
        } else {
            // Collapse other cards with hardware acceleration
            cards.forEach(otherCard => {
                if (otherCard !== card) {
                    otherCard.style.willChange = 'transform';
                    otherCard.classList.remove('expanded', 'closing');
                }
            });

            // Move clicked card to first position with optimized animation
            card.style.willChange = 'transform';
            equipmentSection.style.willChange = 'transform';

            card.remove();
            equipmentSection.insertBefore(card, equipmentSection.firstChild);

            requestAnimationFrame(() => {
                card.classList.add('expanded');
                // Reset will-change after animation
                setTimeout(() => {
                    card.style.willChange = 'auto';
                    equipmentSection.style.willChange = 'auto';
                    cards.forEach(c => c.style.willChange = 'auto');
                }, 300);
            });
        }
    });
}

