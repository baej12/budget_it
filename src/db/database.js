const sqlite3 = require('sqlite3').verbose()
const path = require('path')
const os = require('os')
const fs = require('fs')

class Database {
  constructor() {
    const dbDir = path.join(os.homedir(), '.budget_it')
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true })
    }
    
    const dbPath = path.join(dbDir, 'budget.db')
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) console.error('Database connection error:', err)
      else console.log('Connected to SQLite database at:', dbPath)
    })
    this.initializeTables()
  }

  initializeTables() {
    this.db.serialize(() => {
      // Accounts table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS accounts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          type TEXT NOT NULL,
          balance REAL DEFAULT 0,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Budget categories table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          description TEXT,
          color TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Income transactions (projected and actual)
      this.db.run(`
        CREATE TABLE IF NOT EXISTS income (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          accountId INTEGER NOT NULL,
          amount REAL NOT NULL,
          description TEXT,
          type TEXT DEFAULT 'actual',
          date DATE NOT NULL,
          projectedDate DATE,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (accountId) REFERENCES accounts(id)
        )
      `)

      // Expenses transactions (projected and actual)
      this.db.run(`
        CREATE TABLE IF NOT EXISTS expenses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          accountId INTEGER NOT NULL,
          categoryId INTEGER,
          amount REAL NOT NULL,
          description TEXT,
          type TEXT DEFAULT 'actual',
          date DATE NOT NULL,
          projectedDate DATE,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (accountId) REFERENCES accounts(id),
          FOREIGN KEY (categoryId) REFERENCES categories(id)
        )
      `)

      // Budget table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS budgets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          categoryId INTEGER NOT NULL,
          amount REAL NOT NULL,
          month TEXT NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (categoryId) REFERENCES categories(id),
          UNIQUE(categoryId, month)
        )
      `)

      console.log('Database tables initialized')
    })
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err)
        else resolve({ id: this.lastID, changes: this.changes })
      })
    })
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err)
        else resolve(row)
      })
    })
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }
}

module.exports = Database
