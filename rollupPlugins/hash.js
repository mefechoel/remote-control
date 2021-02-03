/* eslint-disable import/no-extraneous-dependencies */
import crypto from 'crypto';
import { createFilter } from './util';

function createHash(str) {
  return crypto
    .createHash('md5')
    .update(str)
    .digest('hex')
    .substr(0, 16);
}

export default function hashPlugin({
  exclude = ['index.html', 'favicon.ico', '**/*.map'],
} = {}) {
  const isExcluded = createFilter(exclude);
  return {
    name: 'hash-plugin',
    async generateBundle(options, bundle) {
      Object.entries(bundle).forEach(
        ([key, { fileName, code, source }]) => {
          if (!isExcluded(key)) {
            const hashStr = createHash(code || source);
            const fileNameParts = fileName.split('.');
            const ext = fileNameParts.pop();
            fileNameParts.push(hashStr);
            fileNameParts.push(ext);
            const newFileName = fileNameParts.join('.');
            // eslint-disable-next-line no-param-reassign
            bundle[key].fileName = newFileName;
            if (bundle[`${key}.map`]) {
              // eslint-disable-next-line no-param-reassign
              bundle[`${key}.map`].fileName = `${newFileName}.map`;
            }
          }
        },
      );
    },
  };
}
