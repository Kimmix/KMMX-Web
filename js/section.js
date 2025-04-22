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

// Throttling function to limit how often a function runs
function throttle(callback, delay = 100) {
    let lastCall = 0;
    return function(...args) {
        const now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            callback.apply(this, args);
        }
    };
}

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

// Initialize mouse tracking for hover effects - throttled to improve performance
const handleMouseMove = throttle((e) => {
    const cards = document.querySelectorAll('.equipment-card:hover, .stat-card:hover, .visualization:hover, .skill-card:hover');

    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
        card.style.setProperty('--card-glow-opacity', '1');
        card.style.setProperty('--glow-opacity', '1');
    });
}, 16); // ~60fps (1000ms/60 ≈ 16ms)

document.addEventListener('mousemove', handleMouseMove);

// Quotes functionality - optimized
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
    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
        let j;
        if (window.crypto && window.crypto.getRandomValues) {
            const randomBuffer = new Uint32Array(1);
            window.crypto.getRandomValues(randomBuffer);
            j = Math.floor((randomBuffer[0] / (0xffffffff + 1)) * (i + 1));
        } else {
            j = Math.floor(Math.random() * (i + 1));
        }

        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
}

// Function to select a quote that hasn't been shown recently
function selectNextQuote() {
    if (kimmixQuotes.length === 0) return null;

    let candidateQuotes = kimmixQuotes.filter(quote =>
        !quoteHistory.some(historyItem =>
            historyItem.text === quote.text
        )
    );

    if (candidateQuotes.length === 0) {
        console.log("All quotes have been shown recently, resetting...");
        candidateQuotes = kimmixQuotes;
    }

    const shuffledCandidates = shuffleArray(candidateQuotes);
    const selectedQuote = shuffledCandidates[0];

    quoteHistory.unshift({
        text: selectedQuote.text,
        source: selectedQuote.source,
        timestamp: Date.now()
    });

    if (quoteHistory.length > historySize) {
        quoteHistory.splice(historySize);
    }

    saveQuoteHistory();

    return selectedQuote;
}

// Function to fetch quotes from JSON file with caching
async function loadQuotes() {
    try {
        const cachedQuotes = sessionStorage.getItem('kimmixQuotes');
        if (cachedQuotes) {
            kimmixQuotes = JSON.parse(cachedQuotes).quotes;
            console.log('Loaded quotes from cache');
        } else {
            const response = await fetch('./assets/data/quotes.json');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            kimmixQuotes = data.quotes;

            try {
                sessionStorage.setItem('kimmixQuotes', JSON.stringify({ quotes: kimmixQuotes }));
            } catch (e) {
                console.warn('Failed to cache quotes', e);
            }
        }

        loadQuoteHistory();
        quoteChangeInterval = setInterval(updateQuote, QUOTE_DISPLAY_TIME);
        setupQuoteClickHandler();
        updateQuote();
    } catch (error) {
        console.error('Error loading quotes:', error);
    }
}

// Set up click handler for manual quote changing
function setupQuoteClickHandler() {
    const quoteBlock = document.getElementById('rotating-quote');
    if (quoteBlock) {
        quoteBlock.addEventListener('click', () => {
            if (isTypingQuote) return;

            clearInterval(quoteChangeInterval);
            updateQuote();
            quoteChangeInterval = setInterval(updateQuote, QUOTE_DISPLAY_TIME);

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
    const nextQuote = selectNextQuote();
    if (!nextQuote) return;

    const quoteText = quoteBlock.querySelector('p');
    const quoteCite = quoteBlock.querySelector('cite');

    if (quoteText && quoteCite) {
        const newQuoteText = nextQuote.text;
        const newCiteText = `— Kimmix, ${nextQuote.source}`;

        isTypingQuote = true;

        quoteBlock.classList.add('fading');

        setTimeout(() => {
            quoteText.textContent = '';
            quoteCite.style.opacity = '0';
            quoteCite.textContent = newCiteText;

            quoteBlock.classList.remove('fading');

            let charIndex = 0;
            typeInterval = setInterval(() => {
                if (charIndex < newQuoteText.length) {
                    quoteText.textContent += newQuoteText.charAt(charIndex);
                    charIndex++;
                } else {
                    clearInterval(typeInterval);
                    typeInterval = null;

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

// Run initial setup
document.addEventListener('DOMContentLoaded', () => {
    // Add class to body to inform CSS that we're not using Lenis
    document.body.classList.add('no-lenis');

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

    // Load quotes from JSON file with optimization
    window.requestIdleCallback ?
        window.requestIdleCallback(() => loadQuotes()) :
        setTimeout(loadQuotes, 100);
});

