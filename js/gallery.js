// Cached DOM elements
const popup = document.getElementById('popup');
const popupImg = document.getElementById('popup-img');
const popupTitle = document.getElementById('popup-title');
const popupArtist = document.getElementById('popup-artist');
const closeBtn = document.querySelector('.popup .close');
const galleryContainer = document.getElementById('galleryContainer');

// Function to show the full-size image, title, and artist in popup
function showPopup(imgSrc, title, artist) {
    popup.style.display = 'flex';
    popup.style.flexDirection = 'column';
    popupImg.src = imgSrc;
    popupTitle.textContent = title;
    popupArtist.textContent = artist;
}

// Function to hide the popup
function hidePopup() {
    popup.style.display = 'none';
}

// Close the popup when the close button is clicked
closeBtn.addEventListener('click', hidePopup);

// Close the popup when clicking outside the image
popup.addEventListener('click', function (event) {
    if (event.target === popup) {
        hidePopup();
    }
});

// Close the popup when pressing the ESC key
document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        hidePopup();
    }
});

// Event delegation for showing popup when clicking on an image
galleryContainer.addEventListener('click', function (event) {
    const target = event.target.closest('.g-img');
    if (target) {
        const img = target.querySelector('img');
        const title = target.querySelector('h3').textContent;
        const artist = target.querySelector('h4').textContent;
        if (img) {
            showPopup(img.src, title, artist);
        }
    }
});

// Function to scroll the gallery to the right-most position after a delay
function scrollToRightMost() {
    const galleryContent = document.getElementById('gallery-drag');

    // Delay to allow CSS animation to finish
    setTimeout(() => {
        const maxScrollLeft = galleryContent.scrollWidth - galleryContent.clientWidth;

        // Scroll to the maximum possible left position
        galleryContent.scrollTo({
            left: maxScrollLeft,
            behavior: 'smooth' // Smooth scroll
        });
    }, 300); // Adjust this delay (in ms) if necessary to match your animation timing
}

// Fetch gallery items and insert into the DOM
fetch('/assets/gallery/galleryItems.json')
    .then(response => response.json())
    .then(galleryItems => {
        const galleryMarkup = galleryItems.map(item => `
            <div class="g-img" style="max-height: ${item.maxHeight};">
                <img src="${item.imgSrc}" loading="lazy" style="height: ${item.height}; object-position: ${item.objectPosition};">
                <div class="info">
                    <h3>${item.title}</h3>
                    <h4>${item.artist}</h4>
                </div>
            </div>
        `).join('');

        galleryContainer.innerHTML = galleryMarkup;

        // Attach hover event to the last gallery item to scroll right-most
        const lastGalleryItem = galleryContainer.querySelector('.g-img:last-child');
        lastGalleryItem.addEventListener('mouseenter', scrollToRightMost);
    })
    .catch(error => console.error('Error loading gallery items:', error));
