import { URL } from 'node:url';
import { AppModule } from '../AppModule.js';
import { ModuleContext } from '../ModuleContext.js';

/**
 * Block navigation to origins not on the allowlist.
 *
 * Navigation exploits are quite common. If an attacker can convince the app to navigate away from its current page,
 * they can possibly force the app to open arbitrary web resources/websites on the web.
 *
 * @see https://www.electronjs.org/docs/latest/tutorial/security#13-disable-or-limit-navigation
 */
export class BlockNotAllowedOrigins implements AppModule {
  readonly #allowedOrigin: string;

  constructor(internalOrigin: string) {
    this.#allowedOrigin = internalOrigin
  }

  enable({ app }: ModuleContext): Promise<void> | void {
    app.on('web-contents-created', (_, contents) => {
      contents.on('will-navigate', (event, url) => {
        const { origin } = new URL(url);
        if (this.#allowedOrigin && origin === this.#allowedOrigin) return;

        // Prevent navigation
        event.preventDefault();

        if (import.meta.env.DEV) {
          console.warn(`[Security] Blocked navigating to disallowed origin: ${origin}`);
        }
      });
    });
  }
}

export function allowInternalOrigins(internalOrigin: string): BlockNotAllowedOrigins {
  return new BlockNotAllowedOrigins(internalOrigin);
}
