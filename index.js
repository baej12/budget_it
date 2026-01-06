const { app, BrowserWindow, ipcMain } = require('electron/main')
const path = require('path')
const Database = require('./src/db/database')

let mainWindow
let db

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'src/preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  mainWindow.loadFile('index.html')

  mainWindow.webContents.openDevTools()

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// IPC Handlers - Accounts
ipcMain.handle('get-accounts', async () => {
  return await db.all('SELECT * FROM accounts ORDER BY name')
})

ipcMain.handle('add-account', async (event, data) => {
  return await db.run(
    'INSERT INTO accounts (name, type, balance) VALUES (?, ?, ?)',
    [data.name, data.type, data.balance]
  )
})

ipcMain.handle('delete-account', async (event, id) => {
  return await db.run('DELETE FROM accounts WHERE id = ?', [id])
})

// IPC Handlers - Categories
ipcMain.handle('get-categories', async () => {
  return await db.all('SELECT * FROM categories ORDER BY name')
})

ipcMain.handle('add-category', async (event, data) => {
  return await db.run(
    'INSERT INTO categories (name, description, color) VALUES (?, ?, ?)',
    [data.name, data.description, data.color]
  )
})

ipcMain.handle('delete-category', async (event, id) => {
  await db.run('DELETE FROM budgets WHERE categoryId = ?', [id])
  return await db.run('DELETE FROM categories WHERE id = ?', [id])
})

// IPC Handlers - Budgets
ipcMain.handle('get-budgets', async () => {
  return await db.all('SELECT * FROM budgets ORDER BY month DESC')
})

ipcMain.handle('add-budget', async (event, data) => {
  return await db.run(
    'INSERT OR REPLACE INTO budgets (categoryId, amount, month) VALUES (?, ?, ?)',
    [data.categoryId, data.amount, data.month]
  )
})

// IPC Handlers - Transactions
ipcMain.handle('get-transactions', async (event, data) => {
  let query = 'SELECT * FROM expenses UNION SELECT * FROM income ORDER BY date DESC'
  if (data.filter === 'actual') {
    query = '(SELECT * FROM expenses WHERE type = "actual") UNION (SELECT * FROM income WHERE type = "actual") ORDER BY date DESC'
  } else if (data.filter === 'projected') {
    query = '(SELECT * FROM expenses WHERE type = "projected") UNION (SELECT * FROM income WHERE type = "projected") ORDER BY date DESC'
  }
  return await db.all(query)
})

ipcMain.handle('add-transaction', async (event, data) => {
  const table = data.type === 'income' ? 'income' : 'expenses'
  const columns = data.type === 'income' 
    ? 'accountId, amount, description, type, date'
    : 'accountId, categoryId, amount, description, type, date'
  const values = data.type === 'income'
    ? [data.accountId, data.amount, data.description, data.transactionType, data.date]
    : [data.accountId, data.categoryId, data.amount, data.description, data.transactionType, data.date]
  const placeholders = data.type === 'income' ? '?, ?, ?, ?, ?' : '?, ?, ?, ?, ?, ?'
  
  return await db.run(
    `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`,
    values
  )
})

ipcMain.handle('delete-transaction', async (event, id) => {
  await db.run('DELETE FROM expenses WHERE id = ?', [id])
  return await db.run('DELETE FROM income WHERE id = ?', [id])
})

// IPC Handlers - Dashboard
ipcMain.handle('get-balance-history', async () => {
  const balances = await db.all(`
    SELECT 
      COALESCE(SUM(balance), 0) as balance,
      DATE(createdAt) as date
    FROM accounts
    GROUP BY DATE(createdAt)
    ORDER BY date DESC
    LIMIT 30
  `)
  return balances.reverse()
})

ipcMain.handle('get-category-spending', async () => {
  return await db.all(`
    SELECT 
      c.name,
      SUM(e.amount) as value
    FROM expenses e
    JOIN categories c ON e.categoryId = c.id
    WHERE e.type = 'actual'
    GROUP BY c.id
    ORDER BY value DESC
  `)
})

// IPC Handlers - Comparison
ipcMain.handle('get-category-comparison', async () => {
  const result = await db.all(`
    SELECT 
      c.name as category,
      COALESCE(SUM(CASE WHEN e.type = 'projected' THEN e.amount ELSE 0 END), 0) as projected,
      COALESCE(SUM(CASE WHEN e.type = 'actual' THEN e.amount ELSE 0 END), 0) as actual,
      COALESCE(SUM(CASE WHEN e.type = 'projected' THEN e.amount ELSE 0 END), 0) - 
      COALESCE(SUM(CASE WHEN e.type = 'actual' THEN e.amount ELSE 0 END), 0) as variance
    FROM expenses e
    JOIN categories c ON e.categoryId = c.id
    GROUP BY c.id
    HAVING projected > 0 OR actual > 0
    ORDER BY c.name
  `)
  return result
})

ipcMain.handle('get-monthly-comparison', async () => {
  const result = await db.all(`
    SELECT 
      strftime('%Y-%m', date) as month,
      COALESCE(SUM(CASE WHEN type = 'projected' THEN amount ELSE 0 END), 0) as projectedIncome,
      COALESCE(SUM(CASE WHEN type = 'actual' THEN amount ELSE 0 END), 0) as actualIncome
    FROM income
    GROUP BY month
    ORDER BY month
  `)
  
  const expenses = await db.all(`
    SELECT 
      strftime('%Y-%m', date) as month,
      COALESCE(SUM(CASE WHEN type = 'projected' THEN amount ELSE 0 END), 0) as projectedExpense,
      COALESCE(SUM(CASE WHEN type = 'actual' THEN amount ELSE 0 END), 0) as actualExpense
    FROM expenses
    GROUP BY month
    ORDER BY month
  `)
  
  const combined = {}
  result.forEach(row => {
    combined[row.month] = { ...row }
  })
  expenses.forEach(row => {
    if (combined[row.month]) {
      combined[row.month] = { ...combined[row.month], ...row }
    } else {
      combined[row.month] = { month: row.month, projectedIncome: 0, actualIncome: 0, ...row }
    }
  })
  
  return Object.values(combined)
})

app.whenReady().then(() => {
  db = new Database()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})