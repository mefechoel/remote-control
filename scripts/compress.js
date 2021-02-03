/* eslint-disable import/no-extraneous-dependencies, no-console */
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const { compress: compBrotli } = require("wasm-brotli");
const { gzip: compZopfli } = require("wasm-zopfli");

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

function compress(source, algorithm) {
  const content = Buffer.from(source, "utf-8");
  return algorithm === "gzip"
    ? compZopfli(content)
    : Promise.resolve(compBrotli(content));
}

const main = async () => {
  const html = await readFile(
    path.join(__dirname, "../dist/index.html"),
    "utf-8",
  );
  const [gz, br] = await Promise.all([
    compress(html, "gzip"),
    compress(html, "brotli"),
  ]);
  await Promise.all([
    writeFile(
      path.join(__dirname, "../dist/index.html.gz"),
      gz,
      "binary",
    ),
    writeFile(
      path.join(__dirname, "../dist/index.html.br"),
      br,
      "binary",
    ),
  ]);
  const gz64 = Buffer.from(gz).toString("base64");
  const br64 = Buffer.from(br).toString("base64");
  console.log(gz64);
  console.log();
  console.log();
  console.log(br64);
  console.log();
  console.log();
  console.log({
    gz: gz64.length,
    br: br64.length,
    html: html.length,
  });
};

main();
