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

    // Scroll the content to the top using the global lenis instance if available
    if (window.lenis) {
        // Use Lenis scrollTo with immediate:true to force instant scroll
        window.lenis.scrollTo(0, { immediate: true });
    } else {
        // Fallback to direct DOM scrolling for browsers without Lenis
        const contentContainer = document.querySelector('.content');
        if (contentContainer) {
            contentContainer.scrollTo({
                top: 0,
                behavior: 'auto'
            });
        }
    }
}

// Background context switching functionality
const backgroundContexts = {
    "overview": {
        text: `Officially, Kimmix's assignment is to document and analyze naturally occurring Arcai phenomena, reporting findings back to Nehixim for potential applications. Unofficially, they've been pursuing a more personal objective: understanding whether Arcai energy could be used to address their own inherent flaws. This self-directed research has led them to explore applications that their superiors would likely disapprove of, creating a precarious situation where discovery could mean reassignment or worse.

What Nehixim doesn't know is that Kimmix has been deliberately documenting his research in ways that can be easily leaked to the wider scientific community. While his handlers believe his findings remain exclusively within their classified databases, Kimmix operates on the principle that knowledge belongs to everyone—not just those with power. Though aware that his research could potentially harm Nehixim's interests, he continues this dangerous balancing act, believing that scientific advancement should transcend factional conflicts. This philosophy has only further isolated him, as neither side fully trusts his intentions.`
    },
    "personality": {
        text: `Before joining Nehixim, Kimmix was a nomadic researcher, traveling between settlements and studying Arcai manifestations as an independent scientist. His unconventional approach to classification systems and tendency to theorize beyond established parameters made him both brilliant and frustratingly difficult to work with. This reputation caught the attention of Nehixim's talent scouts, who saw potential in his unorthodox methodologies.

What drove Kimmix to eventually accept Nehixim's offer wasn't the prestige or resources, but rather a rare condition affecting his neural network. The specialized medical treatment required was only available through Nehixim's advanced healthcare division. This dependency created a complex relationship with his employer—grateful for the treatment that keeps his mind intact, yet increasingly uncomfortable with how his research is being weaponized against rival factions.`
    },
    "objectives": {
        text: `Kimmix maintains few personal relationships, finding social interactions draining and often unnecessary. His closest associates are fellow researchers who communicate primarily through encrypted data channels, sharing findings through coded language that would appear as harmless technical discussions to outside observers. These connections form a loose network of like-minded scientists across faction lines who prioritize knowledge advancement over political allegiances.

In public settings, Kimmix appears detached and often abrasive, intentionally cultivating a reputation as a difficult personality to discourage casual interactions. This carefully constructed facade has been effective in limiting unwanted attention, though it has occasionally backfired when his research requires cooperation from others. Only a select few have glimpsed the dry humor and occasional moments of unexpected compassion that lie beneath his guarded exterior.`
    }
};

function setupContextButtons() {
    const contextButtons = {
        overview: document.getElementById('context-professional'),
        personality: document.getElementById('context-personal'),
        objectives: document.getElementById('context-social')
    };
    const backgroundContent = document.querySelector('.background-content');

    if (!backgroundContent) return;

    // Function to set active button and update content
    function setActiveContext(contextType) {
        // Remove active class from all buttons
        Object.values(contextButtons).forEach(btn => {
            if (btn) btn.classList.remove('active');
        });

        // Add active class to the selected button
        if (contextButtons[contextType]) {
            contextButtons[contextType].classList.add('active');
        }

        // Format the text to create paragraphs
        const context = backgroundContexts[contextType];
        if (context) {
            // Add animation class
            backgroundContent.classList.add('changing');

            // Update the content with a slight delay for animation
            setTimeout(() => {
                const paragraphs = context.text.split('\n\n').map(p =>
                    `<p class="info-text">${p.trim()}</p>`
                ).join('');

                backgroundContent.innerHTML = paragraphs;

                // Remove the animation class after content is updated
                setTimeout(() => {
                    backgroundContent.classList.remove('changing');
                }, 100);
            }, 300);
        }
    }

    // Add click event listeners to context buttons
    Object.entries(contextButtons).forEach(([contextType, button]) => {
        if (button) {
            button.addEventListener('click', () => {
                setActiveContext(contextType);
            });
        }
    });
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

// Quotes functionality
let kimmixQuotes = []; // Will be populated from JSON file
let quoteHistory = []; // Keep track of recently shown quotes
const historySize = 15; // How many quotes to remember (avoid repeating)
const quoteHistoryKey = 'kimmixQuoteHistory'; // localStorage key
let quoteChangeInterval = null; // Store interval reference for clearing
const QUOTE_DISPLAY_TIME = 60000; // 60 seconds (increased from 15 seconds)
let typeInterval = null; // Store the typing interval for cancellation
let isTypingQuote = false; // Flag to track if a quote is currently being typed

// Function to load quote history from localStorage
function loadQuoteHistory() {
    try {
        const storedHistory = localStorage.getItem(quoteHistoryKey);
        if (storedHistory) {
            quoteHistory = JSON.parse(storedHistory);
        }
    } catch (error) {
        console.error('Error loading quote history:', error);
        quoteHistory = []; // Reset on error
    }
}

// Function to save quote history to localStorage
function saveQuoteHistory() {
    try {
        localStorage.setItem(quoteHistoryKey, JSON.stringify(quoteHistory));
    } catch (error) {
        console.error('Error saving quote history:', error);
    }
}

// Implementation of Fisher-Yates shuffle for true randomization
function shuffleArray(array) {
    // Create a copy of the array to avoid modifying the original
    const shuffled = [...array];

    // Fisher-Yates shuffle algorithm
    for (let i = shuffled.length - 1; i > 0; i--) {
        // Generate a random index from 0 to i
        // Use crypto API for better randomness if available
        let j;
        if (window.crypto && window.crypto.getRandomValues) {
            const randomBuffer = new Uint32Array(1);
            window.crypto.getRandomValues(randomBuffer);
            j = Math.floor((randomBuffer[0] / (0xffffffff + 1)) * (i + 1));
        } else {
            j = Math.floor(Math.random() * (i + 1));
        }

        // Swap elements at i and j
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
}

// Function to select a quote that hasn't been shown recently
function selectNextQuote() {
    if (kimmixQuotes.length === 0) return null;

    // Create a pool of candidate quotes by filtering out recently shown ones
    let candidateQuotes = kimmixQuotes.filter(quote =>
        !quoteHistory.some(historyItem =>
            historyItem.text === quote.text
        )
    );

    // If we've exhausted our pool of fresh quotes, use all quotes
    if (candidateQuotes.length === 0) {
        console.log("All quotes have been shown recently, resetting...");
        candidateQuotes = kimmixQuotes;
    }

    // Shuffle the candidates for true randomness
    const shuffledCandidates = shuffleArray(candidateQuotes);

    // Select the first quote from the shuffled array
    const selectedQuote = shuffledCandidates[0];

    // Add the selected quote to history
    quoteHistory.unshift({
        text: selectedQuote.text,
        source: selectedQuote.source,
        timestamp: Date.now()
    });

    // Trim history to maintain historySize
    if (quoteHistory.length > historySize) {
        quoteHistory.splice(historySize);
    }

    // Save updated history
    saveQuoteHistory();

    return selectedQuote;
}

// Function to fetch quotes from JSON file
async function loadQuotes() {
    try {
        const response = await fetch('../assets/data/quotes.json');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        kimmixQuotes = data.quotes;
        // Load quote history from localStorage
        loadQuoteHistory();
        // Set up automatic rotation
        quoteChangeInterval = setInterval(updateQuote, QUOTE_DISPLAY_TIME);
        // Add click handler to the quote block
        setupQuoteClickHandler();
    } catch (error) {
        console.error('Error loading quotes:', error);
    }
}

// Set up click handler for manual quote changing
function setupQuoteClickHandler() {
    const quoteBlock = document.getElementById('rotating-quote');
    if (quoteBlock) {
        quoteBlock.addEventListener('click', () => {
            // Prevent rapid clicking while a quote is animating
            if (isTypingQuote) return;

            // Reset interval and show new quote
            clearInterval(quoteChangeInterval);
            updateQuote();
            quoteChangeInterval = setInterval(updateQuote, QUOTE_DISPLAY_TIME);

            // Add a subtle feedback animation
            quoteBlock.classList.add('clicked');
            setTimeout(() => {
                quoteBlock.classList.remove('clicked');
            }, 300);
        });
    }
}

// Function to update the quote with typing animation
function updateQuote() {
    const quoteBlock = document.getElementById('rotating-quote');
    if (!quoteBlock || kimmixQuotes.length === 0) return;
    // Get next non-repeating quote
    const nextQuote = selectNextQuote();
    if (!nextQuote) return;

    const quoteText = quoteBlock.querySelector('p');
    const quoteCite = quoteBlock.querySelector('cite');

    if (quoteText && quoteCite) {
        // Store the new quote text
        const newQuoteText = nextQuote.text;
        const newCiteText = `— Kimmix, ${nextQuote.source}`;

        // Disable interaction during animation
        isTypingQuote = true;

        // Fade transition
        quoteBlock.classList.add('fading');

        setTimeout(() => {
            // Clear current content
            quoteText.textContent = '';
            quoteCite.style.opacity = '0';
            quoteCite.textContent = newCiteText;

            // Remove fading class
            quoteBlock.classList.remove('fading');

            // Type animation for quote text
            let charIndex = 0;
            typeInterval = setInterval(() => {
                if (charIndex < newQuoteText.length) {
                    quoteText.textContent += newQuoteText.charAt(charIndex);
                    charIndex++;
                } else {
                    // Animation complete
                    clearInterval(typeInterval);
                    typeInterval = null;

                    // Fade in the citation
                    quoteCite.style.transition = 'opacity 0.5s ease';
                    setTimeout(() => {
                        quoteCite.style.opacity = '1';
                        isTypingQuote = false;
                    }, 100);
                }
            }, 15);
        }, 200);
    }
}

// Initialize smooth scrolling with Lenis if available
function initSmoothScroll() {
    if (typeof Lenis !== 'undefined') {
        // Create Lenis instance and store it globally
        window.lenis = new Lenis({
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
            window.lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);
    }
}

// Run initial setup
document.addEventListener('DOMContentLoaded', () => {
    // Show default content
    showContent('info');

    // Initialize context buttons
    setupContextButtons();

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

    // Load quotes from JSON file
    loadQuotes();
});

