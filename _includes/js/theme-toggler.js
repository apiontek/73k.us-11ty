// const initThemeHandling = () => {
//   const DARK = 'dark';
//   const LIGHT = 'light';
//   const isSystemDarkMode = matchMedia &&
//       matchMedia('(prefers-color-scheme: dark)').matches;

//   let mode = sessionStorage.getItem('73k.color-scheme');

//   if (!mode && isSystemDarkMode) {
//     mode = DARK;
//   } else {
//     mode = mode || LIGHT;
//   }

//   if (mode === DARK) {
//     // we will do something later
//   }
// }

// run the code
// init();

const initToggleHandler = () => {
  console.log("Hello world!")
  const linkLight = document.getElementById("theme-link-light")
  const linkDark = document.getElementById("theme-link-dark")
  const toggleEl = document.getElementById("theme-toggler")
  console.log(linkLight)
  console.log(linkDark)
  console.log(toggleEl)
}


Window.onload = initToggleHandler()
