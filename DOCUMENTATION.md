# Budget IT - Technical Documentation

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Database Schema](#database-schema)
4. [IPC Communication](#ipc-communication)
5. [React Components](#react-components)
6. [Development Setup](#development-setup)
7. [Building and Deployment](#building-and-deployment)
8. [Testing](#testing)
9. [Contributing](#contributing)

---

## Architecture Overview

Budget IT is a desktop application built with Electron and React, using SQLite for local data storage.

### Technology Stack

- **Frontend**: React 19.x with JSX
- **Desktop Framework**: Electron 39.x
- **Database**: SQLite3
- **Charts**: Recharts
- **Build Tool**: Webpack 5.x with Babel
- **Language**: JavaScript (ES6+)

### Application Flow

```
User Interface (React)
        ↓
IPC Renderer (preload.js)
        ↓
IPC Main (index.js)
        ↓
Database Layer (database.js)
        ↓
SQLite Database
```

---

## Project Structure

```
budget_it/
├── index.js                    # Electron main process
├── index.html                  # Original HTML (not used)
├── webpack.config.js           # Webpack configuration
├── package.json                # Dependencies and scripts
├── .gitignore                  # Git ignore rules
├── README.md                   # User documentation
├── GUIDE.md                    # User guide
├── DOCUMENTATION.md            # This file
│
├── .vscode/                    # VS Code configuration
│   ├── launch.json             # Debug configurations
│   └── tasks.json              # Task definitions
│
├── dist/                       # Webpack build output
│   ├── index.html              # Generated HTML
│   └── bundle.js               # Bundled JavaScript
│
└── src/                        # Source code
    ├── index.js                # React entry point
    ├── index.html              # HTML template for webpack
    ├── preload.js              # Electron preload script
    ├── App.jsx                 # Main React component
    ├── App.css                 # Global styles
    │
    ├── components/             # Reusable components
    │   ├── Navigation.jsx      # Sidebar navigation
    │   └── Navigation.css      # Navigation styles
    │
    ├── pages/                  # Page components
    │   ├── Dashboard.jsx       # Dashboard page
    │   ├── Dashboard.css
    │   ├── Accounts.jsx        # Accounts management
    │   ├── Accounts.css
    │   ├── Budget.jsx          # Budget & categories
    │   ├── Budget.css
    │   ├── Transactions.jsx    # Income/expense tracking
    │   ├── Transactions.css
    │   ├── Comparison.jsx      # Projected vs actual
    │   └── Comparison.css
    │
    ├── db/                     # Database layer
    │   └── database.js         # Database class and initialization
    │
    └── services/               # Business logic (future use)
```

---

## Database Schema

### Tables

#### accounts
Stores financial accounts (checking, savings, 401k, etc.)

```sql
CREATE TABLE accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  balance REAL DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**Fields:**
- `id` - Auto-incrementing primary key
- `name` - Account name (unique)
- `type` - Account type (checking, savings, 401k, stocks, credit_card, loan, other)
- `balance` - Current balance
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

---

#### categories
Budget categories for organizing expenses

```sql
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**Fields:**
- `id` - Auto-incrementing primary key
- `name` - Category name (unique)
- `description` - Optional description
- `color` - Hex color code for visualization
- `createdAt` - Creation timestamp

---

#### income
Income transactions (both projected and actual)

```sql
CREATE TABLE income (
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
```

**Fields:**
- `id` - Auto-incrementing primary key
- `accountId` - Reference to accounts table
- `amount` - Income amount
- `description` - Optional description
- `type` - 'actual' or 'projected'
- `date` - Transaction date
- `projectedDate` - Expected date for projected income
- `createdAt` - Creation timestamp

---

#### expenses
Expense transactions (both projected and actual)

```sql
CREATE TABLE expenses (
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
```

**Fields:**
- `id` - Auto-incrementing primary key
- `accountId` - Reference to accounts table
- `categoryId` - Optional reference to categories table
- `amount` - Expense amount
- `description` - Optional description
- `type` - 'actual' or 'projected'
- `date` - Transaction date
- `projectedDate` - Expected date for projected expenses
- `createdAt` - Creation timestamp

---

#### budgets
Monthly budgets for categories

```sql
CREATE TABLE budgets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  categoryId INTEGER NOT NULL,
  amount REAL NOT NULL,
  month TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (categoryId) REFERENCES categories(id),
  UNIQUE(categoryId, month)
)
```

**Fields:**
- `id` - Auto-incrementing primary key
- `categoryId` - Reference to categories table
- `amount` - Budget amount for the month
- `month` - Month in YYYY-MM format
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

**Unique Constraint:** One budget per category per month

---

## IPC Communication

### IPC Channel Reference

All IPC communication uses `ipcRenderer.invoke()` in the renderer and `ipcMain.handle()` in the main process.

#### Account Operations

**get-accounts**
```javascript
// Renderer
const accounts = await window.electron.ipcRenderer.invoke('get-accounts')

// Returns: Array<{id, name, type, balance, createdAt, updatedAt}>
```

**add-account**
```javascript
// Renderer
await window.electron.ipcRenderer.invoke('add-account', {
  name: 'Chase Checking',
  type: 'checking',
  balance: 1000.00
})

// Returns: {id, changes}
```

**delete-account**
```javascript
// Renderer
await window.electron.ipcRenderer.invoke('delete-account', accountId)

// Returns: {id, changes}
```

---

#### Category Operations

**get-categories**
```javascript
const categories = await window.electron.ipcRenderer.invoke('get-categories')
// Returns: Array<{id, name, description, color, createdAt}>
```

**add-category**
```javascript
await window.electron.ipcRenderer.invoke('add-category', {
  name: 'Groceries',
  description: 'Food and household items',
  color: '#007bff'
})
```

**delete-category**
```javascript
await window.electron.ipcRenderer.invoke('delete-category', categoryId)
```

---

#### Budget Operations

**get-budgets**
```javascript
const budgets = await window.electron.ipcRenderer.invoke('get-budgets')
// Returns: Array<{id, categoryId, amount, month, createdAt, updatedAt}>
```

**add-budget**
```javascript
await window.electron.ipcRenderer.invoke('add-budget', {
  categoryId: 1,
  amount: 500.00,
  month: '2026-01'
})
```

---

#### Transaction Operations

**get-transactions**
```javascript
const transactions = await window.electron.ipcRenderer.invoke('get-transactions', {
  filter: 'all' // 'all', 'actual', or 'projected'
})
// Returns: Array of income and expense transactions combined
```

**add-transaction**
```javascript
await window.electron.ipcRenderer.invoke('add-transaction', {
  type: 'expense',           // 'income' or 'expense'
  transactionType: 'actual', // 'actual' or 'projected'
  accountId: 1,
  categoryId: 2,             // Only for expenses
  amount: 50.00,
  description: 'Grocery shopping',
  date: '2026-01-06',
  projectedDate: null        // For projected transactions
})
```

**delete-transaction**
```javascript
await window.electron.ipcRenderer.invoke('delete-transaction', transactionId)
```

---

#### Dashboard Operations

**get-balance-history**
```javascript
const history = await window.electron.ipcRenderer.invoke('get-balance-history')
// Returns: Array<{date, balance}> - Last 30 days
```

**get-category-spending**
```javascript
const spending = await window.electron.ipcRenderer.invoke('get-category-spending')
// Returns: Array<{name, value}> - Actual spending by category
```

---

#### Comparison Operations

**get-category-comparison**
```javascript
const comparison = await window.electron.ipcRenderer.invoke('get-category-comparison')
// Returns: Array<{category, projected, actual, variance}>
```

**get-monthly-comparison**
```javascript
const monthly = await window.electron.ipcRenderer.invoke('get-monthly-comparison')
// Returns: Array<{month, projectedIncome, actualIncome, projectedExpense, actualExpense}>
```

---

## React Components

### Component Hierarchy

```
App
├── Navigation
└── [Current Page]
    ├── Dashboard
    ├── Accounts
    ├── Budget
    ├── Transactions
    └── Comparison
```

### Component Details

#### App.jsx
Main application component that manages routing and page rendering.

**State:**
- `currentPage` - String indicating which page to display

**Functions:**
- `renderPage()` - Renders the appropriate page component based on currentPage

---

#### Navigation.jsx
Sidebar navigation component.

**Props:**
- `currentPage` - Current active page
- `onPageChange` - Callback function to change pages

---

#### Dashboard.jsx
Financial overview page with charts and summaries.

**State:**
- `accounts` - Array of all accounts
- `totalBalance` - Sum of all account balances
- `chartData` - Balance history data for line chart
- `categorySpending` - Spending data by category for pie chart

**Effects:**
- Loads dashboard data on mount

---

#### Accounts.jsx
Account management page.

**State:**
- `accounts` - Array of all accounts
- `formData` - Form input data
- `error` - Error message
- `success` - Success message

**Functions:**
- `handleAddAccount()` - Adds new account
- `handleDeleteAccount()` - Deletes account

---

#### Budget.jsx
Budget and category management page.

**State:**
- `categories` - Array of all categories
- `budgets` - Array of all budgets
- `formData` - Category form data
- `budgetForm` - Budget form data

**Functions:**
- `handleAddCategory()` - Adds new category
- `handleAddBudget()` - Sets budget for category/month
- `handleDeleteCategory()` - Deletes category

---

#### Transactions.jsx
Income and expense tracking page.

**State:**
- `transactions` - Array of transactions (income + expenses)
- `accounts` - Available accounts
- `categories` - Available categories
- `formData` - Transaction form data
- `filter` - Filter type ('all', 'actual', 'projected')

**Functions:**
- `handleAddTransaction()` - Records new transaction
- `handleDeleteTransaction()` - Deletes transaction

---

#### Comparison.jsx
Projected vs actual analysis page.

**State:**
- `comparisonData` - Monthly comparison data
- `categoryComparison` - Category-level comparison

---

## Development Setup

### Prerequisites

- Node.js 16.x or later
- npm 7.x or later
- Git

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/baej12/budget_it.git
cd budget_it

# Install dependencies
npm install

# Run the application
npm start
```

### Development Workflow

1. **Make code changes** in `src/` directory
2. **Build the app**: `npm run build` (or `npm start` does this automatically)
3. **Test changes**: Application launches automatically
4. **Commit changes**: `git add . && git commit -m "Your message"`

### Debugging

Use VS Code's built-in debugger:

1. Open Debug panel (Ctrl+Shift+D)
2. Select "Electron" configuration
3. Press F5 to start debugging
4. Set breakpoints in your code

**Available Debug Configurations:**
- **Electron Main** - Debug the main process (index.js)
- **Electron Renderer** - Debug the renderer process (React code)
- **Electron** (compound) - Debug both simultaneously

---

## Building and Deployment

### Production Build

```bash
# Build React bundle for production
npm run build
```

This creates optimized files in the `dist/` directory.

### Creating Installers

For distribution, you'll need to add electron-builder or electron-forge:

```bash
# Install electron-builder
npm install --save-dev electron-builder

# Add to package.json scripts:
# "pack": "electron-builder --dir"
# "dist": "electron-builder"

# Build installers
npm run dist
```

### Platform-Specific Builds

**Windows:**
```bash
electron-builder --win
```

**macOS:**
```bash
electron-builder --mac
```

**Linux:**
```bash
electron-builder --linux
```

---

## Testing

### Manual Testing Checklist

- [ ] Create accounts of different types
- [ ] Add budget categories with colors
- [ ] Set monthly budgets
- [ ] Record actual income transactions
- [ ] Record projected income transactions
- [ ] Record actual expenses with categories
- [ ] Record projected expenses
- [ ] View dashboard charts
- [ ] Check comparison analysis
- [ ] Delete transactions
- [ ] Delete categories
- [ ] Delete accounts
- [ ] Restart app and verify data persists

### Database Testing

```bash
# View database directly
sqlite3 ~/.budget_it/budget.db

# List all tables
.tables

# Query accounts
SELECT * FROM accounts;

# Exit
.quit
```

---

## Contributing

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Use semicolons
- Use camelCase for variables and functions
- Use PascalCase for React components

### Git Workflow

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit: `git commit -m "Add feature"`
3. Push to remote: `git push origin feature/your-feature`
4. Create pull request

### Adding New Features

#### Adding a New Page

1. Create component file: `src/pages/NewPage.jsx`
2. Create styles: `src/pages/NewPage.css`
3. Import in `App.jsx`
4. Add to `renderPage()` switch statement
5. Add navigation item in `Navigation.jsx`

#### Adding a New IPC Handler

1. Add handler in `index.js`:
```javascript
ipcMain.handle('your-channel', async (event, data) => {
  // Your logic here
  return result
})
```

2. Call from React:
```javascript
const result = await window.electron.ipcRenderer.invoke('your-channel', data)
```

#### Adding a New Database Table

1. Update `src/db/database.js` in `initializeTables()`:
```javascript
this.db.run(`
  CREATE TABLE IF NOT EXISTS your_table (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    -- your columns
  )
`)
```

2. Add query methods as needed

---

## Performance Optimization

### Bundle Size

Currently, the production bundle is ~615KB. To reduce:

1. Use code splitting with dynamic imports
2. Lazy load pages:
```javascript
const Dashboard = React.lazy(() => import('./pages/Dashboard'))
```

3. Externalize large libraries in webpack config

### Database Optimization

1. Add indexes for frequently queried columns
2. Use transactions for bulk operations
3. Implement pagination for large result sets

### React Optimization

1. Use `React.memo()` for expensive components
2. Implement `useMemo()` and `useCallback()` hooks
3. Avoid unnecessary re-renders

---

## Security Considerations

### Context Isolation

The app uses Electron's context isolation with a preload script to safely expose IPC to the renderer.

### Content Security Policy

CSP is configured in the HTML to prevent XSS attacks:
```html
content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'"
```

### Local Data Storage

- Database stored in user's home directory
- No cloud storage or network transmission
- Consider adding encryption for sensitive data

---

## Troubleshooting

### Common Issues

**Issue:** Blank screen on startup
**Solution:** Run `npm run build` to regenerate webpack bundle

**Issue:** Database errors
**Solution:** Delete `~/.budget_it/budget.db` and restart (will lose data)

**Issue:** Webpack compilation errors
**Solution:** Delete `node_modules` and `dist`, run `npm install` and `npm start`

**Issue:** IPC not working
**Solution:** Check that preload script is properly loaded in BrowserWindow options

---

## Future Enhancements

### Planned Features

- [ ] Recurring transaction templates
- [ ] CSV import/export
- [ ] Multiple currency support
- [ ] Cloud backup (optional)
- [ ] Mobile companion app
- [ ] Bill payment reminders
- [ ] Financial reports (PDF export)
- [ ] Data encryption at rest
- [ ] Multi-user support
- [ ] Investment tracking with API integration

### Technical Improvements

- [ ] Add unit tests (Jest)
- [ ] Add E2E tests (Playwright)
- [ ] Implement TypeScript
- [ ] Add state management (Redux/Zustand)
- [ ] Implement proper error boundaries
- [ ] Add loading states and skeleton screens
- [ ] Implement offline-first architecture
- [ ] Add automatic updates

---

## License

ISC

## Contact

Brandon - GitHub: [@baej12](https://github.com/baej12)

Project Link: [https://github.com/baej12/budget_it](https://github.com/baej12/budget_it)
