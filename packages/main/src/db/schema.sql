CREATE TABLE IF NOT EXISTS "schema_migrations" (version varchar(128) primary key);
CREATE TABLE kvStores (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    type TEXT NOT NULL,
    accessToken TEXT DEFAULT NULL,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
, authToken TEXT DEFAULT NULL);
CREATE TABLE userSettings (
    settingsId TEXT PRIMARY KEY,
    settingsAsJsonText TEXT NOT NULL
);
CREATE TABLE lastFetchedUpdate (
    lastUpdateId TEXT PRIMARY KEY,
    updateInfoAsJson TEXT NOT NULL
, doNotNotify BOOLEAN DEFAULT 0);
CREATE TABLE browsingParams (
    id TEXT PRIMARY KEY,
    paramsAsJson TEXT NOT NULL,
    isDefault INTEGER NOT NULL,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    kvStoreId TEXT
    -- FOREIGN KEY (kvStoreId) REFERENCES kvStores(id) ON DELETE CASCADE
);
CREATE TABLE watchedKeys (
    id TEXT PRIMARY KEY,
    keysAsJson TEXT NOT NULL,
    kvStoreId TEXT UNIQUE NOT NULL
);
-- Dbmate schema migrations
INSERT INTO "schema_migrations" (version) VALUES
  ('20250802120127'),
  ('20250928103303'),
  ('20250929180946'),
  ('20251024195646'),
  ('20251209204559'),
  ('20260328190439'),
  ('20260402143135'),
  ('20260429230505');
