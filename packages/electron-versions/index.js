import { execSync } from "node:child_process";

function getElectronEnv() {
  let output = execSync(`npx electron -p "JSON.stringify(process.versions)"`, {
    encoding: "utf-8",
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: 1,
    },
  });

  return JSON.parse(output.slice(output.indexOf("{")));
}

function createElectronEnvLoader() {
  let inMemoryCache = null;

  return () => {
    if (inMemoryCache) {
      return inMemoryCache;
    }

    return (inMemoryCache = getElectronEnv());
  };
}

const envLoader = createElectronEnvLoader();

export function getElectronVersions() {
  return envLoader();
}

export function getChromeVersion() {
  return getElectronVersions().chrome;
}

export function getChromeMajorVersion() {
  return getMajorVersion(getChromeVersion());
}

export function getNodeVersion() {
  return getElectronVersions().node;
}

export function getNodeMajorVersion() {
  return getMajorVersion(getNodeVersion());
}

function getMajorVersion(version) {
  return parseInt(version.split(".")[0]);
}
