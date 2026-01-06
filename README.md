# Budget IT

A cross-platform desktop application for managing your personal finances. Track accounts, loans, credit cards, payments, and monitor your budget all in one place.

## Features

- Account management (checking, savings, investment accounts)
- Credit card tracking and management
- Loan tracking with amortization schedules
- Payment history and records
- Budget planning and monitoring
- Financial overview and reporting
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

This will launch the Electron application with hot-reload support.

## Building

To build the application for your platform:

```bash
npm run build
```

The built application will be available in the `dist/` directory.

## Project Structure

```
budget_it/
├── index.js           # Main Electron process
├── index.html         # Main window HTML
├── package.json       # Project dependencies and scripts
└── src/               # Application source code
    ├── components/    # React components
    ├── pages/         # Page layouts
    ├── styles/        # CSS stylesheets
    └── utils/         # Utility functions
```

## Technologies

- Electron - Desktop application framework
- React - UI library
- SQLite - Local database
- Tailwind CSS - Styling

## License

ISC

## Author

Brandon