const DARK = "dark";
const LIGHT = "light";
const ALL = "all";
const NOT_ALL = "not all";
const LSSchemeName = "73k.color-scheme";

const setToggleIcon = (toggleEl, mode) => {
  if (mode === DARK) {
    toggleEl.innerHTML = `<use xlink:href="#bi-sun"></use>`;
  } else {
    toggleEl.innerHTML = `<use xlink:href="#bi-moon-stars"></use>`;
  }
};

const setActiveScheme = (linkLight, linkDark, mode) => {
  if (mode === DARK) {
    linkDark.media = ALL;
    linkDark.disabled = false;
    linkLight.media = NOT_ALL;
    linkLight.disabled = true;
  } else {
    linkLight.media = ALL;
    linkLight.disabled = false;
    linkDark.media = NOT_ALL;
    linkDark.disabled = true;
  }
};

const initToggleHandler = async (event) => {
  // Access the toggler element
  const toggleEl = document.getElementById("scheme-toggler");

  // Access the stylesheet link elements and set active scheme
  const linkLight = document.getElementById("scheme-link-light");
  const linkDark = document.getElementById("scheme-link-dark");

  // Check for user-set value
  let mode = localStorage.getItem(LSSchemeName);

  // Determine mode based on values so far
  if (!mode && matchMedia?.("(prefers-color-scheme: dark)").matches) {
    // if no mode was loaded from session storage
    // but dark mode is active, mode is dark
    mode = DARK;
    // We don't set active scheme here so that,
    // if user hasn't changed the mode with the toggler,
    // then system scheme changes will continue to work
  } else {
    // if mode was loaded from session storage, set accordingly
    setActiveScheme(linkLight, linkDark, mode);
    // if mode was loaded, or system mode is not dark
    // then mode should be what user chose, or light
    mode = mode || LIGHT;
  }

  // Set the toggler icon value according to the active mode
  setToggleIcon(toggleEl, mode);

  // Add click handler to the toggler element
  toggleEl.addEventListener("click", () => {
    mode = mode === DARK ? LIGHT : DARK;
    setToggleIcon(toggleEl, mode);
    setActiveScheme(linkLight, linkDark, mode);
    localStorage.setItem(LSSchemeName, mode);
  });
};

addEventListener("load", initToggleHandler);
