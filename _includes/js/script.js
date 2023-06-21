function splitCssUrl(string) {
  var token = /((?:[^"']|".*?"|'.*?')*?)([(,)]|$)/g
  return (function recurse() {
    for (var array = []; ; ) {
      var result = token.exec(string)
      if (result[2] == "(") {
        array.push(result[1].trim() + "(" + recurse().join(",") + ")")
        result = token.exec(string)
      } else array.push(result[1].trim())
      if (result[2] != ",") return array
    }
  })()
}

window.onload = function () {
  // Testing
  console.log("Hello world!")
  const html = document.getElementById("html73k")
  let htmlStyles = window.getComputedStyle(html)
  let htmlBackgroundUrl = htmlStyles.backgroundImage
  console.log(decodeURI(htmlStyles))
  let urlString = decodeURI(htmlBackgroundUrl)
    .replace('url("', "")
    .replace('")', "")
  // console.log(urlString);
  let svgString = splitCssUrl(urlString)[1]
  console.log(svgString)
  const parser = new DOMParser()
  let originalSvg = parser.parseFromString(svgString, "image/svg+xml")
  console.log(originalSvg)

  // Get the width in px of the header
  const header = document.getElementById("head73k")
  let headerStyles = window.getComputedStyle(header)
  console.log(headerStyles.width) // 768px for example

  // url("data:image/svg+xml;charset=utf-8,<svg xmlns='http://www.w3.org/2000/svg' width='10000' height='10000'><path fill='none' stroke='rgba(0,118,158,1)' stroke-width='16' d='M4608 40h784' shape-rendering='crispEdges'/><path fill='none' stroke='rgba(2,149,167,1)' stroke-width='16' d='M4608 56h784' shape-rendering='crispEdges'/><path fill='none' stroke='rgba(120,186,174,1)' stroke-width='16' d='M4608 72h784' shape-rendering='crispEdges'/><path fill='none' stroke='rgba(255,237,191,1)' stroke-width='16' d='M4608 88h784' shape-rendering='crispEdges'/><path fill='none' stroke='rgba(253,179,106,1)' stroke-width='16' d='M4608 104h784' shape-rendering='crispEdges'/><path fill='none' stroke='rgba(255,117,28,1)' stroke-width='16' d='M4608 120h784' shape-rendering='crispEdges'/><path fill='none' stroke='rgba(254,62,0,1)' stroke-width='16' d='M4608 136h784' shape-rendering='crispEdges'/><path fill='none' stroke='%23888' stroke-width='16' d='M4608 152h784' shape-rendering='crispEdges'/><circle cx='4608' cy='88' r='2' fill='red'/><circle cx='4608' cy='104' r='2' fill='red'/><circle cx='4608' cy='120' r='2' fill='red'/><circle cx='4608' cy='136' r='2' fill='red'/><circle cx='4608' cy='152' r='2' fill='red'/><script/></svg>")

  // create new SVG document
  let newBackgroundSvg = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  )
}
