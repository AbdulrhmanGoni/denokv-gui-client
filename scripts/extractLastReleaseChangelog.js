import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';

const readStream = createReadStream("./CHANGELOG.md", { encoding: "utf-8" });

const rl = createInterface({ input: readStream });

let changelog = ""
let fullChangelogCompareLink = ""
let targetFound = false
let closed = false

rl.on("line", (line) => {
    if (closed) return

    if (line.match(/^## \[?\d+.\d+.\d+\]?/)) {
        if (targetFound) {
            rl.close()
            closed = true
        } else {
            const [, compareLink] = line.split(" ")
            const compareVersionsText = compareLink.match(/v\d+.\d+.\d+...v\d+.\d+.\d+/)
            if (compareVersionsText) {
                fullChangelogCompareLink = compareLink.replace(
                    /\[\d+.\d+.\d+\]/,
                    `**Full Changelog**: [${compareVersionsText[0]}]`
                )
            }

            targetFound = true
            return
        }
    }

    if (targetFound) {
        changelog += line + "\n"
    }
})

rl.on("close", () => {
    process.stdout.write(
        changelog.trim() + (fullChangelogCompareLink ? `\n\n` + fullChangelogCompareLink : "")
    )
})