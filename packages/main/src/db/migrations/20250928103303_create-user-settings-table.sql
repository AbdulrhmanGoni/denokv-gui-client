-- migrate:up
CREATE TABLE userSettings (
    settingsId TEXT PRIMARY KEY,
    settingsAsJsonText TEXT NOT NULL
);

-- migrate:down
DROP TABLE userSettings;
