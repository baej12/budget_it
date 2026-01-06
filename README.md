# Budget IT

A cross-platform desktop application for managing your personal finances. Track accounts, loans, credit cards, payments, and monitor your budget all in one place.

## Features

- Account management (checking, savings, 401k, stocks, credit cards, loans)
- Credit card and loan tracking
- Budget categories and planning
- Income tracking (projected and actual)
- Expense tracking (projected and actual)
- Expense categorization and budget allocation
- Visual charts and graphs for account balances and spending
- Projected vs Actual comparison analysis
- SQLite local database for secure data storage
- Cross-platform support (Windows, macOS, Linux)

## Prerequisites

- Node.js (v16 or later)
- npm or yarn

## Installation

1. Clone the repository
```bash
git clone https://github.com/baej12/budget_it.git
cd budget_it
```

2. Install dependencies
```bash
npm install
```

## Development

To start the application in development mode:

```bash
npm start
```

This will launch the Electron application with the bundled React code.

## Usage Guide

### Getting Started

1. **Add Accounts**: Go to the Accounts page to add your financial accounts (checking, savings, 401k, stocks, credit cards, loans)

2. **Create Budget Categories**: In the Budget page, create expense categories like Groceries, Utilities, Entertainment, etc.

3. **Set Budgets**: Assign budget amounts to each category for different months

4. **Record Transactions**: Use the Transactions page to:
   - Record actual income and expenses
   - Add projected income and expenses for future planning
   - Categorize expenses to track against your budget

5. **View Dashboard**: See your financial overview with:
   - Total balance across all accounts
   - Account balance summary
   - Balance trend chart
   - Spending by category pie chart

6. **Compare Projected vs Actual**: The Comparison page shows:
   - Category spending comparison (projected vs actual)
   - Monthly budget comparison charts
   - Variance analysis

### Data Storage

All data is stored locally in an SQLite database at:
- Windows: `C:\Users\[YourUsername]\.budget_it\budget.db`
- macOS/Linux: `~/.budget_it/budget.db`

Your financial data never leaves your computer.

## Building

To build the application for your platform:

```bash
npm run build
```

The built application will be available in the `dist/` directory.

## Project Structure

```
budget_it/
├── index.js           # Main Electron process with IPC handlers
├── index.html         # Main window HTML entry point
├── webpack.config.js  # Webpack configuration for React bundling
├── package.json       # Project dependencies and scripts
└── src/
    ├── index.js       # React entry point
    ├── App.jsx        # Main React component
    ├── preload.js     # Electron preload script
    ├── components/    # Reusable React components
    │   └── Navigation.jsx
    ├── pages/         # Main application pages
    │   ├── Dashboard.jsx
    │   ├── Accounts.jsx
    │   ├── Budget.jsx
    │   ├── Transactions.jsx
    │   └── Comparison.jsx
    ├── db/            # Database layer
    │   └── database.js
    └── services/      # Business logic services
```

## Technologies

- Electron - Desktop application framework
- React - UI library
- SQLite - Local database for secure data storage
- Recharts - Data visualization and charting
- Webpack - Module bundling
- Babel - JavaScript transpilation

## License

ISC

## Author

Brandon