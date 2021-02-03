/* eslint-disable import/no-extraneous-dependencies */
const fs = require("fs");
const path = require("path");

const readFile = (relativePath, encoding = "utf-8") =>
  fs.readFileSync(path.join(__dirname, relativePath), encoding);

const font = readFile(
  "../static/fonts/SpaceGrotesk/SpaceGrotesk-var.woff2",
  "base64",
);
const icon = readFile("../static/icons/logo-512.webp", "base64");
const html = readFile("../dist/index.html");
// const htmlRs = readFile("../src/_html.rs");

// const embeddedHtmlRs = htmlRs.replace(
//   '"%HTML_CONTENT%"',
//   JSON.stringify(html),
// );

const rs = `
pub const HTML_CONTENT: &str = ${JSON.stringify(html)};
pub const FONT: &str = "${font}";
pub const ICON: &str = "${icon}";
`;

fs.writeFileSync(path.join(__dirname, "../src/html.rs"), rs, "utf-8");
