const ossign = require("@ossign/ossign");

// Keep track of signed file paths to avoid signing the same binary multiple times.
const signedFilePaths = new Set();

// Custom signing script that uses OSSign to sign binaries. This signing happens in the OSSign Repository.
function sign(configuration) {
  const { path: filePath } = configuration;

  if (signedFilePaths.has(filePath)) {
    console.log(`Skipping already signed binary: ${filePath}`);
    return;
  }

  if (!process.env.OSSIGN_CONFIG && !process.env.OSSIGN_CONFIG_BASE64) {
    throw new Error(
      "OSSIGN_CONFIG or OSSIGN_CONFIG_BASE64 environment variable must be set to sign binaries.",
    );
  }

  console.log(`Signing ${filePath} with OSSign...`);
  ossign.SignSync(filePath, filePath, "pecoff");
  signedFilePaths.add(filePath);
  console.log(`Signed ${filePath}`);
}

module.exports = { sign };
