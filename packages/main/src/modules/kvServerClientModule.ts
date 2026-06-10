import { ipcMain } from "electron";
import { ModuleContext } from "../ModuleContext.js";
import { AppModule } from "../AppModule.js";
import { getServerClient } from "./bridgeServer.js";
import { serializeKvKey } from "@app/bridge-server";

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
        };

        if (nextCursor) {
          options.cursor = nextCursor;
        }

        for (const param of ["prefix", "start", "end"] as const) {
          const result = kvKeyStringToSerializedForm(params[param]);
          if (result.key && result.key.length) {
            Object.assign(options, { [param]: result.key });
          } else {
            if (!result.key) {
              return {
                error: result.error,
                result: null,
              };
            }
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

        if (typeof kvKey == "string") {
          const result = kvKeyStringToSerializedForm(kvKey);
          if (result.key) {
            return serverClient.set(result.key, value, options);
          }

          return {
            error: result.error,
            result: null,
          };
        }

        return serverClient.set(kvKey, value, options);
      },
    );

    ipcMain.handle(`kvClient:deleteKey`, (_, key: SerializedKvKey) => {
      const serverClient = getServerClient();
      return serverClient.delete(key);
    });

    ipcMain.handle(`kvClient:get`, (_, key: string | SerializedKvKey) => {
      const serverClient = getServerClient();

      const options = { xssSafe: false };
      if (typeof key == "string") {
        const result = kvKeyStringToSerializedForm(key);
        if (result.key) {
          return serverClient.get(result.key, options);
        }

        return {
          error: result.error,
          result: null,
        };
      }

      return serverClient.get(key, options);
    });

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
      (_, operations: AtomicOperationInput[]) => {
        const serverClient = getServerClient();
        return serverClient.atomic(operations);
      },
    );

    ipcMain.handle(`kvClient:watch`, (_, keys: SerializedKvKey[]) => {
      if (!context.browserWindow) {
        throw new Error(
          "Trying to call `kvClient:watch` before the browser window is created.",
        );
      }
      const serverClient = getServerClient();
      serverClient.watch(
        keys,
        (updatedEntries: SerializedKvEntry[]) => {
          context.browserWindow?.webContents.send(
            "kvClient:watch-listener",
            updatedEntries,
          );
        },
        { xssSafe: false },
      );
    });

    ipcMain.handle(`kvClient:cancelWatcher`, () => {
      const serverClient = getServerClient();
      serverClient.cancelWatcher();
    });
  }
}

function kvKeyStringToSerializedForm(stringKvKey: string): {
  key: SerializedKvKey | null;
  error: string | null;
} {
  let key = null;
  try {
    key = eval(`(${stringKvKey})`);
  } catch (error) {
    return {
      key: null,
      error: String(error),
    };
  }

  if (!(key instanceof Array)) {
    return {
      key: null,
      error:
        "Invalid Key. It should be an array of string, number, bigint, boolean or Uint8Array",
    };
  }

  const allKeyPartsAreValid = key.every(
    (part) =>
      ["string", "number", "bigint", "boolean"].includes(typeof part) ||
      part instanceof Uint8Array,
  );

  if (!allKeyPartsAreValid) {
    return {
      key: null,
      error:
        "Invalid Key Part. The key should contain only string, number, bigint, boolean or Uint8Array",
    };
  }

  return {
    key: serializeKvKey(key),
    error: null,
  };
}
