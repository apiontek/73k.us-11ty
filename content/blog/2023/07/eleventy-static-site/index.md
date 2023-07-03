---
title: "Building this static blog with eleventy (11ty), lightningcss, esbuild, & minification"
date: "2023-07-02"
tags:
  - "blog"
  - "coding"
  - "development"
  - "fun"
  - "tech"
  - "web"
---

For half a year now I'd been considering building this as a static site. For years, I've mainly used WordPress, though I've toyed around with other methods several times over the years. I'm sure I'll change it all again someday&hellip;

The thing is, while a web-based admin & writing interface seems desirable in theory, I found myself avoiding it. I basically live in my code editor anyway, why not make it the place I also write for my website?

Then my WordPress started bailing on me a couple weeks ago, and I couldn't have it anymore. Plus this gave me an opportunity to redesign, pare things down, brush up on some new CSS, try some new ideas — and it's been fun!

And it's got a pretty good score!

{% image "./73k-pagespeed-mobile.png", "A screenshot of a 99/100/100/100 mobile Google Pagespeed score" %}
_73k.us mobile pagespeed score_

{% image "./73k-pagespeed-desktop.png", "A screenshot of a 99/100/100/100 desktop Google Pagespeed score" %}
_73k.us desktop pagespeed score_

I'd had my eye on [Eleventy](https://www.11ty.dev/) for half a year now, and after using it in a couple other projects and seeing it mature over some hurdles, I finally made the plunge, and I am so pleased!

People say hugo is faster (I'm sure it is — and its syntax highlighter, chroma, is pretty sweet), but the way Eleventy works just _makes sense_ to me, and I'm familiar enough with javascript that modifications are pretty straightforward.

My site is just a personal site with a blog, so I started with the [eleventy-base-blog](https://github.com/11ty/eleventy-base-blog) starter.

From there, I made these other changes:

- [Environment](#environment)
- [Lightning CSS](#lightning-css)
- [esbuild for javascript](#esbuild-for-javascript)
- [Minifying HTML etc.](#minifying-html-etc)
- [Search](#search)
- [SVG sprite](#svg-sprite)
- [Syntax Highlighting with shiki](#syntax-highlighting-with-shiki)
- [Light/Dark color scheme toggle](#lightdark-color-scheme-toggle)

## Environment

First, I want to skip some behaviors in development, to make debugging easier. So I am using [cross-env](https://github.com/kentcdodds/cross-env) and changed my `package.json` npm scripts look like:

```json
"scripts": {
  "serve": "cross-env ELEVENTY_ENV=dev npx @11ty/eleventy --serve --quiet",
  "serve:prod": "cross-env ELEVENTY_ENV=prod npx @11ty/eleventy --serve --quiet",
  "build": "cross-env ELEVENTY_ENV=dev npx @11ty/eleventy",
  "build:prod": "cross-env ELEVENTY_ENV=prod npx @11ty/eleventy",
}
```

And I have a `_data/env.js` file like:

```js
const isProd = process.env.ELEVENTY_ENV === "prod"
module.exports = { isProd }
```

## Lightning CSS

The base-blog starter uses [eleventy-plugin-bundle](https://github.com/11ty/eleventy-plugin-bundle) to make bundling assets easier. Per its documentation you can modifying the bundled output. The example provided demonstrates postcss, but I wanted to try [Lightning CSS](https://lightningcss.dev/) with [browserslist](https://github.com/browserslist/browserslist), which was simple enough:

```js
const browserslist = require("browserslist")
const { browserslistToTargets, transform } = require("lightningcss")

const targets = browserslistToTargets(browserslist("> 0.2% and not dead"))

// and in the eleventy config block:
eleventyConfig.addPlugin(pluginBundle, {
  transforms: [
    async function (content) {
      // this.type returns the bundle name.
      if (this.type === "css") {
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
```

You can see I only enable minification if running for production, and I have [CSS Nesting](https://www.w3.org/TR/css-nesting-1/) support enabled.

## esbuild for javascript

My new site has minimal javascript — really just the light/dark theme toggle — but I do use it, and want to be able to make some fun pages here and there.

While the eleventy bundler plugin can bundle other things, including javascript, I wanted to be able to import javascript resources, which doesn't seem supported with the [esbuild transform method](https://esbuild.github.io/api/#transform).

However, if you just give the [build method](https://esbuild.github.io/api/#build) a file name, it works. It doesn't return code directly, it writes to a file. But I don't really want external files, I just want to embed the javascript where it's needed.

Eventually, a solution presented itself: create an eleventy async filter that takes a source filename as a parameter, builds an output with esbuild, reads the file, cleans up, and passes the result right back to eleventy:

```js
const fs = require("fs")
const esbuild = require("esbuild")

// and in the eleventy config block:
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
```

Use in a template like:

```njk
<script>{% raw %}{{ "_includes/js/scheme-toggler.js" | esbuild | safe }}{% endraw %}</script>
```

## Minifying HTML etc.

Eleventy outputs HTML, XML (sitemap, atom feed), and other formats, and is very flexible, but it doesn't minify. I wanted the HTML & XML minified.

I found [eleventy-plugin-files-minifier](https://github.com/benjaminrancourt/eleventy-plugin-files-minifier) which does the job.

## Search

I still wanted a search feature, since I rely on it myself. I figured I'd need to roll my own with javascript to get it to work how I wanted, but then I came across this writeup of [Using PageFind with Eleventy for Search](https://rknight.me/using-pagefind-with-eleventy-for-search/), and I was smitten.

I basically just followed along with that, made a search page, and adjusted the styling as needed.

## SVG sprite

Back to that bundler plugin, I noticed it could bundle svgs into a sprite, and when I've been able to use that in the past, I've preferred it, so I went with that.

In my base template `base.njk` as the first child of `<body>` I have:

```njk
{% raw %}{# SVG asset bucket as sprite list #}
{% include "_includes/layouts/svg-sprites.njk" %}{% endraw %}
```

With `_includes/layouts/svg-sprites.njk` looking like:

```njk
{% raw %}{% html "svg" %}{% endraw %}
<symbol id="bi-twitter" viewBox="0 0 16 16">
  <title>Adam Piontek's Twitter profile</title>
  <desc>The Twitter logo</desc>
  <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/>
</symbol>
<symbol id="bi-mastodon" viewBox="0 0 16 16">
  <!-- another title/desc/path -->
</symbol>
<!-- more symbol definitions -->
{% raw %}{% endhtml %}{% endraw %}

<svg width="0" height="0" aria-hidden="true" style="position: absolute;">
  <defs>{% raw %}{% getBundle "html", "svg" %}{% endraw %}</defs>
</svg>
```

And then where I want to use an icon:

```njk
<svg class="icon" aria-label="some label"><use xlink:href="#bi-twitter"></use></svg>
```

My `.icon` CSS is cribbed from [this page](https://mcraiganthony.github.io/svg-icons/) and looks like:

```css
.icon {
  display: inline-block;
  fill: currentColor;
  height: 1.2em;
  line-height: 1.2em;
  position: relative;
  top: -1px;
  vertical-align: middle;
  width: 1.2em;
  & path {
    fill: currentColor;
    stroke: currentColor;
  }
}
```

## Syntax Highlighting with shiki

The eleventy-base-blog starter includes [eleventy-plugin-syntaxhighlight](https://github.com/11ty/eleventy-plugin-syntaxhighlight) to automatically provide build-time syntax highlighting for markdown code blocks. It uses [Prism](https://prismjs.com/), which has been around a while, and it's fine, but I was keen to try something else.

I briefly considered just using chroma [as I'd done before](/blog/blog-incorporated/) in my brief experiment at using Phoenix to run the site. But I thought, probably best to not slow things down calling out a separate command and messing with raw files for every little code block.

There's a new kid on the block, [shiki](https://github.com/shikijs/shiki), that seemed like a good improvement to try, and luckily [someone else already figured out how to make it work](https://www.hoeser.dev/blog/2023-02-07-eleventy-shiki-simple/). So thanks to Raphael, I implemented shiki as well.

However, I want to have one theme for light mode, and a different for dark, and I wanted support for nunucks & caddyfile languages, so I made my own modifications using [plist2](https://github.com/wareset/plist2) for the vscode nunjucks syntax extension which has its tmLanguage in plist format.

So, I have a plugin file, `eleventy.config.shiki.js`:

```js
const shiki = require('shiki');
const { readFileSync } = require("fs")
const { plist2js } = require("plist2")

// acquire caddyfile grammar from submodule
const caddyfileLangGrammar = JSON.parse(readFileSync("./syntax-langs/vscode-caddyfile/syntaxes/caddyfile.tmLanguage.json", "utf8"))
const caddyfileLang = {
  id: "caddyfile",
  scopeName: 'source.Caddyfile',
  grammar: caddyfileLangGrammar,
  aliases: ['caddy', 'caddyfile'],
}

// acquire nunjucks grammar from submodule
const nunjucksLangGrammar = plist2js(readFileSync("./syntax-langs/vscode-nunjucks/syntaxes/nunjucks.tmLanguage", "utf8").toString())
const nunjucksLang = {
  id: "nunjucks",
  scopeName: 'text.html.nunjucks',
  grammar: nunjucksLangGrammar,
  aliases: ['nj', 'njk', 'nunjucks'],
}

module.exports = (eleventyConfig, options) => {
  // empty call to notify 11ty that we use this feature
  // eslint-disable-next-line no-empty-function
  eleventyConfig.amendLibrary('md', () => {});

  eleventyConfig.on('eleventy.before', async () => {
    const highlighter = await shiki.getHighlighter(options);
    await highlighter.loadLanguage(caddyfileLang)
    await highlighter.loadLanguage(nunjucksLang)
    eleventyConfig.amendLibrary('md', (mdLib) =>
      mdLib.set({
        highlight: (code, lang) => {
          if ('themes' in options && options.themes.length > 0) {
            let output = ""
            options.themes.forEach(theme => {
              output += highlighter.codeToHtml(code, { lang, theme })
            })
            return output
          } else {
            return highlighter.codeToHtml(code, { lang })
          }
        },
      })
    );
  });
};
```

And then in `eleventy.config.js` I do:

```js
const pluginShiki = require("./eleventy.config.shiki.js")
// and in the eleventy config block:
eleventyConfig.addPlugin(pluginShiki, { themes: ['dark-plus', 'light-plus'] })
```

## Light/Dark color scheme toggle

I had to mess around a while with the light/dark theme toggler. I wanted to be sure that a user would get a system scheme if their system provided one, without neeing to do anything. But I still wanted to give the opportunity to switch from my site.

The key is to use two linked stylesheets in the header, one for dark and one for light, and then use javascript to change the media attributes and disable/enable each accordingly.

```njk
{% raw %}
{#- Bundling CSS, scheme bundle, light #}
{%- css "light" %}
{% include "_includes/css/_bundle-base.njk" %}
{% include "_includes/css/_variables-light.css" %}
{% include "_includes/css/_bundle-post.njk" %}
{% endcss %}

{#- Bundling CSS, scheme bundle, dark #}
{%- css "dark" %}
{% include "_includes/css/_bundle-base.njk" %}
{% include "_includes/css/_variables-dark.css" %}
{% include "_includes/css/_bundle-post.njk" %}
{% endcss %}
{% endraw %}

<link id="scheme-link-light" rel="stylesheet" href="{% raw %}{% getBundleFileUrl 'css', 'light' %}{% endraw %}" media="(prefers-color-scheme: light)">
<link id="scheme-link-dark" rel="stylesheet" href="{% raw %}{% getBundleFileUrl 'css', 'dark' %}{% endraw %}" media="(prefers-color-scheme: dark)">
```

And for the swapping of light/dark syntax highlighting themes, `_variables-light.css` includes:

```css
/* hide shiki dark code blocks when light scheme active */
pre.shiki.dark-plus { display: none; }
pre.shiki[style] { background-color: #fafafa !important; }
```

...while `_variables-dark.css` has:

```css
/* hide shiki light code blocks when dark scheme active */
pre.shiki.light-plus { display: none; }
pre.shiki[style] { background-color: #191e2c !important; }
```

Hopefully any of this might be of help to someone, but it at least also serves as notes for myself.
