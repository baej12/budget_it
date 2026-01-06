import React from 'react'
import './Navigation.css'

function Navigation({ currentPage, onPageChange }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'accounts', label: 'Accounts' },
    { id: 'budget', label: 'Budget' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'comparison', label: 'Comparison' }
  ]

  return (
    <nav className="navigation">
      <div className="nav-header">
        <h1>Budget IT</h1>
      </div>
      <ul className="nav-items">
        {navItems.map(item => (
          <li key={item.id}>
            <button
              className={`nav-button ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => onPageChange(item.id)}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default Navigation
