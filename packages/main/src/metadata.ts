import pkg from '../../../package.json' with { type: 'json' };
import { versions } from 'node:process';

export const appVersion = pkg.version;
export const nodeVersion = versions.node;
export const electronVersion = versions.electron;
export const githubRepo = pkg.homepage;
export const environment = process.env.PLAYWRIGHT_TEST === 'true' ? 'testing' :
    process.env.NODE_ENV === 'development' ? 'development' : 'production';
