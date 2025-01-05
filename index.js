#!/usr/bin/env node

// @ts-check

import { sync as spawnSync } from 'cross-spawn';
import { existsSync } from 'node:fs';
import { mkdir, cp, rename, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';

// The first argument will be the project name.
const projectName = process.argv[2];

if (!projectName) {
    throw new Error('Please pass a project name as an argument');
}

// Create a project directory with the project name.
const currentDir = process.cwd();
const projectDir = resolve(currentDir, projectName);

if (existsSync(projectDir)) {
    throw new Error('Folder already exists!');
}

await mkdir(projectDir, { recursive: true });

// A common approach to building a starter template is to
// create a `template` folder which will house the template
// and the files we want to create.
const templateDir = resolve(import.meta.dirname, 'template');
await cp(templateDir, projectDir, { recursive: true });

const { default: projectPackageJson } = await import(
    pathToFileURL(join(projectDir, 'package.json')).href,
    { with: { type: 'json' } }
);

// Update the project's package.json with the new project name
projectPackageJson.name = projectName;

await writeFile(join(projectDir, 'package.json'), JSON.stringify(projectPackageJson, null, 4));

// Run `pnpm install` in the project directory to install
// the dependencies. We are using a third-party library
// called `cross-spawn` for cross-platform support.
// (Node has issues spawning child processes in Windows).
spawnSync('pnpm', ['install'], { stdio: 'inherit', cwd: projectDir });

console.log('Success! Your new project is ready.');
console.log(`Created ${projectName} at ${projectDir}`);
