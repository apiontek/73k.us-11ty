const shiki = require("shiki");
const { readFileSync } = require("fs");
const { plist2js } = require("plist2");

// acquire caddyfile grammar from submodule
const caddyfileLangGrammar = JSON.parse(
  readFileSync(
    "./syntax-langs/vscode-caddyfile/syntaxes/caddyfile.tmLanguage.json",
    "utf8",
  ),
);
const caddyfileLang = {
  id: "caddyfile",
  scopeName: "source.Caddyfile",
  grammar: caddyfileLangGrammar,
  aliases: ["caddy", "caddyfile"],
};

// acquire nunjucks grammar from submodule
const nunjucksLangGrammar = plist2js(
  readFileSync(
    "./syntax-langs/vscode-nunjucks/syntaxes/nunjucks.tmLanguage",
    "utf8",
  ).toString(),
);
const nunjucksLang = {
  id: "nunjucks",
  scopeName: "text.html.nunjucks",
  grammar: nunjucksLangGrammar,
  aliases: ["nj", "njk", "nunjucks"],
};

module.exports = (eleventyConfig, options) => {
  // empty call to notify 11ty that we use this feature
  // eslint-disable-next-line no-empty-function
  eleventyConfig.amendLibrary("md", () => {});

  eleventyConfig.on("eleventy.before", async () => {
    const highlighter = await shiki.getHighlighter(options);
    await highlighter.loadLanguage(caddyfileLang);
    await highlighter.loadLanguage(nunjucksLang);
    eleventyConfig.amendLibrary("md", (mdLib) =>
      mdLib.set({
        highlight: (code, lang) => {
          if ("themes" in options && options.themes.length > 0) {
            let output = "";
            options.themes.forEach((theme) => {
              output += highlighter.codeToHtml(code, { lang, theme });
            });
            return output;
          } else {
            return highlighter.codeToHtml(code, { lang });
          }
        },
      }),
    );
  });
};
