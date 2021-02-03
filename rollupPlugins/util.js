/* eslint-disable import/no-extraneous-dependencies */
import minimatch from 'minimatch';

export function unixify(path) {
  return path.replace(/\\/g, '/');
}

export function createFilter(patterns) {
  return str => patterns.some(pattern => minimatch(str, pattern));
}

export function failIf(condition, error) {
  if (condition) {
    throw new Error(error);
  }
}

export function toHex(str) {
  return Buffer.from(str).toString('hex');
}

export function fromHex(str) {
  return Buffer.from(str, 'hex').toString();
}
