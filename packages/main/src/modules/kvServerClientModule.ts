import { ipcMain } from "electron";
import type { AppModule, ModuleContext } from "./types.js";
import { bridgeServerController } from "./bridgeServer.js";
import type { BridgeServerClient } from "@app/bridge-server";

export interface KvServerClientInterface {
  browse(
    params: BrowsingParams,
    nextCursor?: string,
  ): ReturnType<BridgeServerClient["browse"]>;
  set: BridgeServerClient["set"];
  deleteKey: BridgeServerClient["delete"];
  get: BridgeServerClient["get"];
  enqueue: BridgeServerClient["enqueue"];
  atomic: BridgeServerClient["atomic"];
  watch: (
    keys: Parameters<BridgeServerClient["watch"]>[0],
    options?: Parameters<BridgeServerClient["watch"]>[2],
  ) => Promise<void | { error: string }>;
  cancelWatcher: BridgeServerClient["cancelWatcher"];
}

export class KvServerClientModule implements AppModule {
  enable(context: ModuleContext): void {
    const browse: KvServerClientInterface["browse"] = async (params, nextCursor) => {
      const options: BrowseRouteOptions = {
        limit: params.limit,
        batchSize: params.batchSize,
        consistency: params.consistency,
        reverse: params.reverse,
        xssSafe: false,
        jsKey: true,
      };

      if (nextCursor) {
        options.cursor = nextCursor;
      }

      for (const param of ["prefix", "start", "end"] as const) {
        if (params[param] === "[]") continue;

        const evaluatedKey = (0, eval)(`(${params[param]})`);
        const isArray = Array.isArray(evaluatedKey);
        if (isArray) {
          if (evaluatedKey.length) options[param] = params[param];
        } else {
          return {
            error: `Invalid ${param} Key, Must be an array containing valid Deno Kv Key-parts`,
            result: null,
          };
        }
      }

      return bridgeServerController.client.browse(options);
    };
    ipcMain.handle(`kvClient:browse`, (_, ...args: Parameters<typeof browse>) => {
      return browse(...args);
    });

    const set: KvServerClientInterface["set"] = async (kvKey, value, options) => {
      return bridgeServerController.client.set(kvKey, value, options);
    };
    ipcMain.handle(`kvClient:set`, (_, ...args: Parameters<typeof set>) => {
      return set(...args);
    });

    const deleteKey: KvServerClientInterface["deleteKey"] = async (key, options) => {
      return bridgeServerController.client.delete(key, options);
    };
    ipcMain.handle(`kvClient:deleteKey`, (_, ...args: Parameters<typeof deleteKey>) => {
      return deleteKey(...args);
    });

    const get: KvServerClientInterface["get"] = async (key, options) => {
      return bridgeServerController.client.get(key, {
        ...options,
        xssSafe: false,
      });
    };
    ipcMain.handle(`kvClient:get`, (_, ...args: Parameters<typeof get>) => {
      return get(...args);
    });

    const enqueue: KvServerClientInterface["enqueue"] = async (value, options) => {
      return bridgeServerController.client.enqueue(value, options);
    };
    ipcMain.handle(`kvClient:enqueue`, (_, ...args: Parameters<typeof enqueue>) => {
      return enqueue(...args);
    });

    const atomic: KvServerClientInterface["atomic"] = async (operations, options) => {
      return bridgeServerController.client.atomic(operations, options);
    };
    ipcMain.handle(`kvClient:atomic`, (_, ...args: Parameters<typeof atomic>) => {
      return atomic(...args);
    });

    const watch: KvServerClientInterface["watch"] = async (keys, options) => {
      if (!context.browserWindow) {
        throw new Error(
          "Trying to call `kvClient:watch` before the browser window is created.",
        );
      }
      return bridgeServerController.client.watch(
        keys,
        (updatedEntries: SerializedKvEntry[]) => {
          context.browserWindow?.webContents.send(
            "kvClient:watch-listener",
            updatedEntries,
          );
        },
        { ...options, xssSafe: false },
      );
    };
    ipcMain.handle(`kvClient:watch`, (_, ...args: Parameters<typeof watch>) => {
      return watch(...args);
    });

    const cancelWatcher: KvServerClientInterface["cancelWatcher"] = () => {
      return bridgeServerController.client.cancelWatcher();
    };
    ipcMain.handle(`kvClient:cancelWatcher`, cancelWatcher);
  }
}
