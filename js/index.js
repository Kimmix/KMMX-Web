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
const glowContainer = document.getElementById('glowContainer');
const gradient = document.getElementById('redGradient');

let mouseOnContainer = false;

// Create the stop element for mouseOnContainer
const stopElement = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
stopElement.setAttribute('stop-color', '#CB2040');

// Event handlers
glowContainer.addEventListener('mouseenter', () => {
    mouseOnContainer = true;
    // Add the stop element
    gradient.insertBefore(stopElement, gradient.firstChild);
});

glowContainer.addEventListener('mouseleave', () => {
    mouseOnContainer = false;
    // Remove the stop element
    if (gradient.contains(stopElement)) {
        gradient.removeChild(stopElement);
    }
    // Reset gradient center to default
    gradient.setAttribute('cx', '50%');
    gradient.setAttribute('cy', '50%');
});

glowContainer.addEventListener('mousemove', (event) => {
    if (mouseOnContainer) {
        const rect = glowContainer.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const cxPercentage = (x / rect.width) * 100 - 24;
        const cyPercentage = (y / rect.height) * 100;

        gradient.setAttribute('cx', `${cxPercentage}%`);
        gradient.setAttribute('cy', `${cyPercentage}%`);
    }
});