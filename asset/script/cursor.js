const cursor = document.querySelector('.cursor');
const cursorOuter = document.querySelector('.cursor-outer');

document.addEventListener('mousemove', e => {
  cursor.setAttribute("style", `transform: translate3d(${e.pageX - 3}px, ${e.pageY - 3}px , 0px)`)
  cursorOuter.setAttribute("style", `transform: translate3d(${e.pageX - 3}px, ${e.pageY - 3}px , 0px)`)
})