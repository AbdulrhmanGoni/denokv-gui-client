import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";

export async function extractLastReleaseChangelog(
  pathToChangelogFile = "./CHANGELOG.md",
) {
  const readStream = createReadStream(pathToChangelogFile, { encoding: "utf-8" });

  const rl = createInterface({ input: readStream });

  let changelog = "";
  let fullChangelogCompareLink = "";
  let foundHeadLine = false;

  for await (const line of rl) {
    if (line.match(/^## \[?\d+.\d+.\d+\]?/)) {
      if (foundHeadLine) {
        break;
      }
      foundHeadLine = true;
      const [, compareLink] = line.split(" ");
      const compareVersionsText = compareLink.match(/v\d+.\d+.\d+...v\d+.\d+.\d+/);
      if (compareVersionsText) {
        fullChangelogCompareLink = compareLink.replace(
          /\[\d+.\d+.\d+\]/,
          `**Full Changelog**: [${compareVersionsText[0]}]`,
        );
      }

      continue;
    }

    if (foundHeadLine) {
      changelog += line + "\n";
    }
  }

  return (
    changelog.trim() + (fullChangelogCompareLink ? `\n\n` + fullChangelogCompareLink : "")
  );
}
