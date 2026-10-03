// DOM Elements
const elements = {
  grid: document.getElementById('galleryGrid'),
  popup: document.getElementById('imagePopup'),
  popupImage: document.getElementById('popupImage'),
  popupTitle: document.getElementById('popupTitle'),
  popupArtist: document.getElementById('popupArtist'),
  prevBtn: document.getElementById('prevImage'),
  nextBtn: document.getElementById('nextImage'),
  filterBtns: document.querySelectorAll('.filter-btn'),
  searchInput: document.getElementById('gallerySearch'),
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
  sort: 'oldest',
  touchStart: { x: 0, y: 0 },
  touchEnd: { x: 0, y: 0 }
};

// Measure loaded images and square lazy placeholders at every viewport size.
const gallerySizer = new ResizeObserver(entries => {
  const gap = parseFloat(getComputedStyle(elements.grid).columnGap) || 0;
  for (const entry of entries) {
    entry.target.parentElement.style.gridRowEnd =
      `span ${Math.max(1, Math.ceil(entry.contentRect.height + gap))}`;
  }
});

// Fetch and initialize gallery data
async function initGallery() {
  try {
    // Load gallery data
    const response = await fetch('/assets/gallery/galleryItems.json');
    const items = await response.json();

    // Process items
    state.items = items.map(item => {
      const lowerTitle = item.title.toLowerCase();
      let category = 'other';

      if (lowerTitle.includes('commission')) category = 'commission';
      else if (lowerTitle.includes('gift')) category = 'gift';
      else if (lowerTitle.includes('ych')) category = 'ych';

      return { ...item, category };
    });

    state.filtered = [...state.items];

    // Render and setup
    renderGallery();
    setupEventListeners();
  } catch (error) {
    console.error('Error loading gallery:', error);
    elements.grid.innerHTML = '<div class="error-message">Failed to load gallery images. Please try again later.</div>';
  }
}

// Render gallery items
function renderGallery() {
  gallerySizer.disconnect();
  elements.grid.innerHTML = '';
  elements.itemCount.textContent = state.filtered.length;

  // Create and append gallery items
  state.filtered.forEach((item, index) => {
    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item';
    galleryItem.setAttribute('data-index', index);

    // Create image element
    const img = document.createElement('img');
    img.src = item.imgSrc;
    img.alt = item.title;
    img.loading = "lazy";

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'item-overlay';
    overlay.innerHTML = `<h3>${item.title}</h3><h4>${item.artist}</h4>`;

    // Build item
    galleryItem.appendChild(img);
    galleryItem.appendChild(overlay);
    elements.grid.appendChild(galleryItem);
    gallerySizer.observe(img);

    // Staggered appearance
    setTimeout(() => galleryItem.classList.add('visible'), index * 50);
  });
}

// Set up event listeners
function setupEventListeners() {
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
  elements.searchInput.addEventListener('input', () => {
    state.search = elements.searchInput.value.trim().toLowerCase();
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
  elements.prevBtn.addEventListener('click', showPreviousImage);
  elements.nextBtn.addEventListener('click', showNextImage);

  elements.popup.addEventListener('click', (e) => {
    if (e.target === elements.popup) elements.popup.close();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!elements.popup.open) return;

    switch (e.key) {
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

}

// Handle touch swipe in popup
function handleSwipe() {
  if (!elements.popup.open) return;

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
    : state.items.filter(item => item.category === state.filter);

  // Apply search if any
  if (state.search) {
    state.filtered = state.filtered.filter(item =>
      item.title.toLowerCase().includes(state.search) ||
      item.artist.toLowerCase().includes(state.search)
    );
  }

  if (state.sort === 'newest') state.filtered.reverse();
  if (state.sort === 'artist') {
    state.filtered.sort((a, b) => a.artist.localeCompare(b.artist));
  }

  renderGallery();
}

// Popup functions
function openPopup(index) {
  state.currentIndex = index;
  updatePopupContent();
  elements.popup.showModal();
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
  elements.popupImage.src = item.imgSrc;
  elements.popupTitle.textContent = item.title;
  elements.popupArtist.textContent = item.artist;
}

// Initialize gallery on page load
document.addEventListener('DOMContentLoaded', initGallery);
