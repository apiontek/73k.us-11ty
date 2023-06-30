import { opts, getSvg } from "../../_data/splash73k"

window.onload = () => {
  // We will get default opts from the same file that generates the default background
  let modOpts = window.structuredClone(opts)
  console.log(modOpts)

  // Next we will need to listen to form controls
  // access form elements...
  // add event listeners...

  // :root element for setting new css variable values
  const r = document.querySelector(':root');

  // reset button for resetting values
  const resetBtn = document.getElementById("resetBtn")
  resetBtn.addEventListener("click", () => {
    modOpts = window.structuredClone(opts)
    r.style.setProperty("--bg-img", `url('data:image/svg+xml;utf8,${getSvg(modOpts)}')`)
    r.style.setProperty("--ct-maxw", `${modOpts.headMaxW}px`)
    r.style.setProperty("--sp-bf-sz", `${modOpts.headMaxW + modOpts.lineSize}px`)
  })

  // // Each on-change will need to:
  // // - use getSvg to get a new SVG
  // // - update the CSS background
  // // - update the corresponding CSS variable, if applicable
  // let testSvg = getSvg(opts)
  // console.log(testSvg)

  // head max width input element
  const headMaxWEl = document.getElementById("headMaxW")
  headMaxWEl.addEventListener("change", (event) => {
    let min = 256
    let max = 2000
    let newValue = parseInt(event.target.value)
    if (isNaN(newValue)) {
      newValue = modOpts.headMaxW
      headMaxWEl.value = newValue
    } else if (newValue < min) {
    newValue = min
      headMaxWEl.value = min
    } else if (newValue > max) {
      newValue = max
      headMaxWEl.value = max
    }
    modOpts.headMaxW = newValue
    r.style.setProperty("--bg-img", `url('data:image/svg+xml;utf8,${getSvg(modOpts)}')`)
    r.style.setProperty("--ct-maxw", `${modOpts.headMaxW}px`)
  })

    // buffer size input element
    const bufferSizeEl = document.getElementById("bufferSize")
    bufferSizeEl.addEventListener("change", (event) => {
      let min = 0
      let max = 512
      let newValue = parseInt(event.target.value)
      if (isNaN(newValue)) {
        newValue = modOpts.bufferSize
        bufferSizeEl.value = newValue
      } else if (newValue < min) {
        newValue = min
        bufferSizeEl.value = min
      } else if (newValue > max) {
        newValue = max
        bufferSizeEl.value = max
      }
      console.log(`current bufferSize: ${modOpts.bufferSize}`)
      console.log(`new bufferSize: ${newValue}`)
      console.log(`new --sp-bf-sz: ${modOpts.bufferSize + modOpts.lineSize}`)
      modOpts.bufferSize = newValue
      console.log(modOpts)
      r.style.setProperty("--bg-img", `url('data:image/svg+xml;utf8,${getSvg(modOpts)}')`)
      r.style.setProperty("--sp-bf-sz", `${modOpts.bufferSize + modOpts.lineSize}px`)
    })


}
