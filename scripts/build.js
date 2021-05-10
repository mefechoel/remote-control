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
const html = readFile("../dist/index.html", "base64");
const htmlBr = readFile("../dist/index.html.br", "base64");
const htmlGz = readFile("../dist/index.html.gz", "base64");
const licenses = readFile("../lib-licenses.txt", "base64");

const rs = `
pub const HTML_CONTENT: &str = "${html}";
pub const HTML_BROTLI: &str = "${htmlBr}";
pub const HTML_GZIP: &str = "${htmlGz}";
pub const FONT: &str = "${font}";
pub const ICON: &str = "${icon}";
pub const LICENSES: &str = "${licenses}";
`;

fs.writeFileSync(path.join(__dirname, "../src/html.rs"), rs, "utf-8");
