//? Check if the browser is Chromium-based
document.addEventListener("DOMContentLoaded", function () {
    const isChromium = !!window.chrome;
    if (!isChromium) {
        const warning = document.createElement("div");
        warning.style.position = "fixed";
        warning.style.bottom = "0";
        warning.style.left = "0";
        warning.style.width = "100%";
        warning.style.backgroundColor = "#CB2040";
        warning.style.color = "#fff";
        warning.style.textAlign = "center";
        warning.style.padding = "10px";
        warning.style.zIndex = "1000";
        warning.innerText = "For the best experience, please use Chrome or a Chromium-based browser.";
        document.body.appendChild(warning);
    }
});

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
