import { opts, getSvg } from "../../_data/splash73k"



window.onload = () => {
  // We will get default opts from the same file that generates the default background
  let modOpts = window.structuredClone(opts)

  // Next we will need to listen to form controls
  // access form elements...
  // add event listeners...

  // :root element for setting new css variable values
  const r = document.querySelector(':root');

  // // Each on-change will need to:
  // // - use getSvg to get a new SVG
  // // - update the CSS background
  // // - update the corresponding CSS variable, if applicable
  // let testSvg = getSvg(opts)
  // console.log(testSvg)


  // line start & line count are interrelated, so we load them all up at once
  const lineStartEl = document.getElementById("lineStart")
  const lineStartElMin = document.getElementById("lineStartMin")
  const lineStartElMax = document.getElementById("lineStartMax")
  const lineStartElNow = document.getElementById("lineStartNow")

  const lineCountEl = document.getElementById("lineCount")
  const lineCountElMin = document.getElementById("lineCountMin")
  const lineCountElMax = document.getElementById("lineCountMax")
  const lineCountElNow = document.getElementById("lineCountNow")

  lineStartEl.value = modOpts.lineStart + 1
  lineStartElNow.innerText = modOpts.lineStart + 1

  lineCountEl.value = modOpts.lineCount
  lineCountElNow.innerText = modOpts.lineCount

  console.log(modOpts.colors.length)

  let lineStartElMinVal = 0 + 1
  let lineStartElMaxVal = modOpts.colors.length - modOpts.lineCount + 1

  let lineCountElMinVal = 0
  let lineCountElMaxVal = modOpts.colors.length - modOpts.lineStart

  lineStartEl.min = lineStartElMinVal
  lineStartEl.max = lineStartElMaxVal
  lineStartElMin.innerText = lineStartElMinVal
  lineStartElMax.innerText = lineStartElMaxVal

  lineCountEl.min = lineCountElMinVal
  lineCountEl.max = lineCountElMaxVal
  lineCountElMin.innerText = lineCountElMinVal
  lineCountElMax.innerText = lineCountElMaxVal


  // line start input element
  lineStartEl.addEventListener("input", (event) => {
    lineStartElNow.innerText = event.target.value
  })
  lineStartEl.addEventListener("change", (event) => {
    let newVal = parseInt(event.target.value)
    modOpts.lineStart = newVal - 1
    lineCountElMaxVal = modOpts.colors.length - modOpts.lineStart
    lineCountEl.max = lineCountElMaxVal
    lineCountElMax.innerText = lineCountElMaxVal
    r.style.setProperty("--bg-img", `url('data:image/svg+xml;utf8,${getSvg(modOpts)}')`)
    r.style.setProperty("--sp-ln-st", `${modOpts.lineStart}`)
  })


  // line count input element
  lineCountEl.addEventListener("input", (event) => {
    lineCountElNow.innerText = event.target.value
  })
  lineCountEl.addEventListener("change", (event) => {
    let newVal = parseInt(event.target.value)
    modOpts.lineCount = newVal
    if (modOpts.lineCount === 0) {
      lineStartElNow.innerText = lineStartEl.value = modOpts.lineStart = lineStartElMaxVal = lineStartElMinVal = 0
    } else {
      lineStartElMaxVal = modOpts.colors.length - modOpts.lineCount + 1
      lineStartElMinVal = 0 + 1
      lineStartEl.value = modOpts.lineStart + 1
      lineStartElNow.innerText = modOpts.lineStart + 1
    }
    lineStartEl.min = lineStartElMinVal
    lineStartEl.max = lineStartElMaxVal
    lineStartElMin.innerText = lineStartElMinVal
    lineStartElMax.innerText = lineStartElMaxVal
    r.style.setProperty("--bg-img", `url('data:image/svg+xml;utf8,${getSvg(modOpts)}')`)
    r.style.setProperty("--sp-ln-ct", `${modOpts.lineCount}`)
  })


  // head max width input element
  const headMaxWEl = document.getElementById("headMaxW")
  const headMaxWElMin = document.getElementById("headMaxWMin")
  const headMaxWElMax = document.getElementById("headMaxWMax")
  const headMaxWElNow = document.getElementById("headMaxWNow")
  const headMaxWElMinVal = 320
  const headMaxWElMaxVal = 2048
  headMaxWEl.min = headMaxWElMinVal
  headMaxWEl.max = headMaxWElMaxVal
  headMaxWEl.value = modOpts.headMaxW
  headMaxWElMin.innerText = headMaxWElMinVal
  headMaxWElMax.innerText = headMaxWElMaxVal
  headMaxWElNow.innerText = modOpts.headMaxW
  headMaxWEl.addEventListener("input", (event) => {
    headMaxWElNow.innerText = event.target.value
  })
  headMaxWEl.addEventListener("change", (event) => {
    let newVal = parseInt(event.target.value)
    modOpts.headMaxW = newVal
    r.style.setProperty("--bg-img", `url('data:image/svg+xml;utf8,${getSvg(modOpts)}')`)
    r.style.setProperty("--ct-maxw", `${modOpts.headMaxW}px`)
  })


  // buffer size input element
  const bufferSizeEl = document.getElementById("bufferSize")
  const bufferSizeElMin = document.getElementById("bufferSizeMin")
  const bufferSizeElMax = document.getElementById("bufferSizeMax")
  const bufferSizeElNow = document.getElementById("bufferSizeNow")
  const bufferSizeElMinVal = 16
  const bufferSizeElMaxVal = 480
  bufferSizeEl.min = bufferSizeElMinVal
  bufferSizeEl.max = bufferSizeElMaxVal
  bufferSizeEl.value = modOpts.bufferSize
  bufferSizeElMin.innerText = bufferSizeElMinVal
  bufferSizeElMax.innerText = bufferSizeElMaxVal
  bufferSizeElNow.innerText = modOpts.bufferSize
  bufferSizeEl.addEventListener("input", (event) => {
    bufferSizeElNow.innerText = event.target.value
  })
  bufferSizeEl.addEventListener("change", (event) => {
    let newVal = parseInt(event.target.value)
    modOpts.bufferSize = newVal
    r.style.setProperty("--bg-img", `url('data:image/svg+xml;utf8,${getSvg(modOpts)}')`)
    r.style.setProperty("--sp-bf-sz", `${modOpts.bufferSize + modOpts.lineHeight}px`)
  })


  // line size input element
  const lineHeightEl = document.getElementById("lineHeight")
  const lineHeightElMin = document.getElementById("lineHeightMin")
  const lineHeightElMax = document.getElementById("lineHeightMax")
  const lineHeightElNow = document.getElementById("lineHeightNow")
  const lineHeightElMinVal = 1
  const lineHeightElMaxVal = 128
  lineHeightEl.min = lineHeightElMinVal
  lineHeightEl.max = lineHeightElMaxVal
  lineHeightEl.value = modOpts.lineHeight
  lineHeightElMin.innerText = lineHeightElMinVal
  lineHeightElMax.innerText = lineHeightElMaxVal
  lineHeightElNow.innerText = modOpts.lineHeight
  lineHeightEl.addEventListener("input", (event) => {
    lineHeightElNow.innerText = event.target.value
  })
  lineHeightEl.addEventListener("change", (event) => {
    let newVal = parseInt(event.target.value)
    modOpts.lineHeight = newVal
    r.style.setProperty("--bg-img", `url('data:image/svg+xml;utf8,${getSvg(modOpts)}')`)
    r.style.setProperty("--sp-bf-sz", `${modOpts.bufferSize + modOpts.lineHeight}px`)
    r.style.setProperty("--sp-ln-ht", `${modOpts.lineHeight}px`)
  })


  // reset button for resetting values
  const resetBtn = document.getElementById("resetBtn")
  resetBtn.addEventListener("click", () => {
    modOpts = window.structuredClone(opts)
    headMaxWElNow.innerText = modOpts.headMaxW
    bufferSizeElNow.innerText = modOpts.bufferSize
    r.style.setProperty("--bg-img", `url('data:image/svg+xml;utf8,${getSvg(modOpts)}')`)
    r.style.setProperty("--sp-ln-st", `${modOpts.lineStart}`)
    r.style.setProperty("--sp-ln-ct", `${modOpts.lineCount}`)
    r.style.setProperty("--ct-maxw", `${modOpts.headMaxW}px`)
    r.style.setProperty("--sp-bf-sz", `${modOpts.bufferSize + modOpts.lineHeight}px`)
    r.style.setProperty("--sp-ln-ht", `${modOpts.lineHeight}px`)
  })


}
