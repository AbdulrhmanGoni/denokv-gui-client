import pkg from '../../../package.json' with { type: 'json' };
import { versions } from 'node:process';

export const appVersion = pkg.version;
export const nodeVersion = versions.node;
export const electronVersion = versions.electron;
export const appGithubRepo = pkg.homepage;
