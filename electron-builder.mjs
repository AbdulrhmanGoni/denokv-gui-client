import pkg from "./package.json" with { type: "json" };
import path from "node:path";
import os from "node:os";
import { readdirSync } from "node:fs";

function getPlatformConfig() {
  /** @type import('electron-builder').Configuration */
  const platformConfig = {};

  switch (os.platform()) {
    case "linux":
      platformConfig.linux = {
        target: ["AppImage"],
        icon: "buildResources",
      };
      break;

    case "darwin":
      const arch = os.arch();
      if (arch == "x64") {
        platformConfig.mac = {
          identity: null,
          target: [
            { target: "dmg", arch: ["x64"] },
            { target: "zip", arch: ["x64"] },
          ],
          icon: "buildResources/icon.icns",
        };
      } else if (arch == "arm64") {
        // uses the default config for now
      }
      break;

    case "win32":
      // Call the signing when the environment variables are set, otherwise skip it to avoid build failures in CI environments where the signing credentials are not available.
      if (process.env.OSSIGN_CONFIG || process.env.OSSIGN_CONFIG_BASE64) {
        platformConfig.win = {
          signtoolOptions: {
            sign: "./scripts/customSign.cjs",
            signingHashAlgorithms: ["sha256"],
          },
        };
      }
      break;
  }

  return platformConfig;
}

function getAppPackagesFiles() {
  const filesToIncludeOrExclude = [];

  const packagesDir = readdirSync("./packages", { withFileTypes: true });
  for (const fileOrDir of packagesDir) {
    if (fileOrDir.isDirectory()) {
      const packagePath = path.join("node_modules", "@app", fileOrDir.name)
      filesToIncludeOrExclude.push(
        "!" + path.join(packagePath, "**"),
        path.join(packagePath, "dist"),
        path.join(packagePath, "package.json"),
      );
    }
  }

  return filesToIncludeOrExclude;
}

export default /** @type import('electron-builder').Configuration */
({
  publish: {
    provider: "github",
    owner: "AbdulrhmanGoni",
    repo: "denokv-gui-client",
  },
  ...getPlatformConfig(),
  directories: {
    output: "dist",
    buildResources: "buildResources",
  },
  asarUnpack: ["node_modules/@app/main/dist/migrations/**"],
  artifactName: "${productName}-${version}-${os}-${arch}.${ext}",
  files: ["LICENSE*", pkg.main, ...getAppPackagesFiles()],
});
