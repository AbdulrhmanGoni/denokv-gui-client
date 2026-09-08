import { database } from "../db.js";

export const upsertWatchedKeysQuery = database.prepare(`
  INSERT INTO watchedKeys(id, kvStoreId, keysAsJson)
  VALUES($id, $kvStoreId, $keys)
  ON CONFLICT(kvStoreId) DO UPDATE SET keysAsJson = excluded.keysAsJson
`);

export const getWatchedKeysQuery = database.prepare(
  "SELECT keysAsJson FROM watchedKeys WHERE kvStoreId = ?",
);

export const deleteWatchedKeysQuery = database.prepare(
  "DELETE FROM watchedKeys WHERE kvStoreId = ?",
);
