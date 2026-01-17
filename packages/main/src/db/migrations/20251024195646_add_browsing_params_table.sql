-- migrate:up
CREATE TABLE browsingParams (
    id TEXT PRIMARY KEY,
    paramsAsJson TEXT NOT NULL,
    isDefault INTEGER NOT NULL,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    kvStoreId TEXT
);

-- migrate:down
DROP TABLE browsingParams;
