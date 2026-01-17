-- migrate:up
CREATE TABLE lastFetchedUpdate (
    lastUpdateId TEXT PRIMARY KEY,
    updateInfoAsJson TEXT NOT NULL
);

-- migrate:down
DROP TABLE lastFetchedUpdate;
