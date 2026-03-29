-- migrate:up
ALTER TABLE lastFetchedUpdate ADD COLUMN doNotNotify BOOLEAN DEFAULT 0;

-- migrate:down
ALTER TABLE lastFetchedUpdate DROP COLUMN doNotNotify;
