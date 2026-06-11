import { shell } from "electron";
import { URL } from "node:url";
import { AppModule } from "../AppModule.js";
import { ModuleContext } from "../ModuleContext.js";

const TRUSTED_EXTERNAL_ORIGINS = new Set([
  "https://github.com",
  "https://docs.deno.com",
]);

type WebContentsUrlPolicyConfig = {
  allowedNavigationOrigin: string;
  allowedExternalOrigins: Set<string>;
};

/**
 * Enforce URL policies for renderer-created navigation and external links.
 *
 * Navigation exploits are quite common. If an attacker can convince the app to navigate away from its current page,
 * they can possibly force the app to open arbitrary web resources/websites on the web.
 *
 * @see https://www.electronjs.org/docs/latest/tutorial/security#13-disable-or-limit-navigation
 */
export class WebContentsUrlPolicy implements AppModule {
  readonly #allowedNavigationOrigin: string;
  readonly #allowedExternalOrigins: Set<string>;

  constructor(config: WebContentsUrlPolicyConfig) {
    this.#allowedNavigationOrigin = config.allowedNavigationOrigin;
    this.#allowedExternalOrigins = config.allowedExternalOrigins;
  }

  enable({ app }: ModuleContext): Promise<void> | void {
    app.on("web-contents-created", (_, contents) => {
      contents.on("will-navigate", (event, url) => {
        const { origin } = new URL(url);
        if (
          this.#allowedNavigationOrigin &&
          origin === this.#allowedNavigationOrigin
        )
          return;

        event.preventDefault();

        if (import.meta.env.DEV) {
          console.warn(
            `[Security] Blocked navigation to disallowed origin: ${origin}`,
          );
        }
      });

      contents.setWindowOpenHandler(({ url }) => {
        const { origin } = new URL(url);

        if (this.#allowedExternalOrigins.has(origin)) {
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

export function createWebContentsUrlPolicy(
  internalOrigin: string,
): WebContentsUrlPolicy {
  return new WebContentsUrlPolicy({
    allowedNavigationOrigin: internalOrigin,
    allowedExternalOrigins: TRUSTED_EXTERNAL_ORIGINS,
  });
}
