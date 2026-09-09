-- migrate:up
ALTER TABLE userSettings ADD COLUMN autoCheckForUpdate INTEGER NOT NULL DEFAULT 0;
ALTER TABLE userSettings ADD COLUMN disableHardwareAcceleration INTEGER NOT NULL DEFAULT 0;

INSERT INTO userSettings(settingsId, settingsAsJsonText) VALUES('settings', '{}')
ON CONFLICT(settingsId) DO UPDATE SET
  autoCheckForUpdate = COALESCE(CAST(json_extract(userSettings.settingsAsJsonText, '$.autoCheckForUpdate') AS INTEGER), 0),
  disableHardwareAcceleration = COALESCE(CAST(json_extract(userSettings.settingsAsJsonText, '$.disableHardwareAcceleration') AS INTEGER), 0);

ALTER TABLE userSettings DROP COLUMN settingsAsJsonText;

-- migrate:down
ALTER TABLE userSettings ADD COLUMN settingsAsJsonText TEXT NOT NULL DEFAULT '{}';

UPDATE userSettings SET settingsAsJsonText = json_object(
  'autoCheckForUpdate', CASE WHEN autoCheckForUpdate = 1 THEN json('true') ELSE json('false') END,
  'disableHardwareAcceleration', CASE WHEN disableHardwareAcceleration = 1 THEN json('true') ELSE json('false') END
);

ALTER TABLE userSettings DROP COLUMN autoCheckForUpdate;
ALTER TABLE userSettings DROP COLUMN disableHardwareAcceleration;
