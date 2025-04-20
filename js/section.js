document.addEventListener("DOMContentLoaded", () => {
    // Equipment card hover effect
    const cards = document.querySelectorAll('.equipment-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / card.offsetWidth) * 100;
            const y = ((e.clientY - rect.top) / card.offsetHeight) * 100;

            requestAnimationFrame(() => {
                card.style.setProperty('--mouse-x', `${x}%`);
                card.style.setProperty('--mouse-y', `${y}%`);
                card.style.setProperty('--glow-opacity', '1');
            });
        }, { passive: true });

        card.addEventListener('mouseleave', () => {
            card.style.setProperty('--glow-opacity', '0');
        });
    });

    // Handle stat cards hover effects
    const statCards = document.querySelectorAll('.stat-card');

    statCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            requestAnimationFrame(() => {
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            });
        }, { passive: true });
    });

    // Animate stat meters on page load with simple fade in
    setTimeout(() => {
        document.querySelectorAll('.meter-fill').forEach((meter, index) => {
            const width = meter.style.width;
            meter.style.width = '0%';

            setTimeout(() => {
                meter.style.transition = 'width 1s ease-out';
                meter.style.width = width;
            }, 100 + (index * 100));
        });
    }, 300);

    // Simple hover for arcai orb
    const arcaiOrb = document.querySelector('.arcai-orb');
    if (arcaiOrb) {
        arcaiOrb.addEventListener('mousemove', (e) => {
            const rect = arcaiOrb.getBoundingClientRect();
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // Calculate distance from center
            const distX = (mouseX - centerX) / (rect.width / 2);
            const distY = (mouseY - centerY) / (rect.height / 2);

            // Apply subtle movement
            requestAnimationFrame(() => {
                arcaiOrb.style.transform = `translate(${distX * 5}px, ${distY * 5}px)`;
            });

            // Mild glow increase on hover
            const orbContent = arcaiOrb.querySelector('.orb-content');
            orbContent.style.boxShadow = `0 0 25px rgba(203, 32, 64, 0.4)`;
        }, { passive: true });

        arcaiOrb.addEventListener('mouseleave', () => {
            arcaiOrb.style.transition = 'transform 0.5s ease';
            arcaiOrb.style.transform = 'translate(0, 0)';

            const orbContent = arcaiOrb.querySelector('.orb-content');
            orbContent.style.transition = 'box-shadow 0.5s ease';
            orbContent.style.boxShadow = '0 0 20px rgba(203, 32, 64, 0.3)';

            setTimeout(() => {
                arcaiOrb.style.transition = '';
                orbContent.style.transition = '';
            }, 500);
        });
    }

    // Skill card hover effect
    const skillCards = document.querySelectorAll('.skill-card');

    skillCards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            requestAnimationFrame(() => {
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
                card.style.setProperty('--glow-opacity', '1');
            });
        }, { passive: true });

        card.addEventListener('mouseleave', () => {
            card.style.setProperty('--glow-opacity', '0');
        });
    });

    // Dual-purpose skill mode switching functionality
    document.querySelectorAll('.mode-tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
            // Get the parent card and find all tabs and content within it
            const card = this.closest('.skill-card');
            const mode = this.getAttribute('data-mode');

            // Remove active class from all tabs
            card.querySelectorAll('.mode-tab').forEach(function(t) {
                t.classList.remove('active');
            });

            // Remove active class from all mode content
            card.querySelectorAll('.mode-content').forEach(function(content) {
                content.classList.remove('active');
            });

            // Add active class to selected tab
            this.classList.add('active');

            // Add active class to selected content
            card.querySelector(`.${mode}-mode`).classList.add('active');
        });
    });
});

//! Navigation
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

// Toggle equipment cards
function toggleEquipment(card) {
    const wasExpanded = card.classList.contains('expanded');
    const equipmentSection = card.parentElement;
    const cards = Array.from(equipmentSection.children);

    if (wasExpanded) {
        // Collapse animation
        card.classList.add('closing');

        setTimeout(() => {
            card.classList.remove('expanded', 'closing');
        }, 400);
    } else {
        // Close any other expanded cards first
        cards.forEach(otherCard => {
            if (otherCard !== card && otherCard.classList.contains('expanded')) {
                otherCard.classList.add('closing');
                setTimeout(() => {
                    otherCard.classList.remove('expanded', 'closing');
                }, 300);
            }
        });

        // Expand the clicked card
        setTimeout(() => {
            card.classList.add('expanded');
        }, 10);
    }
}

// Toggle skill cards
function toggleSkill(card) {
    // Toggle between collapsed and expanded state
    if (card.classList.contains('collapsed')) {
        card.classList.remove('collapsed');
        card.classList.add('expanded');
    } else if (card.classList.contains('expanded')) {
        card.classList.remove('expanded');
        card.classList.add('collapsed');
    } else {
        // First click - collapse all cards first, then expand the clicked one
        const skillSection = card.parentElement;
        const cards = Array.from(skillSection.children);

        // Collapse all other cards
        cards.forEach(otherCard => {
            if (otherCard !== card) {
                otherCard.classList.add('collapsed');
                otherCard.classList.remove('expanded');
            }
        });

        // Expand the clicked card
        card.classList.add('expanded');
    }
}

