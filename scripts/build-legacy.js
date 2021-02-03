/* eslint-disable import/no-extraneous-dependencies */
const fs = require('fs');
const path = require('path');
const { minify } = require('html-minifier-terser');

const readFile = (relativePath, encoding = 'utf-8') =>
  fs.readFileSync(path.join(__dirname, relativePath), encoding);

const image = readFile('../static/icons/logo-192.png', 'base64');
const htmlTemplate = readFile('../static/index.html');
const htmlRs = readFile('../src/_html.rs');

const dataUrl = `data:image/png;base64,${image}`;

const html = htmlTemplate.replace('%ICON_DATA_URL%', dataUrl);

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

const minifiedHtml = minify(html, minifierOptions);
const embeddedHtmlRs = htmlRs.replace(
  '"%HTML_CONTENT%"',
  JSON.stringify(minifiedHtml),
);

fs.writeFileSync(
  path.join(__dirname, '../src/html.rs'),
  embeddedHtmlRs,
  'utf-8',
);
