-- migrate:up
ALTER TABLE kvStores ADD COLUMN authToken TEXT DEFAULT NULL;

-- migrate:down
ALTER TABLE kvStores DROP COLUMN authToken;
