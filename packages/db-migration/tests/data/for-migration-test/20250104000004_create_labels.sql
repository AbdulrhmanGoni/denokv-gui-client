-- migrate:up
CREATE TABLE labels (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- migrate:down
DROP TABLE labels;
