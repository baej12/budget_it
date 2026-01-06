# Budget IT - Quick Reference Guide

## Application Features

### 1. Dashboard
- View total balance across all accounts
- See all accounts at a glance
- Balance trend line chart
- Spending by category pie chart

### 2. Accounts Management
- Add accounts (checking, savings, 401k, stocks, credit cards, loans)
- Set initial balance
- View all accounts in a table
- Delete accounts

### 3. Budget Management
- Create expense categories with custom colors
- Set monthly budgets for each category
- View all categories and budgets
- Delete categories

### 4. Transactions
- Record income (actual or projected)
- Record expenses (actual or projected)
- Categorize expenses
- Set expected dates for projected transactions
- Filter by actual/projected/all
- View transaction history

### 5. Comparison Analysis
- Compare projected vs actual spending by category
- View monthly income and expense trends
- Analyze variance between projected and actual
- Visual bar and line charts

## Key Concepts

### Account Types
- **Checking**: Daily spending accounts
- **Savings**: Savings accounts
- **401k**: Retirement accounts
- **Stocks**: Investment accounts
- **Credit Card**: Credit card accounts
- **Loan**: Loan accounts
- **Other**: Custom account types

### Transaction Types
- **Actual**: Real transactions that have occurred
- **Projected**: Future expected income/expenses for planning

### Budget Categories
Create categories for organizing expenses (e.g., Groceries, Utilities, Entertainment, Transportation, Housing)

## Workflow Example

1. **Initial Setup**
   - Add all your accounts (checking, savings, 401k, etc.)
   - Create budget categories
   - Set monthly budgets for each category

2. **Planning**
   - Add projected income for the month
   - Add projected expenses for the month
   - Assign categories to expenses

3. **Tracking**
   - Record actual income as it arrives
   - Record actual expenses as they occur
   - Categorize expenses

4. **Analysis**
   - View Dashboard for overview
   - Check Comparison page for projected vs actual
   - Adjust budgets and projections as needed

## Tips

- Use descriptive names for accounts and categories
- Record transactions regularly for accurate tracking
- Use projected transactions for planning future months
- Review the Comparison page monthly to adjust spending
- Categories help you understand where your money goes
- The Dashboard provides a quick financial health snapshot

## Keyboard Shortcuts

- Use Tab to navigate between form fields
- Press Enter to submit forms
- Use mouse wheel to scroll through long lists

## Database Location

Your data is stored locally at:
- Windows: `C:\Users\[YourUsername]\.budget_it\budget.db`
- macOS/Linux: `~/.budget_it/budget.db`

To backup your data, simply copy this file to a safe location.

## Development Commands

```bash
npm start              # Start the application
npm run webpack-build  # Build React bundle for production
```

## Troubleshooting

### Application won't start
- Ensure Node.js is installed
- Run `npm install` to install dependencies
- Check that no other instance is running

### Data not saving
- Check console for errors (DevTools will open automatically)
- Verify database file permissions

### Charts not displaying
- Ensure you have transaction data entered
- Check that transactions have dates assigned

## Future Enhancements (Ideas)

- Export data to CSV
- Import transactions from bank files
- Recurring transaction templates
- Multi-currency support
- Reports and PDF export
- Mobile companion app
- Cloud sync (optional)
- Bill reminders and notifications
