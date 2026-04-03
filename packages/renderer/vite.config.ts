import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'node:path';

export default defineConfig({
    plugins: [
        tailwindcss(),
        svelte({
            compilerOptions: {
                warningFilter: (warning) => warning.code !== 'state_referenced_locally'
            }
        })
    ],
    resolve: {
        alias: {
            $lib: path.resolve(__dirname, "./src/lib"),
        },
    },
});
