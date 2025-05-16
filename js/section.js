// Configurable parameters
const HISTORY_SIZE = 15;                 // Number of quotes to keep in history
const QUOTE_DISPLAY_TIME = 60000;        // Quote rotation interval (60 seconds)
const QUOTE_HISTORY_KEY = 'kimmixQuoteHistory';
const TYPING_SPEED = 15;                 // Speed of quote typing animation (ms)
const THROTTLE_DELAY = 16;               // Mouse move throttle delay for hover effects

// Background context switching functionality
const backgroundContexts = {
    "overview": {
        text: `Before joining Nehixim, Kimmix was a nomadic researcher, traveling between settlements and studying Arcai manifestations as an independent scientist. His unconventional approach to classification systems and tendency to theorize beyond established parameters made him both brilliant and frustratingly difficult to work with. This reputation caught the attention of Nehixim's scouts, who saw potential in his unorthodox methodologies.

        What drove Kimmix to eventually accept Nehixim's offer wasn't the prestige or resources, but rather a rare condition affecting his neural network. The specialized medical treatment required was only available through Nehixim's advanced healthcare division. This dependency created a complex relationship with his employer—grateful for the treatment that keeps his mind intact, yet increasingly uncomfortable with how his research is being weaponized against the general.`
    },
    "personality": {
        text: `Kimmix maintains few personal relationships, finding social interactions draining and often unnecessary. His closest associates are fellow researchers who communicate primarily through encrypted data channels, sharing findings through coded language that would appear as harmless technical discussions to outside observers. These connections form a loose network of like-minded scientists across faction lines who prioritize knowledge advancement over political allegiances.

        In public settings, Kimmix appears detached and often abrasive, intentionally cultivating a reputation as a difficult personality to discourage casual interactions. This carefully constructed facade has been effective in limiting unwanted attention, though it has occasionally backfired when his research requires cooperation from others. Only a select few have glimpsed the dry humor and occasional moments of unexpected compassion that lie beneath his guarded exterior.`
    },
    "objectives": {
        text: `Officially, Kimmix's assignment is to document and analyze naturally occurring Arcai phenomena, reporting findings back to Nehixim for potential applications. Unofficially, they've been pursuing a more personal objective: understanding whether Arcai energy could be used to address their own inherent flaws. This self-directed research has led them to explore applications that their superiors would likely disapprove of, creating a precarious situation where discovery could mean reassignment or worse.

        What Nehixim doesn't know is that Kimmix has been deliberately documenting his research in ways that can be easily leaked to the wider scientific community. While his handlers believe his findings remain exclusively within their classified databases, Kimmix operates on the principle that knowledge belongs to everyone—not just those with power. Though aware that his research could potentially harm Nehixim's interests, he continues this dangerous balancing act, believing that scientific advancement should transcend factional conflicts. This philosophy has only further isolated him, as neither side fully trusts his intentions.`
    }
};

// Variables for quote system
let kimmixQuotes = [];
let quoteHistory = [];
let quoteChangeInterval = null;
let typeInterval = null;
let isTypingQuote = false;

// Content switching for main sections
function showContent(id, e) {
    if (e) e.preventDefault();

    // Get the actual link element if the event came from a touch target span inside it
    let targetElement = e?.target;
    if (targetElement && targetElement.classList.contains('touch-target')) {
        targetElement = targetElement.closest('a');
    }

    // Update content sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(id).classList.add('active');

    // Update navigation links
    document.querySelectorAll('.sidebar a').forEach(link => {
        link.classList.remove('active');
    });

    if (targetElement) {
        targetElement.classList.add('active');
    } else {
        document.querySelector(`.sidebar a[href="#${id}"]`).classList.add('active');
    }
}

function setupContextButtons() {
    const contextButtons = {
        overview: document.getElementById('context-professional'),
        personality: document.getElementById('context-personal'),
        objectives: document.getElementById('context-social')
    };
    const backgroundContent = document.querySelector('.background-content');

    if (!backgroundContent) return;

    // Set active button and update content
    const setActiveContext = (contextType) => {
        // Update button states
        Object.values(contextButtons).forEach(btn => btn?.classList.remove('active'));
        contextButtons[contextType]?.classList.add('active');

        const context = backgroundContexts[contextType];
        if (context) {
            backgroundContent.classList.add('changing');

            setTimeout(() => {
                const paragraphs = context.text.split('\n\n')
                    .map(p => `<p class="info-text">${p.trim()}</p>`)
                    .join('');

                backgroundContent.innerHTML = paragraphs;

                setTimeout(() => backgroundContent.classList.remove('changing'), 100);
            }, 300);
        }
    };

    // Add click event listeners
    Object.entries(contextButtons).forEach(([contextType, button]) => {
        button?.addEventListener('click', () => setActiveContext(contextType));
    });
}

// Mouse tracking for hover effects
const handleMouseMove = throttle((e) => {
    document.querySelectorAll('.hover-glow:hover')
        .forEach(card => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
            card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
            card.style.setProperty('--glow-opacity', '1');
        });
}, THROTTLE_DELAY);

// Add mouseleave event to reset glow opacity
function setupHoverEffects() {
    document.querySelectorAll('.hover-glow').forEach(card => {
        card.addEventListener('mouseleave', () => {
            card.style.setProperty('--glow-opacity', '0');
        });
    });
}

document.addEventListener('mousemove', handleMouseMove);

// Load quotes from JSON with caching
async function loadQuotes() {
    try {
        // Try to load from session cache first
        const cachedQuotes = sessionStorage.getItem('kimmixQuotes');
        if (cachedQuotes) {
            kimmixQuotes = JSON.parse(cachedQuotes).quotes;
        } else {
            const response = await fetch('./assets/data/quotes.json');
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const data = await response.json();
            kimmixQuotes = data.quotes;

            try {
                sessionStorage.setItem('kimmixQuotes', JSON.stringify({ quotes: kimmixQuotes }));
            } catch (e) {
                console.warn('Failed to cache quotes', e);
            }
        }

        // Load history and setup quote rotation
        loadQuoteHistory();
        setupQuoteClickHandler();
        updateQuote();
        quoteChangeInterval = setInterval(updateQuote, QUOTE_DISPLAY_TIME);
    } catch (error) {
        console.error('Error loading quotes:', error);
    }
}

// Load/save quote history
function loadQuoteHistory() {
    try {
        const storedHistory = localStorage.getItem(QUOTE_HISTORY_KEY);
        if (storedHistory) quoteHistory = JSON.parse(storedHistory);
    } catch (error) {
        console.error('Error loading quote history:', error);
        quoteHistory = [];
    }
}

function saveQuoteHistory() {
    try {
        localStorage.setItem(QUOTE_HISTORY_KEY, JSON.stringify(quoteHistory));
    } catch (error) {
        console.error('Error saving quote history:', error);
    }
}

// Fisher-Yates shuffle for randomization
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Select a quote that hasn't been shown recently
function selectNextQuote() {
    if (!kimmixQuotes.length) return null;

    // Filter out recently shown quotes
    let candidateQuotes = kimmixQuotes.filter(quote =>
        !quoteHistory.some(item => item.text === quote.text)
    );

    // If all quotes shown recently, reset
    if (!candidateQuotes.length) {
        candidateQuotes = kimmixQuotes;
    }

    const selectedQuote = shuffleArray(candidateQuotes)[0];

    // Update history
    quoteHistory.unshift({
        text: selectedQuote.text,
        source: selectedQuote.source,
        timestamp: Date.now()
    });

    if (quoteHistory.length > HISTORY_SIZE) {
        quoteHistory.splice(HISTORY_SIZE);
    }

    saveQuoteHistory();
    return selectedQuote;
}

// Set up click handler for manual quote changing
function setupQuoteClickHandler() {
    const quoteBlock = document.getElementById('rotating-quote');
    if (!quoteBlock) return;

    quoteBlock.addEventListener('click', () => {
        if (isTypingQuote) return;

        clearInterval(quoteChangeInterval);
        updateQuote();
        quoteChangeInterval = setInterval(updateQuote, QUOTE_DISPLAY_TIME);

        quoteBlock.classList.add('clicked');
        setTimeout(() => quoteBlock.classList.remove('clicked'), 300);
    });
}

// Update quote with typing animation
function updateQuote() {
    const quoteBlock = document.getElementById('rotating-quote');
    if (!quoteBlock || !kimmixQuotes.length) return;

    // Prevent multiple quote animations from running simultaneously
    if (isTypingQuote) return;

    const nextQuote = selectNextQuote();
    if (!nextQuote) return;

    const quoteText = quoteBlock.querySelector('p');
    const quoteCite = quoteBlock.querySelector('cite');
    if (!quoteText || !quoteCite) return;

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
                quoteText.textContent += newQuoteText.charAt(charIndex++);
            } else {
                clearInterval(typeInterval);
                typeInterval = null;
                quoteCite.style.transition = 'opacity 0.5s ease';
                setTimeout(() => {
                    quoteCite.style.opacity = '1';
                    isTypingQuote = false;
                }, 100);
            }
        }, TYPING_SPEED);
    }, 200);
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    // Add no-lenis class to body
    document.body.classList.add('no-lenis');

    // Show default content and setup context buttons
    showContent('info');
    setupContextButtons();

    // Add hover-glow class to all elements that need hover effects
    document.querySelectorAll('.card, .visualization, .profile-badge, .profile-row').forEach(card => {
        if (!card.classList.contains('hover-glow')) {
            card.classList.add('hover-glow');
        }
    });

    // Setup hover effect leave handlers
    setupHoverEffects();

    // Load quotes when browser is idle or after slight delay
    window.requestIdleCallback
        ? window.requestIdleCallback(() => loadQuotes())
        : setTimeout(loadQuotes, 100);
});

