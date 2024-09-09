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