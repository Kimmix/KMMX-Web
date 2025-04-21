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
const sortSelect = document.getElementById('sortSelect');
const gridViewBtn = document.getElementById('gridViewBtn');
const listViewBtn = document.getElementById('listViewBtn');
const itemCountElement = document.getElementById('itemCount');

// Global variables
let galleryItems = [];
let currentItemIndex = 0;
let filteredItems = [];
let currentFilter = 'all';
let currentSearch = '';
let currentSort = 'default';
let currentView = 'grid';
let resizeTimeout;

// Initialize the gallery
async function initGallery() {
    try {
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

    // Check if we should render as grid or list
    if (currentView === 'grid') {
        galleryGrid.className = 'gallery-grid';
        renderGridView();
    } else {
        galleryGrid.className = 'gallery-list';
        renderListView();
    }
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

        // Set animation delay for staggered effect
        galleryItem.style.animationDelay = `${index * 0.05}s`;

        // Create image element and set up load event
        const img = document.createElement('img');
        img.src = item.imgSrc;
        img.alt = item.title;
        img.loading = "lazy";

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
    });

    // Recalculate layout after a short delay
    setTimeout(resizeAllGridItems, 100);

    // Additional resize check after all images should have loaded
    setTimeout(resizeAllGridItems, 1000);
}

// Render items in list view
function renderListView() {
    filteredItems.forEach((item, index) => {
        const listItem = document.createElement('div');
        listItem.className = 'list-item';
        listItem.setAttribute('data-index', index);

        // Set animation delay for staggered effect
        listItem.style.animationDelay = `${index * 0.05}s`;

        // Create image element
        const img = document.createElement('img');
        img.className = 'item-image';
        img.src = item.imgSrc;
        img.alt = item.title;
        img.loading = "lazy";

        // Create info container
        const info = document.createElement('div');
        info.className = 'item-info';
        info.innerHTML = `
            <h3>${item.title}</h3>
            <h4>Artist: ${item.artist}</h4>
        `;

        // Append elements to the list item
        listItem.appendChild(img);
        listItem.appendChild(info);
        galleryGrid.appendChild(listItem);
    });
}

// Set up all event listeners
function setupEventListeners() {
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
        applyFiltersAndSort();
    }, 300));

    searchButton.addEventListener('click', () => {
        currentSearch = searchInput.value.trim().toLowerCase();
        applyFiltersAndSort();
    });

    // Sort selection
    sortSelect.addEventListener('change', () => {
        currentSort = sortSelect.value;
        applyFiltersAndSort();
    });

    // View toggle
    gridViewBtn.addEventListener('click', () => {
        if (currentView !== 'grid') {
            currentView = 'grid';
            updateViewToggle();
            renderGallery();
        }
    });

    listViewBtn.addEventListener('click', () => {
        if (currentView !== 'list') {
            currentView = 'list';
            updateViewToggle();
            renderGallery();
        }
    });

    // Gallery item clicks to open popup
    galleryGrid.addEventListener('click', (e) => {
        const galleryItem = e.target.closest('.gallery-item') || e.target.closest('.list-item');
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
        if (!imagePopup.style.display || imagePopup.style.display === 'none') return;

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

    // Window resize handler
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (currentView === 'grid') {
                resizeAllGridItems();
            }
        }, 100);
    });
}

// Update the view toggle buttons
function updateViewToggle() {
    gridViewBtn.classList.toggle('active', currentView === 'grid');
    listViewBtn.classList.toggle('active', currentView === 'list');
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
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

// Masonry layout calculation - Updated to not rely on maxHeight
function resizeGridItem(item) {
    if (!item || !galleryGrid) return;

    const grid = galleryGrid;
    const rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-auto-rows'));
    const rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue('gap'));

    const img = item.querySelector('img');
    if (!img || !img.complete) {
        // If image hasn't loaded yet, use a default span
        item.style.gridRowEnd = `span 20`;
        return;
    }

    // Use actual image height for loaded images
    const contentHeight = img.offsetHeight;
    const rowSpan = Math.ceil((contentHeight + rowGap) / (rowHeight + rowGap));

    item.style.gridRowEnd = `span ${rowSpan}`;
}

// Apply masonry calculations to all items - Improved for better reliability
function resizeAllGridItems() {
    const allItems = document.querySelectorAll('.gallery-item');
    if (!allItems.length) return;

    allItems.forEach(item => {
        resizeGridItem(item);

        // Add event listener for image load
        const img = item.querySelector('img');
        if (img && !img.complete) {
            img.addEventListener('load', () => resizeGridItem(item));
        }
    });
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
    setTimeout(() => {
        imagePopup.querySelector('.popup-overlay').style.opacity = '1';
        imagePopup.querySelector('.popup-content').style.opacity = '1';
    }, 10);
}

function closePopup() {
    const overlay = imagePopup.querySelector('.popup-overlay');
    const content = imagePopup.querySelector('.popup-content');

    overlay.style.opacity = '0';
    content.style.opacity = '0';

    setTimeout(() => {
        imagePopup.style.display = 'none';
    }, 300);
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

// Load animated items from separate JSON file (if exists)
async function loadAnimatedItems() {
    try {
        const response = await fetch('/assets/gallery/animated.json');
        if (!response.ok) return;

        const animatedItems = await response.json();

        // Add animated items to gallery
        if (Array.isArray(animatedItems) && animatedItems.length > 0) {
            // Add original index and apply the same processing
            const processedAnimatedItems = animatedItems.map((item, idx) => {
                const lowerTitle = item.title.toLowerCase();
                let category = item.category || 'other';

                return {
                    ...item,
                    originalIndex: -(animatedItems.length - idx) // Negative to ensure they come first
                };
            });

            galleryItems = [...processedAnimatedItems, ...galleryItems];
            filteredItems = [...galleryItems];
            renderGallery();
        }
    } catch (error) {
        console.log('No animated items found or error loading them');
    }
}

// Initialize the gallery when the page is loaded
document.addEventListener('DOMContentLoaded', () => {
    initGallery();
    loadAnimatedItems();
});
