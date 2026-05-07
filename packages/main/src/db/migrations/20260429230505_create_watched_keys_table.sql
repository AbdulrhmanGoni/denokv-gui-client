-- migrate:up
CREATE TABLE watchedKeys (
    id TEXT PRIMARY KEY,
    keysAsJson TEXT NOT NULL,
    kvStoreId TEXT UNIQUE NOT NULL
);

-- migrate:down
DROP TABLE watchedKeys;
