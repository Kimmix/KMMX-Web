// Content switching for main sections
function showContent(id, e) {
    // Prevent default action if it's a link
    if (e) e.preventDefault();

    // Hide all content sections
    const allSections = document.querySelectorAll('.content-section');
    allSections.forEach(section => {
        section.classList.remove('active');
    });

    // Show the selected section
    const selectedSection = document.getElementById(id);
    selectedSection.classList.add('active');

    // Update the active class on navigation links
    const navLinks = document.querySelectorAll('.sidebar a');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });

    // Add active class to clicked link
    if (e && e.target) {
        e.target.classList.add('active');
    } else {
        document.querySelector(`.sidebar a[href="#${id}"]`).classList.add('active');
    }
}

// Tab switching for the info section
function switchTab(tabId) {
    // Hide all tab contents
    const allTabContents = document.querySelectorAll('.tab-content');
    allTabContents.forEach(tab => {
        tab.classList.remove('active');
    });

    // Show the selected tab
    const selectedTab = document.getElementById(tabId);
    selectedTab.classList.add('active');

    // Update the active class on tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });

    // Add active class to clicked button
    const clickedButton = document.querySelector(`.tab-btn[onclick="switchTab('${tabId}')"]`);
    if (clickedButton) {
        clickedButton.classList.add('active');
    }
}

// Initialize mouse tracking for hover effects
document.addEventListener('mousemove', e => {
    const cards = document.querySelectorAll('.equipment-card, .stat-card, .visualization, .skill-card');

    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);

        // Add glow effect when mouse is over the card
        if (
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom
        ) {
            card.style.setProperty('--card-glow-opacity', '1');
            card.style.setProperty('--glow-opacity', '1');
        } else {
            card.style.setProperty('--card-glow-opacity', '0');
            card.style.setProperty('--glow-opacity', '0');
        }
    });
});

// Rotating quotes functionality
const kimmixQuotes = [
    {
        text: "Nehixim funds the research, but they don't own the knowledge. I've made my peace with contradiction—it keeps me fed and gives me purpose. The rest is just politics.",
        source: "Personal Research Journal"
    },
    {
        text: "I understand Arcai better than I understand myself. Maybe that's why I keep looking for answers in its patterns that I can't find in my own code.",
        source: "Personal Research Journal"
    },
    {
        text: "Other Protogens seek freedom. I seek meaning. My research is the only place where contradictions make sense.",
        source: "Conversation with Nehixim Handler"
    },
    {
        text: "There's an elegance to Arcai energy that transcends faction politics. Its patterns don't care who studies them or why.",
        source: "Research Notes"
    },
    {
        text: "Knowledge is neutral. It's what we do with it that matters. Nehixim wants weapons, I want understanding. For now, our paths run parallel.",
        source: "Audio Log #347"
    },
    {
        text: "I avoid others not from fear, but pragmatism. Attachments create variables I cannot afford in my work.",
        source: "Psychological Evaluation"
    },
    {
        text: "The irony isn't lost on me that I help a faction hunting 'defectives' like myself. But purpose is a luxury few of us have. I've chosen mine.",
        source: "Encrypted Message"
    },
    {
        text: "Every breakthrough I achieve both secures my position with Nehixim and provides me with something to share with the wider world. A delicate balance.",
        source: "Lab Recording"
    },
    {
        text: "The only true obstacle to understanding Arcai is the hesitation to explore its full potential. I do not share this limitation.",
        source: "Personal Research Journal"
    }
];

// Function to update the quote with typing animation
function updateQuote() {
    const quoteBlock = document.getElementById('rotating-quote');
    if (!quoteBlock) return;

    // Get current quote index from data attribute or default to 0
    let currentIndex = parseInt(quoteBlock.getAttribute('data-index') || '0');

    // Select next quote
    currentIndex = (currentIndex + 1) % kimmixQuotes.length;
    const nextQuote = kimmixQuotes[currentIndex];

    const quoteText = quoteBlock.querySelector('p');
    const quoteCite = quoteBlock.querySelector('cite');

    if (quoteText && quoteCite) {
        // Store the new quote text
        const newQuoteText = nextQuote.text;
        const newCiteText = `— Kimmix, ${nextQuote.source}`;

        // Clear current content and prepare for typing animation
        quoteText.innerHTML = '';
        quoteCite.style.opacity = '0';

        // Type animation for quote text
        let charIndex = 0;
        const typeInterval = setInterval(() => {
            if (charIndex < newQuoteText.length) {
                quoteText.textContent += newQuoteText.charAt(charIndex);
                charIndex++;
            } else {
                // When typing is complete, update citation with fade in
                clearInterval(typeInterval);
                quoteCite.textContent = newCiteText;
                quoteCite.style.transition = 'opacity 0.5s ease';
                setTimeout(() => {
                    quoteCite.style.opacity = '1';
                }, 100);
            }
        }, 15); // Speed of typing - adjust as needed

        // Store current index
        quoteBlock.setAttribute('data-index', currentIndex.toString());
    }
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

// Run initial setup
document.addEventListener('DOMContentLoaded', () => {
    // Show default content
    showContent('info');

    // Make sure the hover effects work correctly
    document.querySelectorAll('.equipment-card, .stat-card, .visualization, .skill-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.setProperty('--card-glow-opacity', '1');
            card.style.setProperty('--glow-opacity', '1');
        });

        card.addEventListener('mouseleave', () => {
            card.style.setProperty('--card-glow-opacity', '0');
            card.style.setProperty('--glow-opacity', '0');
        });
    });

    // Initialize smooth scrolling
    initSmoothScroll();

    // Start the quote rotation
    updateQuote(); // Show first random quote
    setInterval(updateQuote, 15000); // Change quote every 15 seconds
});

