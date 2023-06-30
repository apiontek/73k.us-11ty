const DARK = "dark"
const LIGHT = "light"
const ALL = "all"
const NOT_ALL = "not all"
const sessionStorageSchemeName = "73k.color-scheme"

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const setToggleIcon = (toggleEl, mode) => {
  if (mode === DARK) {
    toggleEl.innerHTML = `<use xlink:href="#bi-sun-fill"></use>`
  } else {
    toggleEl.innerHTML = `<use xlink:href="#bi-moon-fill"></use>`
  }
}

const setActiveScheme = (linkLight, linkDark, mode) => {
  if (mode === DARK) {
    linkDark.media = ALL
    linkDark.disabled = false
    linkLight.media = NOT_ALL
    linkLight.disabled = true
  } else {
    linkLight.media = ALL
    linkLight.disabled = false
    linkDark.media = NOT_ALL
    linkDark.disabled = true
  }
}

const initToggleHandler = async () => {
  // waiting just a smidge to avoid flash of unstyled content
  // ...better to flash a transition?
  await sleep(5)

  // Check for system dark mode
  const isSystemDarkMode = matchMedia && matchMedia("(prefers-color-scheme: dark)").matches

  // Check for user-set value
  let mode = sessionStorage.getItem(sessionStorageSchemeName)

  // Determine mode based on values so far
  if (!mode && isSystemDarkMode) {
    // if no mode was loaded from session storage
    // but dark mode is active, mode is dark
    mode = DARK
  } else {
    // if mode was loaded, or system mode is not dark
    // then mode should be what user chose, or light
    mode = mode || LIGHT
  }

  // Access the toggler element and set its icon accordingly
  const toggleEl = document.getElementById("scheme-toggler")
  setToggleIcon(toggleEl, mode)

  // Access the stylesheet link elements and set active scheme
  const linkLight = document.getElementById("scheme-link-light")
  const linkDark = document.getElementById("scheme-link-dark")
  setActiveScheme(linkLight, linkDark, mode)

  // Add click handler to the toggler element
  toggleEl.addEventListener("click", () => {
    mode = mode === DARK ? LIGHT : DARK
    setToggleIcon(toggleEl, mode)
    setActiveScheme(linkLight, linkDark, mode)
    sessionStorage.setItem(sessionStorageSchemeName, mode)
  })
}

Window.onload = initToggleHandler()
