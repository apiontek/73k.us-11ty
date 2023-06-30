const defaultOpts = {
  svgSize: 10000,
  headMaxW: 808,
  bufferSize: 32,
  lineSize: 16,
  strokeWidth: 16,
  lineStart: 1,
  lineCount: 7,
  tiltDegreesStart: 25,
  tiltDegreesEnd: 25,
  shapeRendering: "geometricPrecision", // use 'crispEdges' to disable anti-aliasing
  colors: [
    "#001E5A",
    "#00769E",
    "#0295A7",
    "#78BAAE",
    "#FFEDBF",
    "#FDB36A",
    "#FF751C",
    "#FE3E00",
    "#884424",
  ],
}

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
// round to 3 decimals, accurately
function roundTo3(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100
}

// getSvg param values are in px
function getSvg(opts = defaultOpts) {
  // always an extra first transparent line and extra last transparent line
  let totalLineCount = opts.lineCount + 2
  let svgBufferSize = opts.bufferSize

  // validate shape-rendering value
  let validShapeRenderingValues = ["auto", "optimizeSpeed", "crispEdges", "geometricPrecision"]
  let validShapeRendering = validShapeRenderingValues.includes(opts.shapeRendering)
  // if shape-rendering is likely anti-aliased we will overlap
  let aliasedShapeRenderers = ["auto", "geometricPrecision"]

  // set some useful initial values
  let xmlns = "http://www.w3.org/2000/svg"
  let halfSize = opts.svgSize / 2
  let halfHead = opts.headMaxW / 2
  let linePlacement = opts.lineSize / 2

  // create container svg
  let svgParts = `<svg xmlns="${xmlns}" width="${opts.svgSize}" height="${opts.svgSize}">`

  // main line values
  let mainStartX = halfSize - halfHead + 12
  let mainEndX = halfSize + halfHead - 12

  // slope for all tilted lines
  let slopeStart = getTanFromDegrees(opts.tiltDegreesStart)
  let slopeEnd = getTanFromDegrees(opts.tiltDegreesEnd)

  // left-hand arc center values
  let arcLeftCX = mainStartX
  let arcLeftCY = svgBufferSize + linePlacement + totalLineCount * opts.lineSize

  // right-hand arc center values
  let arcRightCX = mainEndX
  let arcRightCY = svgBufferSize + linePlacement - 1 * opts.lineSize

  // left-hand tilted line startY
  let startY = opts.svgSize + 2 * opts.lineSize

  // right-hand tilted line endY
  let endY = -1 * 2 * opts.lineSize

  // loop to create the colored splash lines
  for (let i = 0; i < totalLineCount; i++) {
    // set line stroke color
    let color = "transparent"
    if (0 < i && i < totalLineCount - 1) {
      color = opts.colors[i + opts.lineStart - 1]
    }
    // console.log(`line ${i} color: ${color}`)

    // main (center) line Y & other values that may change if aliased renderer is used
    let mainY = svgBufferSize + linePlacement + i * opts.lineSize
    let thisStrokeWidth = opts.strokeWidth
    let thisArcLeftCY = arcLeftCY
    let thisArcRightCY = arcRightCY
    // if this is not the last line, adjust these values if aliased renderer is used
    if (
      i < totalLineCount - 2 &&
      validShapeRendering &&
      aliasedShapeRenderers.includes(opts.shapeRendering)
    ) {
      mainY += 2
      thisStrokeWidth += 4
      thisArcLeftCY += 2
      thisArcRightCY += 2
    }

    // arc left radius and end point
    let arcLeftRad = (totalLineCount - i) * opts.lineSize
    let arcLeftStartX = arcLeftCX + arcLeftRad * getCosFromDegrees(90 + opts.tiltDegreesStart)
    let arcLeftStartY =
      -1 * (-1 * thisArcLeftCY + arcLeftRad * getSinFromDegrees(90 + opts.tiltDegreesStart))

    // arc right radius and end point
    let arcRightRad = (i + 1) * opts.lineSize
    let arcRightEndX = arcRightCX + arcRightRad * getCosFromDegrees(3 * 90 + opts.tiltDegreesEnd)
    let arcRightEndY =
      -1 * (-1 * thisArcRightCY + arcRightRad * getSinFromDegrees(3 * 90 + opts.tiltDegreesEnd))

    // startY
    // start tilted line B and X (in Y = mX + B); m is slope calculated above
    let startB, startX
    if (opts.tiltDegreesStart > 0) {
      startB = -1 * arcLeftStartY - slopeStart * arcLeftStartX
      startX = (-1 * startY - startB) / slopeStart
    } else {
      startX = 0
      startY = mainY
    }

    // end tilted line B and X (in Y = mX + B); m is slope calculated above
    let endB, endX
    if (opts.tiltDegreesEnd > 0) {
      endB = -1 * arcRightEndY - slopeEnd * arcRightEndX
      endX = (-1 * endY - endB) / slopeEnd
    } else {
      endX = opts.svgSize
      endY = mainY
    }

    // create the line path
    let pathString = ""
    pathString += `M ${roundTo3(startX)},${startY} `
    pathString += `L ${roundTo3(arcLeftStartX)},${roundTo3(arcLeftStartY)} `
    pathString += `A ${arcLeftRad} ${arcLeftRad} 0 0 1 ${mainStartX} ${mainY} `
    pathString += `H ${mainEndX} `
    pathString += `A ${arcRightRad} ${arcRightRad} 0 0 0 ${roundTo3(arcRightEndX)} ${roundTo3(
      arcRightEndY
    )} `
    pathString += `L ${roundTo3(endX)},${endY}`
    // console.log(pathString)
    let svgPart = `<path`
    if (validShapeRendering) {
      svgPart += ` shape-rendering="${opts.shapeRendering}"`
    }
    svgPart += ` stroke="${color}" stroke-width="${thisStrokeWidth}" fill="none" d="${pathString}" />`
    // add part to the parts whole
    svgParts += svgPart

    // // dev marker dots
    // let arcLeftDot = `<circle cx="${arcLeftStartX}" cy="${arcLeftStartY}" r="2" fill="red" />`
    // svgParts += arcLeftDot
    // let arcLeftCenterDot = `<circle cx="${arcLeftCX}" cy="${thisArcLeftCY}" r="2" fill="red" />`
    // svgParts += arcLeftCenterDot
    // let mainLeftDot = `<circle cx="${mainEndX}" cy="${mainY}" r="2" fill="red" />`
    // svgParts += mainLeftDot
    // let mainRightDot = `<circle cx="${mainStartX}" cy="${mainY}" r="2" fill="red" />`
    // svgParts += mainRightDot
    // let arcRightCenterDot = `<circle cx="${arcRightCX}" cy="${thisArcRightCY}" r="2" fill="red" />`
    // svgParts += arcRightCenterDot
    // let arcRightDot = `<circle cx="${arcRightEndX}" cy="${arcRightEndY}" r="2" fill="red" />`
    // svgParts += arcRightDot
  }

  // return complete SVG string
  return (svgParts += `</svg>`).replaceAll(`#`, `%23`)
}

let svg = getSvg()

module.exports = { opts: defaultOpts, svg, getSvg }
