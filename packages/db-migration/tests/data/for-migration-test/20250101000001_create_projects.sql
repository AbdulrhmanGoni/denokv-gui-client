-- migrate:up
CREATE TABLE projects (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);

-- migrate:down
DROP TABLE projects;
