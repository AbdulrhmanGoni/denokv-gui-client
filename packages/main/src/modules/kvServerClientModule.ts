import { ipcMain } from "electron";
import { ModuleContext } from "../ModuleContext.js";
import { AppModule } from "../AppModule.js";
import { getServerClient } from "./bridgeServer.js";

export class KvServerClientModule implements AppModule {
  enable(context: ModuleContext): void {
    ipcMain.handle(
      `kvClient:browse`,
      (_, params: BrowsingParams, nextCursor?: string) => {
        const serverClient = getServerClient();

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

        return serverClient.browse(options);
      },
    );

    ipcMain.handle(
      `kvClient:set`,
      async (
        _,
        kvKey: string | SerializedKvKey,
        value: SerializedKvValue,
        options?: SetKeyOptions,
      ) => {
        const serverClient = getServerClient();
        return serverClient.set(kvKey, value, options);
      },
    );

    ipcMain.handle(
      `kvClient:deleteKey`,
      (_, key: string | SerializedKvKey, options?: { jsKey?: boolean }) => {
        const serverClient = getServerClient();
        return serverClient.delete(key, options);
      },
    );

    ipcMain.handle(
      `kvClient:get`,
      (_, key: string | SerializedKvKey, options?: { jsKey?: boolean }) => {
        const serverClient = getServerClient();
        return serverClient.get(key, { ...options, xssSafe: false });
      },
    );

    ipcMain.handle(
      `kvClient:enqueue`,
      (
        _,
        value: EnqueueRequestInput["value"],
        options?: EnqueueRequestInput["options"],
      ) => {
        const serverClient = getServerClient();
        return serverClient.enqueue(value, options);
      },
    );

    ipcMain.handle(
      `kvClient:atomic`,
      (
        _,
        operations: AtomicOperationInput[],
        options?: { jsKey?: boolean },
      ) => {
        const serverClient = getServerClient();
        return serverClient.atomic(operations, options);
      },
    );

    ipcMain.handle(
      `kvClient:watch`,
      (
        _,
        keys: SerializedKvKey[],
        options?: {
          xssSafe?: boolean;
          jsKey?: boolean;
        },
      ) => {
        if (!context.browserWindow) {
          throw new Error(
            "Trying to call `kvClient:watch` before the browser window is created.",
          );
        }
        const serverClient = getServerClient();
        return serverClient.watch(
          keys,
          (updatedEntries: SerializedKvEntry[]) => {
            context.browserWindow?.webContents.send(
              "kvClient:watch-listener",
              updatedEntries,
            );
          },
          { ...options, xssSafe: false },
        );
      },
    );

    ipcMain.handle(`kvClient:cancelWatcher`, () => {
      const serverClient = getServerClient();
      serverClient.cancelWatcher();
    });
  }
}
