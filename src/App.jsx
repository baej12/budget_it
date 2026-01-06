import React, { useState, useEffect } from 'react'
import './App.css'
import Dashboard from './pages/Dashboard'
import Accounts from './pages/Accounts'
import Budget from './pages/Budget'
import Transactions from './pages/Transactions'
import Comparison from './pages/Comparison'
import Navigation from './components/Navigation'

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'accounts':
        return <Accounts />
      case 'budget':
        return <Budget />
      case 'transactions':
        return <Transactions />
      case 'comparison':
        return <Comparison />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="app">
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="main-content">
        {renderPage()}
      </div>
    </div>
  )
}

export default App
