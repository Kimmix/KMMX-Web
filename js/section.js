// Configurable parameters
const HISTORY_SIZE = 15;                 // Number of quotes to keep in history
const QUOTE_DISPLAY_TIME = 60000;        // Quote rotation interval (60 seconds)
const QUOTE_HISTORY_KEY = 'kimmixQuoteHistory';
const THROTTLE_DELAY = 16;               // Mouse move throttle delay for hover effects

// Background context switching functionality
const backgroundContexts = {
    "overview": {
        text: `Kimmix used to be a nomadic researcher, traveling between settlements and studying Arcai manifestations independently. His approach to classification was unconventional. He'd theorize beyond established parameters, which made him both brilliant and difficult to work with. This caught Nehixim's attention.

        What drew him to join wasn't prestige, but access. Nehixim controlled the only stable, concentrated Arcai sample in existence: the key to questions that had driven his entire career. He believed their pitch about advancing humanity through responsible research, thinking he could maintain his scientific integrity within their organization. That illusion didn't last. The reality of their priorities became clear, and now he's trapped, bound by contract, his reputation tied to them, and that Arcai sample still inaccessible anywhere else. The very thing that drew him in became his cage. He tells himself there are reasons to stay beyond the contract.`
    },
    "personality": {
        text: `Some would call him principled. Others would call him complicit. He's learned to live with both labels, though he doesn't wear either comfortably. His version of doing the right thing doesn't look heroic. It's messier than that, compromised by the situations he's put himself in.

        Kimmix doesn't maintain many personal relationships. He finds most social interactions draining and unnecessary. His closest contacts are fellow researchers who communicate through encrypted channels, sharing findings in coded language that appears as routine technical discussion. They form a loose network of scientists across faction lines who prioritize knowledge over politics. In public, he's deliberately detached and abrasive, a reputation that keeps unwanted attention away but occasionally backfires when cooperation is needed. Whether the isolation protects him or punishes him, he's never quite sure. Only a few have glimpsed the dry humor and unexpected compassion beneath the surface.`
    },
    "objectives": {
        text: `Officially, Kimmix documents naturally occurring Arcai phenomena and reports findings to Nehixim for potential applications. Unofficially, he's pursuing his own goal: understanding whether Arcai energy could address his own flaws. This unauthorized research could mean reassignment or worse if discovered. Sometimes he wonders if his obsession is entirely his own.

        What Nehixim doesn't know is that he's been documenting everything in ways that can be easily leaked to the wider scientific community. While his handlers think findings stay in classified databases, Kimmix operates on a different principle: knowledge belongs to everyone, not just those with power. He's aware this could harm Nehixim's interests, but continues anyway. Scientific progress shouldn't be locked behind factional walls. It's his way of dealing with the compromises he's made. Share the knowledge, maybe offset some of the damage. He doesn't ask himself if this makes him a traitor or a hero. The answer would be too complicated either way.`
    }
};

// Variables for quote system
let kimmixQuotes = [];
let quoteHistory = [];
let quoteChangeInterval = null;
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

// Update quote with GSAP ScrambleTextPlugin animation
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
        quoteCite.style.opacity = '0';
        quoteCite.textContent = newCiteText;
        quoteBlock.classList.remove('fading');        // Use GSAP ScrambleTextPlugin for text reveal animation
        gsap.to(quoteText, {
            duration: 1.5,
            scrambleText: {
                text: newQuoteText,
                chars: "01_ ",  // Minimalist character set for a cleaner effect
                revealDelay: 0,
                speed: 0.8,  // Slightly slower for more visible effect
                delimiter: "",
                ease: "power2.inOut"
            },
            onComplete: () => {
                // After scramble animation completes, show the citation
                gsap.to(quoteCite, {
                    opacity: 1,
                    duration: 0.6,
                    delay: 0.2,
                    onComplete: () => {
                        isTypingQuote = false;
                    }
                });
            }
        });
    }, 200);
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    // Register GSAP plugins
    gsap.registerPlugin(ScrambleTextPlugin);

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

