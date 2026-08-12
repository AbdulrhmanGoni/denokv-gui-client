-- migrate:up

-- migrate:down
ALTER TABLE lastFetchedUpdate DROP COLUMN doNotNotify;
