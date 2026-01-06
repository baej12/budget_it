import React, { useState, useEffect } from 'react'
import './Transactions.css'

function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [accounts, setAccounts] = useState([])
  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState({
    type: 'expense',
    transactionType: 'actual',
    accountId: '',
    categoryId: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    projectedDate: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadAccounts()
    loadCategories()
    loadTransactions()
  }, [filter])

  const loadAccounts = async () => {
    try {
      const response = await window.electron.ipcRenderer.invoke('get-accounts')
      setAccounts(response || [])
      if (response && response.length > 0) {
        setFormData(prev => ({ ...prev, accountId: response[0].id }))
      }
    } catch (error) {
      console.error(error)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await window.electron.ipcRenderer.invoke('get-categories')
      setCategories(response || [])
    } catch (error) {
      console.error(error)
    }
  }

  const loadTransactions = async () => {
    try {
      const response = await window.electron.ipcRenderer.invoke('get-transactions', { filter })
      setTransactions(response || [])
    } catch (error) {
      setError('Failed to load transactions')
      console.error(error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleAddTransaction = async (e) => {
    e.preventDefault()

    if (!formData.accountId || !formData.amount) {
      setError('Please fill in required fields')
      return
    }

    try {
      await window.electron.ipcRenderer.invoke('add-transaction', {
        ...formData,
        accountId: parseInt(formData.accountId),
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
        amount: parseFloat(formData.amount)
      })

      setSuccess(`${formData.type === 'expense' ? 'Expense' : 'Income'} recorded successfully`)
      setFormData({
        type: 'expense',
        transactionType: 'actual',
        accountId: accounts[0]?.id || '',
        categoryId: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        projectedDate: ''
      })
      loadTransactions()

      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError('Failed to add transaction')
      console.error(error)
    }
  }

  const handleDeleteTransaction = async (id) => {
    if (window.confirm('Delete this transaction?')) {
      try {
        await window.electron.ipcRenderer.invoke('delete-transaction', id)
        loadTransactions()
        setSuccess('Transaction deleted')
        setTimeout(() => setSuccess(''), 3000)
      } catch (error) {
        setError('Failed to delete transaction')
        console.error(error)
      }
    }
  }

  return (
    <div className="transactions">
      <h1>Income & Expenses</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="transaction-form card">
        <h2>Record Transaction</h2>
        <form onSubmit={handleAddTransaction}>
          <div className="form-row">
            <div className="form-group">
              <label>Type</label>
              <select name="type" value={formData.type} onChange={handleInputChange}>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            <div className="form-group">
              <label>Record Type</label>
              <select name="transactionType" value={formData.transactionType} onChange={handleInputChange}>
                <option value="actual">Actual</option>
                <option value="projected">Projected</option>
              </select>
            </div>

            <div className="form-group">
              <label>Account</label>
              <select name="accountId" value={formData.accountId} onChange={handleInputChange}>
                <option value="">Select account</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
            </div>
          </div>

          {formData.type === 'expense' && (
            <div className="form-group">
              <label>Category</label>
              <select name="categoryId" value={formData.categoryId} onChange={handleInputChange}>
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Amount</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
              />
            </div>

            {formData.transactionType === 'projected' && (
              <div className="form-group">
                <label>Expected Date</label>
                <input
                  type="date"
                  name="projectedDate"
                  value={formData.projectedDate}
                  onChange={handleInputChange}
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Optional description"
              rows="3"
            />
          </div>

          <button type="submit">Record Transaction</button>
        </form>
      </div>

      <div className="card">
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${filter === 'actual' ? 'active' : ''}`}
            onClick={() => setFilter('actual')}
          >
            Actual
          </button>
          <button 
            className={`filter-btn ${filter === 'projected' ? 'active' : ''}`}
            onClick={() => setFilter('projected')}
          >
            Projected
          </button>
        </div>

        <h2>Transactions</h2>
        {transactions.length === 0 ? (
          <p>No transactions recorded yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Account</th>
                <th>Category</th>
                <th>Description</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(trans => {
                const account = accounts.find(a => a.id === trans.accountId)
                const category = categories.find(c => c.id === trans.categoryId)
                return (
                  <tr key={trans.id}>
                    <td>{trans.date}</td>
                    <td>{account ? account.name : 'Unknown'}</td>
                    <td>{category ? category.name : '-'}</td>
                    <td>{trans.description || '-'}</td>
                    <td>{trans.type}</td>
                    <td className={trans.type === 'income' ? 'income' : 'expense'}>
                      {trans.type === 'income' ? '+' : '-'}${trans.amount.toFixed(2)}
                    </td>
                    <td>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteTransaction(trans.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Transactions
