/* eslint-disable import/no-extraneous-dependencies */
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const workerpool = require("workerpool");
const mkdirp = require("mkdirp");
const { gzip: compZopfli } = require("wasm-zopfli");

const writeFile = promisify(fs.writeFile);

function compressString(source) {
  const content = Buffer.from(source, "utf-8");
  return compZopfli(content);
}

function compressArtifacts({ dir, fileName, source }) {
  const ext = "gz";
  return compressString(source).then((blob) => {
    const baseFilePath = path.resolve(path.join(dir, fileName));
    const basePathParts = baseFilePath.split(/[/|\\]/);
    basePathParts.pop();
    const baseFolder = path.resolve(basePathParts.join("/"));
    const filePath = `${baseFilePath}.${ext}`;
    return mkdirp(baseFolder).then(() =>
      writeFile(filePath, blob, "binary"),
    );
  });
}

workerpool.worker({ compressArtifacts });
