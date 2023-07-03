// inclusions from original eleventy-base-blog
const { DateTime } = require("luxon")
const markdownItAnchor = require("markdown-it-anchor")
const pluginRss = require("@11ty/eleventy-plugin-rss")
const pluginBundle = require("@11ty/eleventy-plugin-bundle")
const pluginNavigation = require("@11ty/eleventy-navigation")
const { EleventyHtmlBasePlugin } = require("@11ty/eleventy")
const pluginDrafts = require("./eleventy.config.drafts.js")
const pluginImages = require("./eleventy.config.images.js")

// for syntax highlighting
const pluginShiki = require("./eleventy.config.shiki.js")

// for lightningcss
const browserslist = require("browserslist")
const { browserslistToTargets, transform } = require("lightningcss")

// for esbuild js processing
const fs = require("fs")
const esbuild = require("esbuild")

// for minifying html, xml, some others
const eleventyPluginFilesMinifier = require("@sherby/eleventy-plugin-files-minifier");

// used for executing pagefind after build
const { execSync } = require("child_process")

// extra environment data for eleventy
const env = require("./_data/env")

// browser targets for lightningcss
const targets = browserslistToTargets(browserslist("> 0.2% and not dead"))

module.exports = function (eleventyConfig) {
  // 2023-06-18 apiontek - also using this in winstats html
  // nunjucks template engine options
  eleventyConfig.setNunjucksEnvironmentOptions({
    throwOnUndefined: true,
    trimBlocks: true,
    lstripBlocks: true,
  })
  // 2023-06-20 apiontek - shortcode for year, for copyright
  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`)

  // Copy the contents of the `public` folder to the output folder
  // For example, `./public/css/` ends up in `_site/css/`
  eleventyConfig.addPassthroughCopy({
    "./public/": "/",
    // "./node_modules/prismjs/themes/prism-okaidia.css": "/css/prism-okaidia.css",
  })

  // Run Eleventy when these files change:
  // https://www.11ty.dev/docs/watch-serve/#add-your-own-watch-targets

  // Watch content images for the image pipeline.
  eleventyConfig.addWatchTarget("content/**/*.{svg,webp,png,jpeg}")

  // App plugins
  eleventyConfig.addPlugin(pluginDrafts)
  eleventyConfig.addPlugin(pluginImages)

  // Shiki syntax highlighting
  eleventyConfig.addPlugin(pluginShiki, { themes: ['solarized-dark', 'solarized-light'] })

  // Official plugins
  eleventyConfig.addPlugin(pluginRss)
  eleventyConfig.addPlugin(pluginNavigation)
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin)
  eleventyConfig.addPlugin(pluginBundle, {
    transforms: [
      async function (content) {
        // this.type returns the bundle name.
        if (this.type === "css") {
          // Same as Eleventy transforms, this.page is available here.
          let result = await transform({
            code: Buffer.from(content),
            minify: env.isProd,
            sourceMap: false,
            targets,
            drafts: {
              nesting: true,
            },
          })
          return result.code
        }

        return content
      },
    ],
  })

  // esbuild js bundler filter
  eleventyConfig.addAsyncFilter("esbuild", function (jsInFile) {
    // process with esbuild
    esbuild.buildSync({
      entryPoints: [jsInFile],
      outfile: "out.js",
      bundle: true,
      minify: env.isProd,
      sourcemap: false,
      legalComments: "none",
      treeShaking: true,
    })
    // read the output bundle from disk
    const bundle = fs.readFileSync("out.js", "utf8")
    // tidy after processing by removing files from disk
    fs.unlinkSync("out.js")
    // return output
    return bundle.trim()
  })


  // Filters
  eleventyConfig.addFilter("readableDate", (dateObj, format, zone) => {
    // Formatting tokens for Luxon: https://moment.github.io/luxon/#/formatting?id=table-of-tokens
    return DateTime.fromJSDate(dateObj, { zone: zone || "utc" }).toFormat(format || "dd LLLL yyyy")
  })

  eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    // dateObj input: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("yyyy-LL-dd")
  })

  // Get the first `n` elements of a collection.
  eleventyConfig.addFilter("head", (array, n) => {
    if (!Array.isArray(array) || array.length === 0) {
      return []
    }
    if (n < 0) {
      return array.slice(n)
    }

    return array.slice(0, n)
  })

  // Return the smallest number argument
  eleventyConfig.addFilter("min", (...numbers) => {
    return Math.min.apply(null, numbers)
  })

  // Return all the tags used in a collection
  eleventyConfig.addFilter("getAllTags", (collection) => {
    let tagSet = new Set()
    for (let item of collection) {
      ;(item.data.tags || []).forEach((tag) => tagSet.add(tag))
    }
    let tagArr = Array.from(tagSet).map((t) => {
      let subGroup = collection.filter((item) => item.data.tags.includes(t))
      return { name: t, count: subGroup.length }
    })
    tagArr.sort((a, b) => {
      return b.count - a.count
    })
    return tagArr
  })

  eleventyConfig.addFilter("filterTagList", function filterTagList(tags) {
    if (tags.length > 0) {
      if (tags[0])
        if (typeof tags[0] === "string" || tags[0] instanceof String) {
          return (tags || []).filter((tag) => ["all", "nav", "post", "posts"].indexOf(tag) === -1)
        } else {
          return (tags || []).filter(
            (tag) => ["all", "nav", "post", "posts"].indexOf(tag.name) === -1
          )
        }
    } else {
      return []
    }
  })

  // Customize Markdown library settings:
  eleventyConfig.amendLibrary("md", (mdLib) => {
    mdLib.use(markdownItAnchor, {
      permalink: markdownItAnchor.permalink.ariaHidden({
        placement: "after",
        class: "header-anchor",
        symbol: "#",
        ariaHidden: false,
      }),
      level: [1, 2, 3, 4],
      slugify: eleventyConfig.getFilter("slugify"),
    })
  })

  // Features to make your build faster (when you need them)

  // If your passthrough copy gets heavy and cumbersome, add this line
  // to emulate the file copy on the dev server. Learn more:
  // https://www.11ty.dev/docs/copy/#emulate-passthrough-copy-during-serve

  // eleventyConfig.setServerPassthroughCopyBehavior("passthrough");

  eleventyConfig.setServerOptions({ showAllHosts: true })

  // in production, minify the HTML, XML, etc
  if (env.isProd) {
    eleventyConfig.addPlugin(eleventyPluginFilesMinifier);
  }

  eleventyConfig.on("eleventy.after", () => {
    execSync(`npx pagefind --source _site --glob "**/*.html"`, { encoding: "utf-8" })
  })

  return {
    // Control which files Eleventy will process
    // e.g.: *.md, *.njk, *.html, *.liquid
    templateFormats: ["md", "njk", "html", "liquid"],

    // Pre-process *.md files with: (default: `liquid`)
    markdownTemplateEngine: "njk",

    // Pre-process *.html files with: (default: `liquid`)
    htmlTemplateEngine: "njk",

    // These are all optional:
    dir: {
      input: "content", // default: "."
      includes: "../_includes", // default: "_includes"
      data: "../_data", // default: "_data"
      output: "_site",
    },

    // -----------------------------------------------------------------
    // Optional items:
    // -----------------------------------------------------------------

    // If your site deploys to a subdirectory, change `pathPrefix`.
    // Read more: https://www.11ty.dev/docs/config/#deploy-to-a-subdirectory-with-a-path-prefix

    // When paired with the HTML <base> plugin https://www.11ty.dev/docs/plugins/html-base/
    // it will transform any absolute URLs in your HTML to include this
    // folder name and does **not** affect where things go in the output folder.
    pathPrefix: "/",
  }
}
