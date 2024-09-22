function moveBox(index) {
    const hoverBox = document.querySelector('.hover-box');
    const options = document.querySelectorAll('.option');
    hoverBox.style.width = options[index].offsetWidth + 'px';
    hoverBox.style.left = options[index].offsetLeft + 'px';
    hoverBox.style.opacity = '1';
}

function showBox() {
    const hoverBox = document.querySelector('.hover-box');
    hoverBox.style.opacity = '1';
}

function hideBox() {
    const hoverBox = document.querySelector('.hover-box');
    hoverBox.style.width = '0';
    hoverBox.style.opacity = '0';
}

//? SVG Glow effect
// Get references to elements
const card = document.getElementById('card');
const gradient = document.getElementById('emeraldGradient');

let mouseOnCard = false;

// Create the stop element for mouseOnCard
const stopElement = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
stopElement.setAttribute('stop-color', '#CB2040');

// Event handlers
card.addEventListener('mouseenter', () => {
    mouseOnCard = true;
    // Add the stop element
    gradient.insertBefore(stopElement, gradient.firstChild);
});

card.addEventListener('mouseleave', () => {
    mouseOnCard = false;
    // Remove the stop element
    if (gradient.contains(stopElement)) {
        gradient.removeChild(stopElement);
    }
    // Reset gradient center to default
    gradient.setAttribute('cx', '50%');
    gradient.setAttribute('cy', '50%');
});

card.addEventListener('mousemove', (event) => {
    if (mouseOnCard) {
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const cxPercentage = (x / rect.width) * 100 - 24;
        const cyPercentage = (y / rect.height) * 100;

        gradient.setAttribute('cx', `${cxPercentage}%`);
        gradient.setAttribute('cy', `${cyPercentage}%`);
    }
});