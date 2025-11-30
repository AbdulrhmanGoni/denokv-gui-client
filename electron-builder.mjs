import pkg from './package.json' with {type: 'json'};
import mapWorkspaces from '@npmcli/map-workspaces';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

export default /** @type import('electron-builder').Configuration */
  ({
    directories: {
      output: 'dist',
      buildResources: 'buildResources',
    },
    asarUnpack: [
      "node_modules/@dbmate/**",
      "node_modules/@app/preload/dist/migrations/**",
    ],
    generateUpdatesFilesForAllChannels: true,
    linux: {
      target: ['deb', 'AppImage'],
      icon: "buildResources",
    },
    artifactName: '${productName}-${version}-${os}-${arch}.${ext}',
    files: [
      'LICENSE*',
      pkg.main,
      '!node_modules/@app/**',
      ...await getListOfFilesFromEachWorkspace(),
      {
        from: "node_modules/@deno",
        to: "node_modules/@deno",
      },
      {
        from: "node_modules/hono",
        to: "node_modules/hono",
      },
      {
        from: "node_modules/@hono/node-server",
        to: "node_modules/@hono/node-server",
      },
      {
        from: "node_modules/serialize-javascript",
        to: "node_modules/serialize-javascript",
      },
      {
        from: "node_modules/randombytes",
        to: "node_modules/randombytes",
      },
      {
        from: "node_modules/dbmate",
        to: "node_modules/dbmate",
      },
      {
        from: "node_modules/@dbmate",
        to: "node_modules/@dbmate",
      },
    ],
  });

/**
 * By default, electron-builder copies each package into the output compilation entirety,
 * including the source code, tests, configuration, assets, and any other files.
 *
 * So you may get compiled app structure like this:
 * ```
 * app/
 * ├── node_modules/
 * │   └── workspace-packages/
 * │       ├── package-a/
 * │       │   ├── src/            # Garbage. May be safely removed
 * │       │   ├── dist/
 * │       │   │   └── index.js    # Runtime code
 * │       │   ├── vite.config.js  # Garbage
 * │       │   ├── .env            # some sensitive config
 * │       │   └── package.json
 * │       ├── package-b/
 * │       ├── package-c/
 * │       └── package-d/
 * ├── packages/
 * │   └── entry-point.js
 * └── package.json
 * ```
 *
 * To prevent this, we read the “files”
 * property from each package's package.json
 * and add all files that do not match the patterns to the exclusion list.
 *
 * This way,
 * each package independently determines which files will be included in the final compilation and which will not.
 *
 * So if `package-a` in its `package.json` describes
 * ```json
 * {
 *   "name": "package-a",
 *   "files": [
 *     "dist/**\/"
 *   ]
 * }
 * ```
 *
 * Then in the compilation only those files and `package.json` will be included:
 * ```
 * app/
 * ├── node_modules/
 * │   └── workspace-packages/
 * │       ├── package-a/
 * │       │   ├── dist/
 * │       │   │   └── index.js    # Runtime code
 * │       │   └── package.json
 * │       ├── package-b/
 * │       ├── package-c/
 * │       └── package-d/
 * ├── packages/
 * │   └── entry-point.js
 * └── package.json
 * ```
 */
async function getListOfFilesFromEachWorkspace() {

  /**
   * @type {Map<string, string>}
   */
  const workspaces = await mapWorkspaces({
    cwd: process.cwd(),
    pkg,
  });

  const allFilesToInclude = [];

  for (const [name, path] of workspaces) {
    const pkgPath = join(path, 'package.json');
    const { default: workspacePkg } = await import(pathToFileURL(pkgPath), { with: { type: 'json' } });

    let patterns = workspacePkg.files || ['dist/**', 'package.json'];

    patterns = patterns.map(p => join('node_modules', name, p));
    allFilesToInclude.push(...patterns);
  }

  return allFilesToInclude;
}
