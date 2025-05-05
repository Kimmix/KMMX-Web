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
let isScrolling = false;
let lenis; // Store the Lenis instance

// Initialize smooth scrolling
function initSmoothScroll() {
    lenis = new Lenis({
        duration: 1.0,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        smoothTouch: false, // Disable on touch devices for better performance
        touchMultiplier: 2,
        wheelMultiplier: 0.8,
        lerp: 0.08,
    });

    // Connect with GSAP if available
    if (window.gsap && window.ScrollTrigger) {
        const throttledUpdate = throttle(() => {
            ScrollTrigger.update();
        }, 100);

        lenis.on("scroll", throttledUpdate);
    }

    // Use requestAnimationFrame for animation loop
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

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

// Render gallery items based on current filter, search, and view mode
function renderGallery() {
    // Clear loading indicator
    galleryGrid.innerHTML = '';

    // Update the count
    itemCountElement.textContent = filteredItems.length;

    // Render items in grid view (masonry layout)
    galleryGrid.className = 'gallery-grid';
    renderGridView();
}

// Render items in grid view (masonry layout)
function renderGridView() {
    // Create and append gallery items
    filteredItems.forEach((item, index) => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.setAttribute('data-index', index);

        // Set a default span for all items
        galleryItem.style.setProperty('--span', 20);

        // Set animation delay for staggered effect - limit for mobile
        const delay = isMobile ? Math.min(index, 10) * 0.03 : index * 0.05;
        galleryItem.style.setProperty('--delay', `${delay}s`);

        // Create image element and set up load event
        const img = document.createElement('img');
        img.src = item.imgSrc;
        img.alt = item.title;
        img.loading = "lazy";
        // Add width and height to help with layout calculation before image loads
        img.setAttribute('width', '100%');
        img.setAttribute('height', 'auto');

        // Set up load event to recalculate grid item size after image loads
        img.onload = () => {
            resizeGridItem(galleryItem);
        };

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
        setTimeout(() => {
            galleryItem.classList.add('visible');
        }, index * 50);
    });

    // Recalculate layout after a short delay
    setTimeout(resizeAllGridItems, 100);

    // Additional resize checks for better layout stability
    setTimeout(resizeAllGridItems, 500);
    setTimeout(resizeAllGridItems, 1000);
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

    // Search input
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

        const index = parseInt(galleryItem.getAttribute('data-index'));
        openPopup(index);
    });

    // Popup navigation and close
    closePopupBtn.addEventListener('click', closePopup);
    prevImageBtn.addEventListener('click', showPreviousImage);
    nextImageBtn.addEventListener('click', showNextImage);

    // Close popup when clicking outside the content
    imagePopup.addEventListener('click', (e) => {
        // Close if clicking on the overlay or anywhere except popup content, navigation buttons
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
            case 'Escape':
                closePopup();
                break;
            case 'ArrowLeft':
                showPreviousImage();
                break;
            case 'ArrowRight':
                showNextImage();
                break;
        }
    });

    // Touch swipe support for image popup on mobile
    imagePopup.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, false);

    imagePopup.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, false);

    // Window resize handler
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            resizeAllGridItems();
        }, 100);
    });
}

// Handle touch swipe in popup
function handleSwipe() {
    if (!popupOpen) return;

    const swipeThreshold = 50; // minimum swipe distance
    const swipeDistanceX = touchEndX - touchStartX;
    const swipeDistanceY = touchEndY - touchStartY;

    if (Math.abs(swipeDistanceY) > Math.abs(swipeDistanceX)) {
        // Vertical swipe detected, ignore
        return;
    }

    if (swipeDistanceX > swipeThreshold) {
        // Swiped right - go to previous
        showPreviousImage();
    } else if (swipeDistanceX < -swipeThreshold) {
        // Swiped left - go to next
        showNextImage();
    }
}

// Apply current filters and sort
function applyFiltersAndSort() {
    // First filter by category
    if (currentFilter === 'all') {
        filteredItems = [...galleryItems];
    } else {
        filteredItems = galleryItems.filter(item =>
            item.category === currentFilter ||
            item.title.toLowerCase().includes(currentFilter)
        );
    }

    // Then apply search if any
    if (currentSearch) {
        filteredItems = filteredItems.filter(item =>
            item.title.toLowerCase().includes(currentSearch) ||
            item.artist.toLowerCase().includes(currentSearch)
        );
    }

    // Finally sort the items
    sortItems();

    // Re-render the gallery with the filtered items
    renderGallery();
}

// Sort items based on selected sort option
function sortItems() {
    switch (currentSort) {
        case 'newest':
            // Assuming newer items are at the end of the array
            filteredItems.sort((a, b) => b.originalIndex - a.originalIndex);
            break;
        case 'oldest':
            // Assuming older items are at the beginning of the array
            filteredItems.sort((a, b) => a.originalIndex - b.originalIndex);
            break;
        case 'artist':
            // Sort by artist name
            filteredItems.sort((a, b) => a.artist.localeCompare(b.artist));
            break;
        default:
            // Default order (original order)
            filteredItems.sort((a, b) => a.originalIndex - b.originalIndex);
            break;
    }
}

// Simple debounce function for search input
function debounce(func, delay) {
    let timeout;
    return function () {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
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
        // If image hasn't loaded yet, use a default span based on device
        const defaultSpan = isMobile ? 15 : 20;
        item.style.gridRowEnd = `span ${defaultSpan}`;
        return;
    }

    // Get actual dimensions of the image
    const contentHeight = img.offsetHeight;

    // Calculate aspect ratio (width/height)
    const aspectRatio = img.naturalWidth / img.naturalHeight;

    // Create an advanced adjustment curve based on aspect ratio
    let adjustedHeight = contentHeight;
    let aspectAdjustment = 1;

    // Enhanced aspect ratio handling with progressive scaling
    if (aspectRatio > 1) {
        // For landscape images, apply progressive reduction based on how wide they are
        // This creates a smooth curve where wider images get progressively smaller height allocations
        // 1.0 = square, 1.5 = 3:2 landscape, 2.0 = 2:1 landscape, 3.0 = extremely wide panorama
        if (aspectRatio <= 1.5) {
            // Mild reduction for slightly wide images (1:1 to 3:2)
            aspectAdjustment = 1 - (aspectRatio - 1) * 0.2;
        } else if (aspectRatio <= 2.5) {
            // Medium reduction for wide images (3:2 to 5:2)
            aspectAdjustment = 0.9 - (aspectRatio - 1.5) * 0.25;
        } else {
            // Strong reduction for panoramic images (wider than 5:2)
            aspectAdjustment = 0.65 - Math.min(0.25, (aspectRatio - 2.5) * 0.1);
        }

        adjustedHeight = contentHeight * aspectAdjustment;
    }

    // Calculate row span based on adjusted height
    const rowSpan = Math.ceil((adjustedHeight + rowGap) / (rowHeight + rowGap));

    // Set minimum span based on aspect ratio to prevent too small cells for wide images
    // Wider images get smaller minimum spans since they need less vertical space
    const baseMinSpan = isMobile ? 8 : 12;
    const aspectRatioFactor = Math.min(1, 1.2 / aspectRatio); // Normalize aspect ratio effect
    const minSpan = Math.max(Math.floor(baseMinSpan * aspectRatioFactor), 5);

    // Set the final row span
    const finalSpan = Math.max(rowSpan, minSpan);
    item.style.gridRowEnd = `span ${finalSpan}`;

    // Add a custom property to track aspect ratio for CSS styling
    item.style.setProperty('--aspect-ratio', aspectRatio.toFixed(2));
}

// Apply masonry calculations to all items - Optimized for mobile
function resizeAllGridItems() {
    const allItems = document.querySelectorAll('.gallery-item');
    if (!allItems.length) return;

    // Limit processing on mobile for better performance
    const batchSize = isMobile ? 5 : allItems.length;
    let processed = 0;

    function processNextBatch() {
        const end = Math.min(processed + batchSize, allItems.length);

        for (let i = processed; i < end; i++) {
            resizeGridItem(allItems[i]);

            // Add event listener for image load
            const img = allItems[i].querySelector('img');
            if (img && !img.complete) {
                img.addEventListener('load', () => resizeGridItem(allItems[i]));
            }
        }

        processed = end;

        // If there are more items to process, schedule the next batch
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

    // Display popup with animation
    imagePopup.style.display = 'block';
    popupOpen = true;

    // Prevent body scrolling when popup is open
    document.body.style.overflow = 'hidden';
}

function closePopup() {
    // Remove opacity transitions
    imagePopup.style.display = 'none';
    popupOpen = false;

    // Re-enable scrolling immediately
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

    // Create new image element to allow for fade transition
    const newImage = new Image();
    newImage.src = item.imgSrc;

    // For mobile, update immediately to avoid delay
    if (isMobile) {
        popupImage.src = item.imgSrc;
        popupTitle.textContent = item.title;
        popupArtist.textContent = item.artist;
        return;
    }

    // For desktop, add fade transition
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

// Initialize the gallery when the page is loaded
document.addEventListener('DOMContentLoaded', () => {
    initGallery();
});
