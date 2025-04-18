document.addEventListener("DOMContentLoaded", () => {
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
                card.style.setProperty('--glow-opacity', '1');
                frame = null;
            });
        }
    };

    cards.forEach(card => {
        // Use passive event listener for better scroll performance
        card.addEventListener('mousemove', e => updateMousePosition(e, card), { passive: true });

        // Fade out glow before resetting position
        card.addEventListener('mouseleave', () => {
            if (frame) {
                cancelAnimationFrame(frame);
                frame = null;
            }

            // First fade out the glow
            card.style.setProperty('--glow-opacity', '0');

            // Then reset position after fade
            setTimeout(() => {
                requestAnimationFrame(() => {
                    card.style.setProperty('--mouse-x', '50%');
                    card.style.setProperty('--mouse-y', '50%');
                });
            }, 300);
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

// Toggle equipment cards with enhanced functionality
function toggleEquipment(card) {
    const wasExpanded = card.classList.contains('expanded');
    const equipmentSection = card.parentElement;
    const cards = Array.from(equipmentSection.children);
    const isMobile = window.innerWidth <= 768;

    // Use transform instead of transition for better performance
    requestAnimationFrame(() => {
        if (wasExpanded) {
            card.classList.add('closing');

            setTimeout(() => {
                card.classList.remove('expanded', 'closing');

                // Only reorder on desktop
                if (!isMobile) {
                    // Restore original order
                    const cardArray = Array.from(equipmentSection.children);
                    cardArray.sort((a, b) => parseInt(a.dataset.order) - parseInt(b.dataset.order));
                    cardArray.forEach(c => equipmentSection.appendChild(c));
                }

                // Reset styles
                cards.forEach(c => c.style.willChange = 'auto');
            }, 300);
        } else {
            // Collapse other cards
            cards.forEach(otherCard => {
                if (otherCard !== card) {
                    otherCard.style.willChange = 'transform';
                    otherCard.classList.remove('expanded', 'closing');
                }
            });

            // Only move card on desktop
            if (!isMobile) {
                card.remove();
                equipmentSection.insertBefore(card, equipmentSection.firstChild);
            }

            requestAnimationFrame(() => {
                card.classList.add('expanded');
                // Reset will-change after animation
                setTimeout(() => {
                    cards.forEach(c => c.style.willChange = 'auto');
                }, 300);
            });
        }
    });
}

