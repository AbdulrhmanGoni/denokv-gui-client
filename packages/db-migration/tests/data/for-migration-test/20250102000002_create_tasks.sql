-- migrate:up
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY,
  project_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- migrate:down
DROP TABLE tasks;
