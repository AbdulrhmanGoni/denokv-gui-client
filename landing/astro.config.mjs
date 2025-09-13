// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import { readFileSync, writeFileSync } from 'node:fs';

// https://astro.build/config
export default defineConfig({
    vite: {
        plugins: [
            tailwindcss(),
            lastModificationDateAutoUpdator()
        ],
    },
    devToolbar: {
        enabled: false
    },
    base: `/denokv-gui-client`
});

function lastModificationDateAutoUpdator() {
    return {
        name: "Last Modification Date auto updator",
        closeBundle: () => {
            const stimapFilePath = "./dist/sitemap.xml"
            const xmlFile = readFileSync(stimapFilePath, { encoding: "utf-8" })
            const currentDate = new Date()
            writeFileSync(
                stimapFilePath,
                xmlFile.replace(
                    "{{Current Date}}",
                    `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`
                ),
                { encoding: "utf-8" }
            )
        }
    }
}