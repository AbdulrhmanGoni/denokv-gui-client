-- migrate:up
CREATE TABLE kvStores (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    type TEXT NOT NULL,
    accessToken TEXT DEFAULT NULL,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
);

-- migrate:down
DROP TABLE kvStores;
