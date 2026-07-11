// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import { readFileSync, writeFileSync } from 'node:fs';

// https://astro.build/config
export default defineConfig({
    compressHTML: true,
    integrations: [
        lastModificationDateAutoUpdator()
    ],
    vite: {
        plugins: [
            tailwindcss()
        ],
    },
    devToolbar: {
        enabled: false
    },
    base: `/denokv-gui-client`,
    site: `https://abdulrhmangoni.github.io`,
    trailingSlash: `always`
});

/**
 * 
 * @returns {import('astro').AstroIntegration}
 */
function lastModificationDateAutoUpdator() {
    return {
        name: "Last Modification Date auto updator",
        hooks: {
            "astro:build:done": ({ dir }) => {
                const sitemapFileUrl = new URL("sitemap.xml", dir);
                const xmlFile = readFileSync(sitemapFileUrl, { encoding: "utf-8" });
                const currentDate = new Date();

                writeFileSync(
                    sitemapFileUrl,
                    xmlFile.replace(
                        "{{Current Date}}",
                        `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`
                    ),
                    { encoding: "utf-8" }
                );
            }
        }
    }
}
