-- migrate:up
ALTER TABLE projects ADD COLUMN status TEXT NOT NULL DEFAULT 'active';

-- migrate:down
ALTER TABLE projects DROP COLUMN status;
