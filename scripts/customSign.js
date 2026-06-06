// const ossign = require('@ossign/ossign');
import { SignSync } from '@ossign/ossign';

const signedFilePaths = new Set();


/**
 * Custom signing script for OSSign integration with electron-builder.
 *
 * The @ossign/ossign package downloads the ossign CLI on first use and shells out to it.
 * The CLI reads its signing config from the OSSIGN_CONFIG or OSSIGN_CONFIG_BASE64
 * environment variable, which must be set in the calling environment.
 *
 * @param {import('app-builder-lib').CustomWindowsSignTaskConfiguration} configuration
 * @returns {void}
 */
function sign(configuration) {
  const { path: filePath } = configuration;

  if (signedFilePaths.has(filePath)) {
    console.log(`Skipping already signed binary: ${filePath}`);
    return;
  }

  if (!process.env.OSSIGN_CONFIG && !process.env.OSSIGN_CONFIG_BASE64) {
    throw new Error('OSSIGN_CONFIG or OSSIGN_CONFIG_BASE64 environment variable must be set to sign binaries.');
  }

  console.log(`Signing ${filePath} with OSSign...`);
  SignSync(filePath, filePath, 'pecoff');
  signedFilePaths.add(filePath);
  console.log(`Signed ${filePath}`);
}

module.exports = { sign };
