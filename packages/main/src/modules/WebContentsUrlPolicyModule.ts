import { shell } from "electron";
import { URL } from "node:url";

export class WebContentsUrlPolicyModule {
  #allowedExternalOrigins = ["https://github.com", "https://docs.deno.com"];

  constructor(app: Electron.App, internalOrigin: string) {
    app.on("web-contents-created", (_, contents) => {
      contents.on("will-navigate", (event, url) => {
        const { origin } = new URL(url);
        if (internalOrigin && origin === internalOrigin) return;

        event.preventDefault();

        if (import.meta.env.DEV) {
          console.warn(`[Security] Blocked navigation to disallowed origin: ${origin}`);
        }
      });

      contents.setWindowOpenHandler(({ url }) => {
        const { origin } = new URL(url);

        if (this.#allowedExternalOrigins.includes(origin)) {
          shell.openExternal(url).catch(console.error);
        } else if (import.meta.env.DEV) {
          console.warn(
            `[Security] Blocked external URL for disallowed origin: ${origin}`,
          );
        }

        return { action: "deny" };
      });
    });
  }
}
