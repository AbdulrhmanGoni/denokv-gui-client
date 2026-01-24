import pkg from './package.json' with { type: 'json' };
import mapWorkspaces from '@npmcli/map-workspaces';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import os from 'node:os';

/** @type import('electron-builder').Configuration */
const platformSpecificConfig = {}

switch (os.platform()) {
  case "linux":
    platformSpecificConfig.linux = {
      target: ['deb', 'AppImage'],
      icon: "buildResources",
    }
    break;

  case "darwin":
    if (os.arch() == "x64") {
      platformSpecificConfig.mac = {
        identity: null,
        target: [
          { target: "dmg", arch: ["x64"] },
          { target: "zip", arch: ["x64"] },
        ],
        icon: "buildResources/icon.icns",
      }
    } else if (os.arch() == "arm64") {
      // uses the default config for now
    }
    break;

  case "win32":
    // uses the default config for now
    break;
}

export default /** @type import('electron-builder').Configuration */
  ({
    ...platformSpecificConfig,
    directories: {
      output: 'dist',
      buildResources: 'buildResources',
    },
    asarUnpack: [
      "node_modules/@dbmate/**",
      "node_modules/@app/main/dist/migrations/**",
    ],
    generateUpdatesFilesForAllChannels: true,
    artifactName: '${productName}-${version}-${os}-${arch}.${ext}',
    files: [
      'LICENSE*',
      pkg.main,
      ...await getListOfFilesFromEachWorkspace(),
    ],
  });

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
