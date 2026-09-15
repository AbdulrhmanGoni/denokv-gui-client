import type { UserConfig, PluginOption, ViteDevServer } from "vite";

export type RendererWatchServerProvider = PluginOption & {
  api: { provideRendererWatchServer(): ViteDevServer };
};

export function findRendererWatchServer(config: UserConfig): ViteDevServer {
  const rendererWatchServerProvider = config.plugins?.find(
    (p): p is RendererWatchServerProvider => {
      return Boolean(
        p &&
        !Array.isArray(p) &&
        "name" in p &&
        p.name === "@app/renderer-watch-server-provider",
      );
    },
  );

  if (!rendererWatchServerProvider) {
    throw new Error("Renderer watch server provider not found");
  }

  return rendererWatchServerProvider.api.provideRendererWatchServer();
}
