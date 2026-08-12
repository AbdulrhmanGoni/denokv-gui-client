-- migrate:up
CREATE TABLE keys (
    id TEXT PRIMARY KEY,
    content TEXT UNIQUE NOT NULL
);

-- migrate:down
DROP TABLE keys;
