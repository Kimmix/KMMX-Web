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

// Quotes functionality
let kimmixQuotes = []; // Will be populated from JSON file
let quoteHistory = []; // Keep track of recently shown quotes
const historySize = 15; // How many quotes to remember (avoid repeating)
const quoteHistoryKey = 'kimmixQuoteHistory'; // localStorage key

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
    // but prefer ones shown least recently
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

    // Log quote rotation for debugging
    console.log(`Quote rotation: "${selectedQuote.text.substring(0, 30)}..." (${quoteHistory.length} in history)`);

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

        // Start the quote rotation once quotes are loaded
        updateQuote();
        setInterval(updateQuote, 15000); // Change quote every 15 seconds
    } catch (error) {
        console.error('Error loading quotes:', error);
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
        }, 15); // Speed of typing
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

    // Load quotes from JSON file
    loadQuotes();
});

