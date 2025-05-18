// DOM Elements
const elements = {
  grid: document.getElementById('galleryGrid'),
  popup: document.getElementById('imagePopup'),
  popupImage: document.getElementById('popupImage'),
  popupTitle: document.getElementById('popupTitle'),
  popupArtist: document.getElementById('popupArtist'),
  closeBtn: document.getElementById('closePopup'),
  prevBtn: document.getElementById('prevImage'),
  nextBtn: document.getElementById('nextImage'),
  filterBtns: document.querySelectorAll('.filter-btn'),
  searchInput: document.getElementById('gallerySearch'),
  searchBtn: document.getElementById('searchButton'),
  clearBtn: document.getElementById('clearSearchButton'),
  sortSelect: document.getElementById('sortSelect'),
  itemCount: document.getElementById('itemCount')
};

// State
const state = {
  items: [],
  filtered: [],
  currentIndex: 0,
  filter: 'all',
  search: '',
  sort: 'default',
  isMobile: window.innerWidth < 768,
  isPopupOpen: false,
  touchStart: { x: 0, y: 0 },
  touchEnd: { x: 0, y: 0 }
};

// Initialize smooth scrolling
function initSmoothScroll() {
  ScrollSmoother.create({
    wrapper: '#smooth-wrapper',
    content: '#smooth-content',
    smooth: 1,
    effects: true,
    normalizeScroll: true,
    smoothTouch: 0.1
  });
}

// Fetch and initialize gallery data
async function initGallery() {
  try {
    initSmoothScroll();

    // Load gallery data
    const response = await fetch('/assets/gallery/galleryItems.json');
    const items = await response.json();

    // Process items
    state.items = items.map((item, index) => {
      const lowerTitle = item.title.toLowerCase();
      let category = 'other';

      if (lowerTitle.includes('commission')) category = 'commission';
      else if (lowerTitle.includes('gift')) category = 'gift';
      else if (lowerTitle.includes('ych')) category = 'ych';

      return { ...item, category, originalIndex: index };
    });

    state.filtered = [...state.items];

    // Render and setup
    renderGallery();
    setupEventListeners();
    setTimeout(resizeAllGridItems, 100);
  } catch (error) {
    console.error('Error loading gallery:', error);
    elements.grid.innerHTML = '<div class="error-message">Failed to load gallery images. Please try again later.</div>';
  }
}

// Render gallery items
function renderGallery() {
  elements.grid.innerHTML = '';
  elements.itemCount.textContent = state.filtered.length;

  // Create and append gallery items
  state.filtered.forEach((item, index) => {
    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item';
    galleryItem.setAttribute('data-index', index);

    // Set animation delay
    const delay = state.isMobile ? Math.min(index, 10) * 0.03 : index * 0.05;
    galleryItem.style.setProperty('--delay', `${delay}s`);

    // Create image element
    const img = document.createElement('img');
    img.src = item.imgSrc;
    img.alt = item.title;
    img.loading = "lazy";
    img.onload = () => resizeGridItem(galleryItem);

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'item-overlay';
    overlay.innerHTML = `<h3>${item.title}</h3><h4>${item.artist}</h4>`;

    // Build item
    galleryItem.appendChild(img);
    galleryItem.appendChild(overlay);
    elements.grid.appendChild(galleryItem);

    // Mobile optimizations
    if (state.isMobile) overlay.style.transform = 'translateY(0)';

    // Staggered appearance
    setTimeout(() => galleryItem.classList.add('visible'), index * 50);
  });

  // Layout recalculation
  setTimeout(resizeAllGridItems, 100);
}

// Set up event listeners
function setupEventListeners() {
  // Responsive handling
  window.addEventListener('resize', debounce(() => {
    const wasMobile = state.isMobile;
    state.isMobile = window.innerWidth < 768;
    if (wasMobile !== state.isMobile) renderGallery();
    resizeAllGridItems();
  }, 200));

  // Filter buttons
  elements.filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const filter = e.target.closest('.filter-btn').getAttribute('data-filter');
      elements.filterBtns.forEach(b => b.classList.remove('active'));
      e.target.closest('.filter-btn').classList.add('active');
      state.filter = filter;
      applyFiltersAndSort();
    });
  });

  // Search functionality
  elements.searchInput.addEventListener('input', debounce(() => {
    state.search = elements.searchInput.value.trim().toLowerCase();
    updateClearSearchButton();
    applyFiltersAndSort();
  }, 300));

  elements.searchBtn.addEventListener('click', () => {
    state.search = elements.searchInput.value.trim().toLowerCase();
    updateClearSearchButton();
    applyFiltersAndSort();
  });

  elements.clearBtn.addEventListener('click', () => {
    elements.searchInput.value = '';
    state.search = '';
    updateClearSearchButton();
    applyFiltersAndSort();
  });

  // Sort selection
  elements.sortSelect.addEventListener('change', () => {
    state.sort = elements.sortSelect.value;
    applyFiltersAndSort();
  });

  // Gallery item clicks
  elements.grid.addEventListener('click', (e) => {
    const item = e.target.closest('.gallery-item');
    if (item) openPopup(parseInt(item.getAttribute('data-index')));
  });

  // Popup controls
  elements.closeBtn.addEventListener('click', closePopup);
  elements.prevBtn.addEventListener('click', showPreviousImage);
  elements.nextBtn.addEventListener('click', showNextImage);

  elements.popup.addEventListener('click', (e) => {
    if (e.target === elements.popup ||
        e.target.classList.contains('popup-overlay') ||
        e.target === document.querySelector('.popup-container')) {
      closePopup();
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!state.isPopupOpen) return;

    switch (e.key) {
      case 'Escape': closePopup(); break;
      case 'ArrowLeft': showPreviousImage(); break;
      case 'ArrowRight': showNextImage(); break;
    }
  });

  // Touch swipe support
  elements.popup.addEventListener('touchstart', (e) => {
    state.touchStart.x = e.changedTouches[0].screenX;
    state.touchStart.y = e.changedTouches[0].screenY;
  });

  elements.popup.addEventListener('touchend', (e) => {
    state.touchEnd.x = e.changedTouches[0].screenX;
    state.touchEnd.y = e.changedTouches[0].screenY;
    handleSwipe();
  });

  // Initial search button visibility
  updateClearSearchButton();
}

// Handle touch swipe in popup
function handleSwipe() {
  if (!state.isPopupOpen) return;

  const swipeThreshold = 50;
  const swipeX = state.touchEnd.x - state.touchStart.x;
  const swipeY = state.touchEnd.y - state.touchStart.y;

  // Process horizontal swipes
  if (Math.abs(swipeY) <= Math.abs(swipeX)) {
    if (swipeX > swipeThreshold) {
      showPreviousImage();
    } else if (swipeX < -swipeThreshold) {
      showNextImage();
    }
  }
}

// Apply filters and sorting
function applyFiltersAndSort() {
  // Apply category filter
  state.filtered = state.filter === 'all'
    ? [...state.items]
    : state.items.filter(item =>
        item.category === state.filter ||
        item.title.toLowerCase().includes(state.filter)
      );

  // Apply search if any
  if (state.search) {
    state.filtered = state.filtered.filter(item =>
      item.title.toLowerCase().includes(state.search) ||
      item.artist.toLowerCase().includes(state.search)
    );
  }

  // Apply sorting
  switch (state.sort) {
    case 'newest':
      state.filtered.sort((a, b) => b.originalIndex - a.originalIndex);
      break;
    case 'oldest':
      state.filtered.sort((a, b) => a.originalIndex - b.originalIndex);
      break;
    case 'artist':
      state.filtered.sort((a, b) => a.artist.localeCompare(b.artist));
      break;
    default:
      state.filtered.sort((a, b) => a.originalIndex - b.originalIndex);
  }

  renderGallery();
}

// Debounce helper function
function debounce(func, delay = 200) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

// Masonry layout calculation
function resizeGridItem(item) {
  if (!item || !elements.grid) return;

  const rowHeight = parseInt(window.getComputedStyle(elements.grid).getPropertyValue('grid-auto-rows'));
  const rowGap = parseInt(window.getComputedStyle(elements.grid).getPropertyValue('gap'));

  const img = item.querySelector('img');
  if (!img || !img.complete) {
    item.style.gridRowEnd = `span ${state.isMobile ? 15 : 20}`;
    return;
  }

  // Calculate dimensions
  const contentHeight = img.offsetHeight;
  const aspectRatio = img.naturalWidth / img.naturalHeight;

  // Adjust height based on aspect ratio
  let adjustedHeight = contentHeight;

  if (aspectRatio > 1) {
    const adjustment = aspectRatio <= 1.5 ? 1 - (aspectRatio - 1) * 0.2 :
                       aspectRatio <= 2.5 ? 0.9 - (aspectRatio - 1.5) * 0.25 :
                       0.65 - Math.min(0.25, (aspectRatio - 2.5) * 0.1);
    adjustedHeight = contentHeight * adjustment;
  }

  // Calculate spans
  const rowSpan = Math.ceil((adjustedHeight + rowGap) / (rowHeight + rowGap));
  const baseMinSpan = state.isMobile ? 8 : 12;
  const aspectRatioFactor = Math.min(1, 1.2 / aspectRatio);
  const minSpan = Math.max(Math.floor(baseMinSpan * aspectRatioFactor), 5);

  // Set final span
  const finalSpan = Math.max(rowSpan, minSpan);
  item.style.gridRowEnd = `span ${finalSpan}`;
  item.style.setProperty('--aspect-ratio', aspectRatio.toFixed(2));
}

// Process all grid items
function resizeAllGridItems() {
  const items = document.querySelectorAll('.gallery-item');
  if (!items.length) return;

  // Process in batches for better performance
  const batchSize = state.isMobile ? 5 : items.length;
  let processed = 0;

  function processNextBatch() {
    const end = Math.min(processed + batchSize, items.length);

    for (let i = processed; i < end; i++) {
      resizeGridItem(items[i]);

      const img = items[i].querySelector('img');
      if (img && !img.complete) {
        img.addEventListener('load', () => resizeGridItem(items[i]));
      }
    }

    processed = end;
    if (processed < items.length) {
      setTimeout(processNextBatch, 10);
    }
  }

  processNextBatch();
}

// Popup functions
function openPopup(index) {
  state.currentIndex = index;
  const item = state.filtered[index];

  elements.popupImage.src = item.imgSrc;
  elements.popupTitle.textContent = item.title;
  elements.popupArtist.textContent = item.artist;

  elements.popup.style.display = 'block';
  state.isPopupOpen = true;
  document.body.style.overflow = 'hidden';
}

function closePopup() {
  elements.popup.style.display = 'none';
  state.isPopupOpen = false;
  document.body.style.overflow = '';
}

function showPreviousImage() {
  state.currentIndex = (state.currentIndex - 1 + state.filtered.length) % state.filtered.length;
  updatePopupContent();
}

function showNextImage() {
  state.currentIndex = (state.currentIndex + 1) % state.filtered.length;
  updatePopupContent();
}

function updatePopupContent() {
  const item = state.filtered[state.currentIndex];

  if (state.isMobile) {
    // Simple update for mobile
    elements.popupImage.src = item.imgSrc;
    elements.popupTitle.textContent = item.title;
    elements.popupArtist.textContent = item.artist;
    return;
  }

  // Fade transition for desktop
  const newImage = new Image();
  newImage.src = item.imgSrc;
  newImage.onload = () => {
    elements.popupImage.style.opacity = '0';
    setTimeout(() => {
      elements.popupImage.src = item.imgSrc;
      elements.popupTitle.textContent = item.title;
      elements.popupArtist.textContent = item.artist;
      elements.popupImage.style.opacity = '1';
    }, 200);
  };
}

// Update search button visibility
function updateClearSearchButton() {
  const searchContainer = elements.searchInput.parentElement;
  if (state.search) {
    elements.clearBtn.style.display = 'block';
    searchContainer.classList.add('has-text');
  } else {
    elements.clearBtn.style.display = 'none';
    searchContainer.classList.remove('has-text');
  }
}

// Initialize gallery on page load
document.addEventListener('DOMContentLoaded', initGallery);
