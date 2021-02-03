/* eslint-disable import/no-extraneous-dependencies */
import fs from 'fs';
import { promisify } from 'util';
import { failIf } from './util';

const readFile = promisify(fs.readFile);

async function createManifestJSON(manifest) {
  const type = typeof manifest;
  switch (type) {
    case 'object': {
      failIf(
        manifest === null,
        'Manifest must be a string or an object. Received "null"',
      );
      return JSON.stringify(manifest);
    }
    case 'string': {
      const fileContents = await readFile(manifest, 'utf-8');
      const manifestObj = JSON.parse(fileContents);
      // Check file for compatibility and minify by calling
      // `JSON.stringify` on parsed json.
      return createManifestJSON(manifestObj);
    }
    default:
      throw new Error(
        `Manifest must be a string or an object. Received type "${type}"`,
      );
  }
}

export default function manifestPlugin({ manifest }) {
  return {
    name: 'manifest-plugin',
    async generateBundle() {
      const json = await createManifestJSON(manifest);
      this.emitFile({
        type: 'asset',
        source: json,
        fileName: 'manifest.json',
      });
    },
  };
}
