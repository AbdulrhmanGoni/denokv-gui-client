-- migrate:up
ALTER TABLE tasks ADD COLUMN priority INTEGER NOT NULL DEFAULT 0;

-- migrate:down
ALTER TABLE tasks DROP COLUMN priority;
