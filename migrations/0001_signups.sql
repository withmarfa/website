-- One row for each address that asked for updates about Marfa.
CREATE TABLE signups (
  email TEXT PRIMARY KEY,
  created_at TEXT NOT NULL
);
