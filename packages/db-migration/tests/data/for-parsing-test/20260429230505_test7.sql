-- migrate:up
CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT);
-- migrate:down
DROP TABLE users;
