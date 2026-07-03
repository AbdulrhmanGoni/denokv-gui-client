import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";

if (!process.env.SIGNED_ARTIFACTS) {
  throw new Error("SIGNED_ARTIFACTS environment variable is not set");
}

type ReleaseAsset = {
  id: string;
  name: string;
  url: string;
  browser_download_url: string;
};

let releaseAssets: ReleaseAsset[] | null = null;

try {
  releaseAssets = JSON.parse(process.env.SIGNED_ARTIFACTS);
} catch (error) {
  throw new Error(`Failed to parse SIGNED_ARTIFACTS environment variable: ${error}`);
}

if (!releaseAssets || releaseAssets.length === 0) {
  throw new Error(
    `SIGNED_ARTIFACTS environment variable should be a non-empty array of release assets. Got: ${process.env.SIGNED_ARTIFACTS}`,
  );
}

const signedArtifactsDir = "signed-artifacts";
mkdirSync(signedArtifactsDir, { recursive: true });

for (const asset of releaseAssets) {
  const assetPath = `${signedArtifactsDir}/${asset.name}`;
  try {
    execSync(`curl -sSL -o "${assetPath}" ${asset.browser_download_url}`);
  } catch (error) {
    throw new Error(
      `Failed to download '${asset.name}' asset from ${asset.browser_download_url}: ${error}`,
    );
  }

  if (!existsSync(assetPath)) {
    throw new Error(
      `"${asset.name}" asset was not correctly downloaded into "${assetPath}" path!`,
    );
  }
}
