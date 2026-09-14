-- migrate:up
ALTER TABLE userSettings ADD COLUMN lastFetchedUpdate TEXT DEFAULT NULL;
ALTER TABLE userSettings ADD COLUMN ignoreLastFetchedUpdate INTEGER NOT NULL DEFAULT 0;

INSERT INTO userSettings(settingsId) VALUES('settings') ON CONFLICT(settingsId) DO NOTHING;

UPDATE userSettings SET
  lastFetchedUpdate = (SELECT updateInfoAsJson FROM lastFetchedUpdate WHERE lastUpdateId = 'last-update'),
  ignoreLastFetchedUpdate = COALESCE((SELECT doNotNotify FROM lastFetchedUpdate WHERE lastUpdateId = 'last-update'), 0)
WHERE settingsId = 'settings';

DROP TABLE lastFetchedUpdate;

-- migrate:down
CREATE TABLE lastFetchedUpdate (
  lastUpdateId TEXT PRIMARY KEY,
  updateInfoAsJson TEXT NOT NULL,
  doNotNotify BOOLEAN DEFAULT 0
);

INSERT INTO lastFetchedUpdate(lastUpdateId, updateInfoAsJson, doNotNotify)
  SELECT 'last-update', lastFetchedUpdate, ignoreLastFetchedUpdate FROM userSettings
  WHERE settingsId = 'settings' AND lastFetchedUpdate IS NOT NULL;

ALTER TABLE userSettings DROP COLUMN lastFetchedUpdate;
ALTER TABLE userSettings DROP COLUMN ignoreLastFetchedUpdate;
