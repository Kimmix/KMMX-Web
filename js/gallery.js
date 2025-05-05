// Main gallery elements
const galleryGrid = document.getElementById('galleryGrid');
const imagePopup = document.getElementById('imagePopup');
const popupImage = document.getElementById('popupImage');
const popupTitle = document.getElementById('popupTitle');
const popupArtist = document.getElementById('popupArtist');
const closePopupBtn = document.getElementById('closePopup');
const prevImageBtn = document.getElementById('prevImage');
const nextImageBtn = document.getElementById('nextImage');
const filterButtons = document.querySelectorAll('.filter-btn');
const searchInput = document.getElementById('gallerySearch');
const searchButton = document.getElementById('searchButton');
const clearSearchBtn = document.getElementById('clearSearchButton');
const sortSelect = document.getElementById('sortSelect');
const itemCountElement = document.getElementById('itemCount');

// Global variables
let galleryItems = [];
let currentItemIndex = 0;
let filteredItems = [];
let currentFilter = 'all';
let currentSearch = '';
let currentSort = 'default';
let resizeTimeout;
let isMobile = window.innerWidth < 768;
let touchStartX = 0;
let touchEndY = 0;
let touchStartY = 0;
let touchEndX = 0;
let popupOpen = false;
let lenis; // Store the Lenis instance

// Initialize smooth scrolling
function initSmoothScroll() {
    lenis = new Lenis({
        duration: 1.0,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        smooth: true,
        smoothTouch: false, // Better performance on touch devices
        touchMultiplier: 2,
        wheelMultiplier: 0.8,
        lerp: 0.08,
    });

    // Connect with GSAP if available
    if (window.gsap && window.ScrollTrigger) {
        lenis.on("scroll", throttle(() => ScrollTrigger.update(), 100));
    }

    // Animation loop using requestAnimationFrame
    requestAnimationFrame(function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    });

    // Expose lenis to window for other scripts
    window.lenis = lenis;
}

// Simple throttle function
function throttle(func, limit) {
    let lastCall = 0;
    return function (...args) {
        const now = Date.now();
        if (now - lastCall >= limit) {
            lastCall = now;
            func.apply(this, args);
        }
    };
}

// Initialize the gallery
async function initGallery() {
    try {
        // Initialize smooth scrolling first for better user experience
        initSmoothScroll();

        // Fetch gallery items from JSON
        const response = await fetch('/assets/gallery/galleryItems.json');
        galleryItems = await response.json();

        // Add category property and index for tracking original order
        galleryItems = galleryItems.map((item, index) => {
            const lowerTitle = item.title.toLowerCase();
            let category = 'other';

            if (lowerTitle.includes('commission')) category = 'commission';
            else if (lowerTitle.includes('gift')) category = 'gift';
            else if (lowerTitle.includes('ych')) category = 'ych';

            return { ...item, category, originalIndex: index };
        });

        // Set filtered items initially to all items
        filteredItems = [...galleryItems];

        // Render the gallery
        renderGallery();

        // Set up event listeners
        setupEventListeners();

        // Initial layout calculation
        setTimeout(resizeAllGridItems, 100);

    } catch (error) {
        console.error('Error loading gallery:', error);
        galleryGrid.innerHTML = '<div class="error-message">Failed to load gallery images. Please try again later.</div>';
    }
}

// Render gallery items
function renderGallery() {
    // Clear gallery
    galleryGrid.innerHTML = '';

    // Update the count
    itemCountElement.textContent = filteredItems.length;

    // Render items in grid view (masonry layout)
    renderGridView();
}

// Render items in grid view (masonry layout)
function renderGridView() {
    // Create and append gallery items
    filteredItems.forEach((item, index) => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.setAttribute('data-index', index);
        galleryItem.style.setProperty('--span', 20);

        // Set animation delay for staggered effect - limit for mobile
        const delay = isMobile ? Math.min(index, 10) * 0.03 : index * 0.05;
        galleryItem.style.setProperty('--delay', `${delay}s`);

        // Create image element and set up load event
        const img = document.createElement('img');
        img.src = item.imgSrc;
        img.alt = item.title;
        img.loading = "lazy";
        img.setAttribute('width', '100%');
        img.setAttribute('height', 'auto');
        img.onload = () => resizeGridItem(galleryItem);

        // Create the overlay content
        const overlay = document.createElement('div');
        overlay.className = 'item-overlay';
        overlay.innerHTML = `
            <h3>${item.title}</h3>
            <h4>${item.artist}</h4>
        `;

        // Append elements to the gallery item
        galleryItem.appendChild(img);
        galleryItem.appendChild(overlay);
        galleryGrid.appendChild(galleryItem);

        // On mobile, make overlay always visible for better UX
        if (isMobile) {
            overlay.style.transform = 'translateY(0)';
        }

        // Add visible class with a delay for staggered appearance
        setTimeout(() => galleryItem.classList.add('visible'), index * 50);
    });

    // Recalculate layout after a short delay
    setTimeout(resizeAllGridItems, 100);
    setTimeout(resizeAllGridItems, 500);
}

// Set up all event listeners
function setupEventListeners() {
    // Track mobile/desktop state for responsive adjustments
    window.addEventListener('resize', debounce(() => {
        const wasMobile = isMobile;
        isMobile = window.innerWidth < 768;

        // If mobile state changed, re-render to adjust layout
        if (wasMobile !== isMobile) {
            renderGallery();
        }
    }, 200));

    // Filter button clicks
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const filter = e.target.getAttribute('data-filter') ||
                e.target.closest('.filter-btn').getAttribute('data-filter');

            // Update active button
            filterButtons.forEach(button => button.classList.remove('active'));
            e.target.closest('.filter-btn').classList.add('active');

            // Filter items and re-render
            currentFilter = filter;
            applyFiltersAndSort();
        });
    });

    // Search functionality
    searchInput.addEventListener('input', debounce(() => {
        currentSearch = searchInput.value.trim().toLowerCase();
        updateClearSearchButton();
        applyFiltersAndSort();
    }, 300));

    searchButton.addEventListener('click', () => {
        currentSearch = searchInput.value.trim().toLowerCase();
        updateClearSearchButton();
        applyFiltersAndSort();
    });

    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        currentSearch = '';
        updateClearSearchButton();
        applyFiltersAndSort();
    });

    // Update clear search button visibility initially
    updateClearSearchButton();

    // Sort selection
    sortSelect.addEventListener('change', () => {
        currentSort = sortSelect.value;
        applyFiltersAndSort();
    });

    // Gallery item clicks to open popup
    galleryGrid.addEventListener('click', (e) => {
        const galleryItem = e.target.closest('.gallery-item');
        if (!galleryItem) return;

        openPopup(parseInt(galleryItem.getAttribute('data-index')));
    });

    // Popup navigation and close
    closePopupBtn.addEventListener('click', closePopup);
    prevImageBtn.addEventListener('click', showPreviousImage);
    nextImageBtn.addEventListener('click', showNextImage);

    // Close popup when clicking outside the content
    imagePopup.addEventListener('click', (e) => {
        if (e.target === imagePopup ||
            e.target.classList.contains('popup-overlay') ||
            e.target === document.querySelector('.popup-container')) {
            closePopup();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!popupOpen) return;

        switch (e.key) {
            case 'Escape': closePopup(); break;
            case 'ArrowLeft': showPreviousImage(); break;
            case 'ArrowRight': showNextImage(); break;
        }
    });

    // Touch swipe support for image popup
    imagePopup.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    });

    imagePopup.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    });

    // Window resize handler
    window.addEventListener('resize', debounce(resizeAllGridItems, 100));
}

// Handle touch swipe in popup
function handleSwipe() {
    if (!popupOpen) return;

    const swipeThreshold = 50; // minimum swipe distance
    const swipeDistanceX = touchEndX - touchStartX;
    const swipeDistanceY = touchEndY - touchStartY;

    // Only process horizontal swipes
    if (Math.abs(swipeDistanceY) <= Math.abs(swipeDistanceX)) {
        if (swipeDistanceX > swipeThreshold) {
            showPreviousImage();
        } else if (swipeDistanceX < -swipeThreshold) {
            showNextImage();
        }
    }
}

// Apply current filters and sort
function applyFiltersAndSort() {
    // Filter by category
    filteredItems = currentFilter === 'all'
        ? [...galleryItems]
        : galleryItems.filter(item =>
            item.category === currentFilter ||
            item.title.toLowerCase().includes(currentFilter)
        );

    // Apply search if any
    if (currentSearch) {
        filteredItems = filteredItems.filter(item =>
            item.title.toLowerCase().includes(currentSearch) ||
            item.artist.toLowerCase().includes(currentSearch)
        );
    }

    // Sort the items
    sortItems();

    // Re-render the gallery
    renderGallery();
}

// Sort items based on selected sort option
function sortItems() {
    switch (currentSort) {
        case 'newest':
            filteredItems.sort((a, b) => b.originalIndex - a.originalIndex);
            break;
        case 'oldest':
            filteredItems.sort((a, b) => a.originalIndex - b.originalIndex);
            break;
        case 'artist':
            filteredItems.sort((a, b) => a.artist.localeCompare(b.artist));
            break;
        default:
            filteredItems.sort((a, b) => a.originalIndex - b.originalIndex);
            break;
    }
}

// Simple debounce function
function debounce(func, delay = 200) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// Masonry layout calculation - Enhanced for better handling of wide images
function resizeGridItem(item) {
    if (!item || !galleryGrid) return;

    const grid = galleryGrid;
    const rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-auto-rows'));
    const rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue('gap'));

    const img = item.querySelector('img');
    if (!img || !img.complete) {
        // If image hasn't loaded yet, use a default span
        item.style.gridRowEnd = `span ${isMobile ? 15 : 20}`;
        return;
    }

    // Get actual dimensions and aspect ratio
    const contentHeight = img.offsetHeight;
    const aspectRatio = img.naturalWidth / img.naturalHeight;

    // Adjust height based on aspect ratio
    let adjustedHeight = contentHeight;
    let aspectAdjustment = 1;

    // Enhanced aspect ratio handling
    if (aspectRatio > 1) {
        if (aspectRatio <= 1.5) {
            aspectAdjustment = 1 - (aspectRatio - 1) * 0.2;
        } else if (aspectRatio <= 2.5) {
            aspectAdjustment = 0.9 - (aspectRatio - 1.5) * 0.25;
        } else {
            aspectAdjustment = 0.65 - Math.min(0.25, (aspectRatio - 2.5) * 0.1);
        }

        adjustedHeight = contentHeight * aspectAdjustment;
    }

    // Calculate row span based on adjusted height
    const rowSpan = Math.ceil((adjustedHeight + rowGap) / (rowHeight + rowGap));

    // Calculate minimum span based on aspect ratio
    const baseMinSpan = isMobile ? 8 : 12;
    const aspectRatioFactor = Math.min(1, 1.2 / aspectRatio);
    const minSpan = Math.max(Math.floor(baseMinSpan * aspectRatioFactor), 5);

    // Set the final row span
    const finalSpan = Math.max(rowSpan, minSpan);
    item.style.gridRowEnd = `span ${finalSpan}`;

    // Add aspect ratio property for CSS styling
    item.style.setProperty('--aspect-ratio', aspectRatio.toFixed(2));
}

// Apply masonry calculations to all items
function resizeAllGridItems() {
    const allItems = document.querySelectorAll('.gallery-item');
    if (!allItems.length) return;

    // Process in batches for better performance on mobile
    const batchSize = isMobile ? 5 : allItems.length;
    let processed = 0;

    function processNextBatch() {
        const end = Math.min(processed + batchSize, allItems.length);

        for (let i = processed; i < end; i++) {
            resizeGridItem(allItems[i]);

            // Add event listener for image load if needed
            const img = allItems[i].querySelector('img');
            if (img && !img.complete) {
                img.addEventListener('load', () => resizeGridItem(allItems[i]));
            }
        }

        processed = end;

        // If more items to process, schedule next batch
        if (processed < allItems.length) {
            setTimeout(processNextBatch, 10);
        }
    }

    processNextBatch();
}

// Popup functions
function openPopup(index) {
    currentItemIndex = index;
    const item = filteredItems[index];

    // Set popup content
    popupImage.src = item.imgSrc;
    popupTitle.textContent = item.title;
    popupArtist.textContent = item.artist;

    // Display popup
    imagePopup.style.display = 'block';
    popupOpen = true;

    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
}

function closePopup() {
    imagePopup.style.display = 'none';
    popupOpen = false;
    document.body.style.overflow = '';
}

function showPreviousImage() {
    currentItemIndex = (currentItemIndex - 1 + filteredItems.length) % filteredItems.length;
    updatePopupContent();
}

function showNextImage() {
    currentItemIndex = (currentItemIndex + 1) % filteredItems.length;
    updatePopupContent();
}

function updatePopupContent() {
    const item = filteredItems[currentItemIndex];

    // For mobile, update immediately
    if (isMobile) {
        popupImage.src = item.imgSrc;
        popupTitle.textContent = item.title;
        popupArtist.textContent = item.artist;
        return;
    }

    // For desktop, add fade transition
    const newImage = new Image();
    newImage.src = item.imgSrc;
    newImage.onload = () => {
        popupImage.style.opacity = '0';
        setTimeout(() => {
            popupImage.src = item.imgSrc;
            popupTitle.textContent = item.title;
            popupArtist.textContent = item.artist;
            popupImage.style.opacity = '1';
        }, 200);
    };
}

// Update clear search button visibility
function updateClearSearchButton() {
    const searchContainer = searchInput.parentElement;
    if (currentSearch) {
        clearSearchBtn.style.display = 'block';
        searchContainer.classList.add('has-text');
    } else {
        clearSearchBtn.style.display = 'none';
        searchContainer.classList.remove('has-text');
    }
}

// Initialize gallery on page load
document.addEventListener('DOMContentLoaded', initGallery);
