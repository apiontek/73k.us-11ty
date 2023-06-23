/*
 * This script is only used to generate the SVG used for the background / header splash.
 * This script is not meant for live use with the production-build static website.
 */

// calculate tangent value from degrees
function getTanFromDegrees(degrees) {
  return Math.tan((degrees * Math.PI) / 180)
}
// calculate cosine value from degrees
function getCosFromDegrees(degrees) {
  return Math.cos((degrees * Math.PI) / 180)
}
// calculate sine value from degrees
function getSinFromDegrees(degrees) {
  return Math.sin((degrees * Math.PI) / 180)
}

// getSvg param values are in px
function getSvg({
  headWidth = "768px",
  bufferSize = "32px",
  lineSize = "16px",
  lineWidth = "16px",
  lineStart = "1",
  lineCount = "7",
  tiltDegreesStart = "35",
  tiltDegreesEnd = "55",
  shapeRendering = "crispEdges",
  colors = [
    "#001e5a",
    "#00769e",
    "#0295a7",
    "#78baae",
    "#ffedbf",
    "#fdb36a",
    "#ff751c",
    "#fe3e00",
    "#884424",
  ],
}) {
  // convert px values
  headWidth = parseInt(headWidth.replace("px", ""))
  bufferSize = parseInt(bufferSize.replace("px", ""))
  lineSize = parseInt(lineSize.replace("px", ""))
  lineWidth = parseInt(lineWidth.replace("px", ""))

  // convert other int values
  lineStart = parseInt(lineStart)
  lineCount = parseInt(lineCount)
  tiltDegreesStart = parseFloat(tiltDegreesStart)
  tiltDegreesEnd = parseFloat(tiltDegreesEnd)

  // always an extra first transparent line and extra last transparent line
  let totalLineCount = lineCount + 2
  bufferSize -= lineSize

  // validate shape-rendering value
  let validShapeRenderingValues = ["auto", "optimizeSpeed", "crispEdges", "geometricPrecision"]
  let validShapeRendering = validShapeRenderingValues.includes(shapeRendering)
  // if shape-rendering is likely anti-aliased we will overlap
  let aliasedShapeRenderers = ["auto", "geometricPrecision"]

  // set some useful initial values
  let xmlns = "http://www.w3.org/2000/svg"
  let svgSize = 10000
  let halfSize = svgSize / 2
  let halfHead = headWidth / 2
  let linePlacement = lineSize / 2

  // create container svg
  let splashSvg = document.createElementNS(xmlns, "svg")
  splashSvg.setAttribute("xmlns", xmlns)
  splashSvg.setAttribute("width", svgSize)
  splashSvg.setAttribute("height", svgSize)

  // reference circle
  // let svgCircle1 = document.createElementNS(xmlns, "circle")
  // svgCircle1.setAttribute("cx", "5000")
  // svgCircle1.setAttribute("cy", ((lineCount - 2) * lineSize))
  // svgCircle1.setAttribute("r", ((lineCount - 2) * lineSize))
  // svgCircle1.setAttribute("stroke", "green")
  // svgCircle1.setAttribute("fill", "yellow")
  // if (validShapeRendering) { svgCircle1.setAttribute("shape-rendering", shapeRendering) }
  // splashSvg.appendChild(svgCircle1)

  // main line values
  let mainStartX = halfSize - halfHead
  let mainEndX = halfSize + halfHead

  // slope for all tilted lines
  let slopeStart = getTanFromDegrees(tiltDegreesStart)
  let slopeEnd = getTanFromDegrees(tiltDegreesEnd)

  // left-hand arc center values
  let arcLeftCX = mainStartX
  let arcLeftCY = bufferSize + linePlacement + totalLineCount * lineSize

  // right-hand arc center values
  let arcRightCX = mainEndX
  let arcRightCY = bufferSize + linePlacement - 1 * lineSize

  // left-hand tilted line startY
  let startY = svgSize + 2 * lineSize

  // right-hand tilted line endY
  let endY = -1 * 2 * lineSize

  // loop to create the colored splash lines
  for (let i = 0; i < totalLineCount; i++) {
    // set line stroke color
    let color = "transparent"
    if (0 < i && i < totalLineCount - 1) {
      color = colors[i + lineStart - 1]
    }
    console.log(`line ${i} color: ${color}`)

    // main (center) line Y & other values that may change if aliased renderer is used
    let mainY = bufferSize + linePlacement + i * lineSize
    let strokeWidth = lineWidth
    let thisArcLeftCY = arcLeftCY
    let thisArcRightCY = arcRightCY
    // if this is not the last line, adjust these values if aliased renderer is used
    if (
      i < totalLineCount - 2 &&
      validShapeRendering &&
      aliasedShapeRenderers.includes(shapeRendering)
    ) {
      mainY += 2
      strokeWidth += 4
      thisArcLeftCY += 2
      thisArcRightCY += 2
    }

    // arc left radius and end point
    let arcLeftRad = (totalLineCount - i) * lineSize
    let arcLeftStartX = arcLeftCX + arcLeftRad * getCosFromDegrees(90 + tiltDegreesStart)
    let arcLeftStartY =
      -1 * (-1 * thisArcLeftCY + arcLeftRad * getSinFromDegrees(90 + tiltDegreesStart))

    // arc right radius and end point
    let arcRightRad = (i + 1) * lineSize
    let arcRightEndX = arcRightCX + arcRightRad * getCosFromDegrees(3 * 90 + tiltDegreesEnd)
    let arcRightEndY =
      -1 * (-1 * thisArcRightCY + arcRightRad * getSinFromDegrees(3 * 90 + tiltDegreesEnd))

    // startY
    // start tilted line B and X (in Y = mX + B); m is slope calculated above
    let startB, startX
    if (tiltDegreesStart > 0) {
      startB = -1 * arcLeftStartY - slopeStart * arcLeftStartX
      startX = (-1 * startY - startB) / slopeStart
    } else {
      startX = 0
      startY = mainY
    }

    // end tilted line B and X (in Y = mX + B); m is slope calculated above
    let endB, endX
    if (tiltDegreesEnd > 0) {
      endB = -1 * arcRightEndY - slopeEnd * arcRightEndX
      endX = (-1 * endY - endB) / slopeEnd
    } else {
      endX = svgSize
      endY = mainY
    }

    // create the line path
    let pathString = ""
    pathString += `M ${startX},${startY} `
    pathString += `L ${arcLeftStartX},${arcLeftStartY} `
    pathString += `A ${arcLeftRad} ${arcLeftRad} 0 0 1 ${mainStartX} ${mainY} `
    pathString += `H ${mainEndX} `
    pathString += `A ${arcRightRad} ${arcRightRad} 0 0 0 ${arcRightEndX} ${arcRightEndY} `
    pathString += `L ${endX},${endY}`
    // console.log(pathString)
    let svgPath = document.createElementNS(xmlns, "path")
    if (validShapeRendering) {
      svgPath.setAttribute("shape-rendering", shapeRendering)
    }
    svgPath.setAttribute("stroke", color)
    svgPath.setAttribute("stroke-width", strokeWidth)
    svgPath.setAttribute("fill", "none")
    svgPath.setAttribute("d", pathString)
    splashSvg.appendChild(svgPath)

    // // dev marker dots
    // let arcLeftDot = document.createElementNS(xmlns, "circle")
    // arcLeftDot.setAttribute("cx", arcLeftStartX)
    // arcLeftDot.setAttribute("cy", arcLeftStartY)
    // arcLeftDot.setAttribute("r", 2)
    // arcLeftDot.setAttribute("fill", "red")
    // splashSvg.appendChild(arcLeftDot)
    // let arcLeftCenterDot = document.createElementNS(xmlns, "circle")
    // arcLeftCenterDot.setAttribute("cx", arcLeftCX)
    // arcLeftCenterDot.setAttribute("cy", thisArcLeftCY)
    // arcLeftCenterDot.setAttribute("r", 2)
    // arcLeftCenterDot.setAttribute("fill", "red")
    // splashSvg.appendChild(arcLeftCenterDot)
    // let mainLeftDot = document.createElementNS(xmlns, "circle")
    // mainLeftDot.setAttribute("cx", mainEndX)
    // mainLeftDot.setAttribute("cy", mainY)
    // mainLeftDot.setAttribute("r", 2)
    // mainLeftDot.setAttribute("fill", "red")
    // splashSvg.appendChild(mainLeftDot)
    // let mainRightDot = document.createElementNS(xmlns, "circle")
    // mainRightDot.setAttribute("cx", mainStartX)
    // mainRightDot.setAttribute("cy", mainY)
    // mainRightDot.setAttribute("r", 2)
    // mainRightDot.setAttribute("fill", "red")
    // splashSvg.appendChild(mainRightDot)
    // let arcRightCenterDot = document.createElementNS(xmlns, "circle")
    // arcRightCenterDot.setAttribute("cx", arcRightCX)
    // arcRightCenterDot.setAttribute("cy", thisArcRightCY)
    // arcRightCenterDot.setAttribute("r", 2)
    // arcRightCenterDot.setAttribute("fill", "red")
    // splashSvg.appendChild(arcRightCenterDot)
    // let arcRightDot = document.createElementNS(xmlns, "circle")
    // arcRightDot.setAttribute("cx", arcRightEndX)
    // arcRightDot.setAttribute("cy", arcRightEndY)
    // arcRightDot.setAttribute("r", 2)
    // arcRightDot.setAttribute("fill", "red")
    // splashSvg.appendChild(arcRightDot)
  }

  // console.log(splashSvg.outerHTML)
  return splashSvg
}

window.onload = function () {
  let html = document.getElementById("html73k")
  let htmlComputedStyle = window.getComputedStyle(html, null)

  // get splash CSS variable values
  let cssVarNames = [
    "--splash-buffer-size",
    "--splash-line-size",
    "--splash-line-width",
    "--splash-line-start",
    "--splash-line-count",
    "--splash-tilt-degrees-start",
    "--splash-tilt-degrees-end",
    "--splash-shape-rendering",
  ]
  window.splashOpts = {}
  let optName
  cssVarNames.forEach((v) => {
    optName = v.replace("--splash-", "").replace(/-([a-z])/g, (g) => g[1].toUpperCase())
    window.splashOpts[optName] = htmlComputedStyle.getPropertyValue(v)
  })

  // get the splash colors from CSS, as an array
  window.splashOpts.colors = Array(9)
    .fill("")
    .map((_, i) => htmlComputedStyle.getPropertyValue(`--splash-c${i}`))
  // window.splashOpts.colors.forEach((c, i) => console.log(`--splash-c${i}: ${c}`))

  // Get the width in px of the header
  window.splashOpts.headWidth = window
    .getComputedStyle(document.getElementById("head73k"), null)
    .getPropertyValue("width") // 768px for example

  // output collect opts to console
  console.log(window.splashOpts)

  // create new SVG document
  let splashSvg = getSvg(window.splashOpts)
  // log the raw XML for the new SVG
  let splashSvgStr = splashSvg.outerHTML
  // console.log(`raw XML for new SVG: ${splashSvgStr}`)
  // build the CSS URL string for background-image:
  let newHtmlBackgroundImage = `url('data:image/svg+xml;utf8,${splashSvgStr
    .replaceAll(`#`, `%23`)
    .replaceAll(`<`, `%3C`)
    .replaceAll(`>`, `%3E`)}')`
  console.log(`CSS URL string for background-image: ${newHtmlBackgroundImage}`)
  // update the background image
  html.style.backgroundImage = newHtmlBackgroundImage
}
