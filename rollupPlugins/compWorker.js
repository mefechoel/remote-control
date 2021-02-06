/* eslint-disable import/no-extraneous-dependencies */
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const workerpool = require('workerpool');
const mkdirp = require('mkdirp');
const { compress: compBrotli } = require('wasm-brotli');
const { gzip: compZopfli } = require('wasm-zopfli');

const writeFile = promisify(fs.writeFile);

function compressString(source, algorithm) {
  const content = Buffer.from(source, 'utf-8');
  return algorithm === 'gzip'
    ? compZopfli(content)
    : Promise.resolve(compBrotli(content));
}

function compressArtifacts({ dir, fileName, source, algorithm }) {
  if (!['gzip', 'brotli'].includes(algorithm)) {
    throw new Error(
      `Only "gzip" and "brotli" compression is supported. Got "${algorithm}".`,
    );
  }
  const ext = algorithm === 'gzip' ? 'gz' : 'br';
  return compressString(source, algorithm).then(blob => {
    const baseFilePath = path.resolve(path.join(dir, fileName));
    const basePathParts = baseFilePath.split(/[/|\\]/);
    basePathParts.pop();
    const baseFolder = path.resolve(basePathParts.join('/'));
    const filePath = `${baseFilePath}.${ext}`;
    return mkdirp(baseFolder).then(() =>
      writeFile(filePath, blob, 'binary'),
    );
  });
}

workerpool.worker({ compressArtifacts });
