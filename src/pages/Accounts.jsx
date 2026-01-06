import React, { useState, useEffect } from 'react'
import './Accounts.css'

function Accounts() {
  const [accounts, setAccounts] = useState([])
  const [formData, setFormData] = useState({ name: '', type: 'checking', balance: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async () => {
    try {
      const response = await window.electron.ipcRenderer.invoke('get-accounts')
      setAccounts(response || [])
    } catch (error) {
      setError('Failed to load accounts')
      console.error(error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleAddAccount = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.balance) {
      setError('Please fill in all fields')
      return
    }

    try {
      await window.electron.ipcRenderer.invoke('add-account', {
        name: formData.name,
        type: formData.type,
        balance: parseFloat(formData.balance)
      })
      
      setSuccess('Account added successfully')
      setFormData({ name: '', type: 'checking', balance: '' })
      loadAccounts()
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError('Failed to add account')
      console.error(error)
    }
  }

  const handleDeleteAccount = async (id) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        await window.electron.ipcRenderer.invoke('delete-account', id)
        loadAccounts()
        setSuccess('Account deleted successfully')
        setTimeout(() => setSuccess(''), 3000)
      } catch (error) {
        setError('Failed to delete account')
        console.error(error)
      }
    }
  }

  return (
    <div className="accounts">
      <h1>Manage Accounts</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="add-account-form card">
        <h2>Add New Account</h2>
        <form onSubmit={handleAddAccount}>
          <div className="form-group">
            <label>Account Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Chase Checking"
            />
          </div>

          <div className="form-group">
            <label>Account Type</label>
            <select name="type" value={formData.type} onChange={handleInputChange}>
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
              <option value="401k">401k</option>
              <option value="stocks">Stocks</option>
              <option value="credit_card">Credit Card</option>
              <option value="loan">Loan</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Initial Balance</label>
            <input
              type="number"
              name="balance"
              value={formData.balance}
              onChange={handleInputChange}
              placeholder="0.00"
              step="0.01"
            />
          </div>

          <button type="submit">Add Account</button>
        </form>
      </div>

      <div className="accounts-list card">
        <h2>Your Accounts</h2>
        {accounts.length === 0 ? (
          <p>No accounts yet. Add one to get started.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Balance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map(account => (
                <tr key={account.id}>
                  <td>{account.name}</td>
                  <td>{account.type}</td>
                  <td>${account.balance.toFixed(2)}</td>
                  <td>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteAccount(account.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Accounts
