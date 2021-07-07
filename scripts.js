// This prevents the page from scrolling down to where it was previously.
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
// This is needed if the user scrolls down during page load and you want to make sure the page is scrolled to the top once it's fully loaded. This has Cross-browser support.
window.scrollTo(0, 0);