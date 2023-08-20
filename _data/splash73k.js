const defaultOpts = {
  svgSize: 10000,
  headMaxW: 808,
  bufferSize: 32,
  lineHeight: 16,
  lineCount: 7,
  lineStart: 1,
  tiltDegStart: 25,
  tiltDegEnd: 25,
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
};

// calculate tangent value from degrees
function getTanFromDegrees(degrees) {
  return Math.tan((degrees * Math.PI) / 180);
}
// calculate cosine value from degrees
function getCosFromDegrees(degrees) {
  return Math.cos((degrees * Math.PI) / 180);
}
// calculate sine value from degrees
function getSinFromDegrees(degrees) {
  return Math.sin((degrees * Math.PI) / 180);
}
// round to 3 decimals, accurately
function roundTo3(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

// getSvg param values are in px
function getSvg(opts = defaultOpts) {
  // always an extra first transparent line and extra last transparent line
  const totalLineCount = opts.lineCount + 2;
  const svgBufferSize = opts.bufferSize;

  // validate shape-rendering value
  const validShapeRenderingValues = [
    "auto",
    "optimizeSpeed",
    "crispEdges",
    "geometricPrecision",
  ];
  const validShapeRendering = validShapeRenderingValues.includes(
    opts.shapeRendering,
  );
  // if shape-rendering is likely anti-aliased we will overlap
  const aliasedShapeRenderers = ["auto", "geometricPrecision"];

  // set some useful initial values
  const xmlns = "http://www.w3.org/2000/svg";
  const halfSize = opts.svgSize / 2;
  const halfHead = opts.headMaxW / 2;
  const linePlacement = opts.lineHeight / 2;

  // create container svg
  let svgParts = `<svg xmlns="${xmlns}" width="${opts.svgSize}" height="${opts.svgSize}">`;

  // main line values
  const mainStartX = halfSize - halfHead + 12;
  const mainEndX = halfSize + halfHead - 12;

  // slope for all tilted lines
  const slopeStart = getTanFromDegrees(opts.tiltDegStart);
  const slopeEnd = getTanFromDegrees(opts.tiltDegEnd);

  // left-hand arc center values
  const arcLeftCX = mainStartX;
  const arcLeftCY =
    svgBufferSize + linePlacement + totalLineCount * opts.lineHeight;

  // right-hand arc center values
  const arcRightCX = mainEndX;
  const arcRightCY = svgBufferSize + linePlacement - 1 * opts.lineHeight;

  // left-hand tilted line startY
  let startY = opts.svgSize + 2 * opts.lineHeight;

  // right-hand tilted line endY
  let endY = -1 * 2 * opts.lineHeight;

  // loop to create the colored splash lines
  for (let i = 0; i < totalLineCount; i++) {
    // set line stroke color
    let color = "transparent";
    if (0 < i && i < totalLineCount - 1) {
      color = opts.colors[i + opts.lineStart - 1];
    }
    // console.log(`line ${i} color: ${color}`)

    // main (center) line Y & other values that may change if aliased renderer is used
    let mainY = svgBufferSize + linePlacement + i * opts.lineHeight;
    let thislineHeight = opts.lineHeight;
    let thisArcLeftCY = arcLeftCY;
    let thisArcRightCY = arcRightCY;
    // if this is not the last line, adjust these values if aliased renderer is used
    if (
      i < totalLineCount - 2 &&
      validShapeRendering &&
      aliasedShapeRenderers.includes(opts.shapeRendering)
    ) {
      mainY += 2;
      thislineHeight += 4;
      thisArcLeftCY += 2;
      thisArcRightCY += 2;
    }

    // arc left radius and end point
    const arcLeftRad = (totalLineCount - i) * opts.lineHeight;
    const arcLeftStartX =
      arcLeftCX + arcLeftRad * getCosFromDegrees(90 + opts.tiltDegStart);
    const arcLeftStartY =
      -1 *
      (-1 * thisArcLeftCY +
        arcLeftRad * getSinFromDegrees(90 + opts.tiltDegStart));

    // arc right radius and end point
    const arcRightRad = (i + 1) * opts.lineHeight;
    const arcRightEndX =
      arcRightCX + arcRightRad * getCosFromDegrees(3 * 90 + opts.tiltDegEnd);
    const arcRightEndY =
      -1 *
      (-1 * thisArcRightCY +
        arcRightRad * getSinFromDegrees(3 * 90 + opts.tiltDegEnd));

    // startY
    // start tilted line B and X (in Y = mX + B); m is slope calculated above
    let startB;
    let startX;
    if (opts.tiltDegStart > 0) {
      startB = -1 * arcLeftStartY - slopeStart * arcLeftStartX;
      startX = (-1 * startY - startB) / slopeStart;
    } else {
      startX = 0;
      startY = mainY;
    }

    // end tilted line B and X (in Y = mX + B); m is slope calculated above
    let endB;
    let endX;
    if (opts.tiltDegEnd > 0) {
      endB = -1 * arcRightEndY - slopeEnd * arcRightEndX;
      endX = (-1 * endY - endB) / slopeEnd;
    } else {
      endX = opts.svgSize;
      endY = mainY;
    }

    // create the line path
    let pathString = "";
    pathString += `M ${roundTo3(startX)},${startY} `;
    pathString += `L ${roundTo3(arcLeftStartX)},${roundTo3(arcLeftStartY)} `;
    pathString += `A ${arcLeftRad} ${arcLeftRad} 0 0 1 ${mainStartX} ${mainY} `;
    pathString += `H ${mainEndX} `;
    pathString += `A ${arcRightRad} ${arcRightRad} 0 0 0 ${roundTo3(
      arcRightEndX,
    )} ${roundTo3(arcRightEndY)} `;
    pathString += `L ${roundTo3(endX)},${endY}`;
    // console.log(pathString)
    let svgPart = "<path";
    if (validShapeRendering) {
      svgPart += ` shape-rendering="${opts.shapeRendering}"`;
    }
    svgPart += ` stroke="${color}" stroke-width="${thislineHeight}" fill="none" d="${pathString}" />`;
    // add part to the parts whole
    svgParts += svgPart;

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
  svgParts += "</svg>";
  return svgParts.replaceAll("#", "%23");
}

const svg = getSvg();

module.exports = { opts: defaultOpts, svg, getSvg };
