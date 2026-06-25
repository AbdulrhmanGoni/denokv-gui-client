import { shell } from "electron";
import { URL } from "node:url";
import { AppModule } from "../AppModule.js";
import { ModuleContext } from "../ModuleContext.js";

export class WebContentsUrlPolicy implements AppModule {
  readonly internalOrigin: string;
  readonly allowedExternalOrigins = [
    "https://github.com",
    "https://docs.deno.com",
  ];

  constructor(internalOrigin: string) {
    this.internalOrigin = internalOrigin;
  }

  enable({ app }: ModuleContext): Promise<void> | void {
    app.on("web-contents-created", (_, contents) => {
      contents.on("will-navigate", (event, url) => {
        const { origin } = new URL(url);
        if (this.internalOrigin && origin === this.internalOrigin) return;

        event.preventDefault();

        if (import.meta.env.DEV) {
          console.warn(
            `[Security] Blocked navigation to disallowed origin: ${origin}`,
          );
        }
      });

      contents.setWindowOpenHandler(({ url }) => {
        const { origin } = new URL(url);

        if (this.allowedExternalOrigins.includes(origin)) {
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
