/**
 * A global variable that holds the current application version
 *
 * It's defined at build time from the `version` field of the root `package.json`.
 */
declare const APP_VERSION: string;

/**
 * A global variable that holds the github repository url of the application.
 *
 * It's defined at build time from the `repository.url` field of the root `package.json`.
 */
declare const APP_GITHUB_REPO: string;

/**
 * A global variable that holds the variant name of the application (e.g. "stable",
 * "preview").
 *
 * It's defined at build time via `APP_VARIANT` env variable.
 */
declare const APP_VARIANT: string;
