const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

// Abre (ou cria) o banco SQLite e garante o schema.
function openDatabase(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const db = new Database(filePath);
  db.pragma('foreign_keys = ON');
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
    );
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL CHECK (length(trim(title)) > 0),
      description TEXT NOT NULL DEFAULT '',
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id, created_at, id);
  `);
  return db;
}

module.exports = { openDatabase };
