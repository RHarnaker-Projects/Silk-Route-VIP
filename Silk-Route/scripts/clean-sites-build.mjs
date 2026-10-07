import { rm } from 'node:fs/promises';
import { basename, resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const buildDirectory = resolve(projectRoot, 'dist');

if (basename(buildDirectory) !== 'dist' || buildDirectory === projectRoot) {
  throw new Error('Refusing to clean an unsafe Sites build directory.');
}

await rm(buildDirectory, { recursive: true, force: true });
console.log('Cleaned the Sites build directory.');
