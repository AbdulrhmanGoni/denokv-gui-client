import { extractLastReleaseChangelog } from "./extractLastReleaseChangelog.ts";

const releaseNotes = await extractLastReleaseChangelog();
process.stdout.write(releaseNotes);
