import { defineConfig, type ViteDevServer, type PluginOption } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts";

type RendererWatchServerProvider = PluginOption & {
    api: { provideRendererWatchServer(): ViteDevServer };
};

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
        handleHotReload(),
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
});

/**
 * Implement Electron webview reload when some file change in the bridge-server package
 */
function handleHotReload() {
    let rendererWatchServer: import("vite").ViteDevServer | null = null;

    return {
        name: '@app/bridge-server-hot-reload',
        config(config, env) {
            if (env.mode !== 'development') return;

            const rendererWatchServerProvider = config.plugins?.find((p): p is RendererWatchServerProvider => {
                return Boolean(p && !Array.isArray(p) && 'name' in p && p.name === '@app/renderer-watch-server-provider');
            });
            if (!rendererWatchServerProvider) {
                throw new Error('Renderer watch server provider not found');
            }

            rendererWatchServer = rendererWatchServerProvider.api.provideRendererWatchServer();

            return { build: { watch: {} } };
        },
        writeBundle() {
            if (!rendererWatchServer) return;

            rendererWatchServer.ws.send({ type: 'full-reload' });
        },
    } satisfies PluginOption;
}
