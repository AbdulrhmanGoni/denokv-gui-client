import { defineConfig } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts";

export default defineConfig(({ }) => ({
    build: {
        outDir: 'dist',
        target: 'node18',
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            formats: ['es'],
            fileName: 'index.mjs',
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
        }),
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
}));

