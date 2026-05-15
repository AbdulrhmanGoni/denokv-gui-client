import { defineConfig } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
    build: {
        outDir: 'dist',
        target: 'node18',
        lib: {
            entry: {
                index: resolve(__dirname, 'src/index.ts'),
                "kv-utils": resolve(__dirname, 'src/kv-utils.ts'),
            },
            formats: ['es'],
            fileName: (_format, entryName) => `${entryName}.mjs`,
        },
        rollupOptions: {
            external: [
                '@deno/kv',
                '@hono/node-server',
                'hono',
                'hono/tiny',
                'serialize-javascript',
                /^node:.*/,
            ],
            output: {
                preserveModules: false,
                exports: 'named',
            },
        },
        emptyOutDir: true,
        reportCompressedSize: false,
    },
    plugins: [
        dts({
            include: ['src/**/*'],
            rollupTypes: true,
        }),
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
});
