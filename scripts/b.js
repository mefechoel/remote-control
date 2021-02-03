/* eslint-disable import/no-extraneous-dependencies */
const fs = require("fs");
const path = require("path");
const { minify } = require("html-minifier-terser");
/* eslint-disable import/no-unresolved */
const app = require("../dist/App");

const readFile = (relativePath, encoding = "utf-8") =>
  fs.readFileSync(path.join(__dirname, relativePath), encoding);

function addTagsToSource(htmlSource, tags) {
  const headEnd = htmlSource.indexOf("</head>");
  const bodyEnd = htmlSource.indexOf("</body>");
  const start = htmlSource.substring(0, headEnd);
  const mid = htmlSource.substring(headEnd, bodyEnd);
  const end = htmlSource.substring(bodyEnd, htmlSource.length);
  const headTags = tags.head.join("");
  const bodyTags = tags.body.join("");
  return start + headTags + mid + bodyTags + end;
}

const { html, head } = app.render();

const htmlTemplate = readFile("../public/index.html");
const css = readFile("../dist/index.css");
const js = readFile("../dist/index.js");
const htmlRs = readFile("../src/_html.rs");

const htmlFile = addTagsToSource(htmlTemplate, {
  head: [head, `<style>${css}</style>`],
  body: [html, `<script type="module">${js}</script>`],
});

const minifierOptions = {
  removeComments: true,
  collapseWhitespace: true,
  removeRedundantAttributes: true,
  useShortDoctype: true,
  removeEmptyAttributes: true,
  removeStyleLinkTypeAttributes: true,
  minifyJS: true,
  minifyCSS: true,
  minifyURLs: true,
};

const minifiedHtml = minify(htmlFile, minifierOptions);

const embeddedHtmlRs = htmlRs.replace(
  '"%HTML_CONTENT%"',
  JSON.stringify(minifiedHtml),
);

fs.writeFileSync(
  path.join(__dirname, "../dist/result.html"),
  minifiedHtml,
  "utf-8",
);
fs.writeFileSync(
  path.join(__dirname, "../src/html.rs"),
  embeddedHtmlRs,
  "utf-8",
);
