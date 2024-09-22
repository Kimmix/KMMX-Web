//? Color box copy
const hoverBoxes = document.querySelectorAll('.color-box');

hoverBoxes.forEach(hoverBox => {
    const tooltip = hoverBox.querySelector('.tooltip');
    const originalText = hoverBox.getAttribute('data-tooltip');

    hoverBox.addEventListener('mouseenter', function (event) {
        tooltip.style.display = 'block';
    });

    hoverBox.addEventListener('mousemove', function (event) {
        tooltip.style.left = `${event.pageX}px`;
        tooltip.style.top = `${event.pageY - 370}px`;
    });

    hoverBox.addEventListener('mouseleave', function () {
        tooltip.style.display = 'none';
    });

    hoverBox.addEventListener('click', function () {
        // Copy the specific tooltip text to clipboard
        navigator.clipboard.writeText(originalText).then(() => {
            // Change tooltip text to indicate it has been copied
            tooltip.innerText = '✓ Copied!';
            tooltip.classList.add('copied');

            // Change it back after 400 ms
            setTimeout(() => {
                tooltip.innerText = originalText;
                tooltip.classList.remove('copied');
            }, 400);
        });
    });
});