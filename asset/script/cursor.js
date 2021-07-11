const cursor = document.querySelector('.cursor');
const cursorOuter = document.querySelector('.cursor-outer');

document.addEventListener('mousemove', e => {
  // cursor.setAttribute("style", "top: " + (e.pageY - 12) + "px; left: " + (e.pageX - 12) + "px;")
  cursor.setAttribute("style", `transform: translate3d(${e.pageX - 3}px, ${e.pageY - 3}px , 0px)`)
  cursorOuter.setAttribute("style", `transform: translate3d(${e.pageX - 3}px, ${e.pageY - 3}px , 0px)`)
})

// document.addEventListener('click', () => {
//   cursor.classList.add("expand");

//   setTimeout(() => {
//     cursor.classList.remove("expand");
//   }, 500)
// })

// setTimeout(() => {
//   document.documentElement.style.setProperty('--cursor-visibility', 'visible');
// }, 9000)