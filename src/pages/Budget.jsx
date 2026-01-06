import React, { useState, useEffect } from 'react'
import './Budget.css'

function Budget() {
  const [categories, setCategories] = useState([])
  const [budgets, setBudgets] = useState([])
  const [formData, setFormData] = useState({ name: '', color: '#007bff', description: '' })
  const [budgetForm, setBudgetForm] = useState({ categoryId: '', amount: '', month: new Date().toISOString().slice(0, 7) })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadCategories()
    loadBudgets()
  }, [])

  const loadCategories = async () => {
    try {
      const response = await window.electron.ipcRenderer.invoke('get-categories')
      setCategories(response || [])
      if (response && response.length > 0) {
        setBudgetForm({ ...budgetForm, categoryId: response[0].id })
      }
    } catch (error) {
      setError('Failed to load categories')
      console.error(error)
    }
  }

  const loadBudgets = async () => {
    try {
      const response = await window.electron.ipcRenderer.invoke('get-budgets')
      setBudgets(response || [])
    } catch (error) {
      console.error(error)
    }
  }

  const handleCategoryChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleBudgetChange = (e) => {
    const { name, value } = e.target
    setBudgetForm({ ...budgetForm, [name]: value })
  }

  const handleAddCategory = async (e) => {
    e.preventDefault()
    
    if (!formData.name) {
      setError('Please enter a category name')
      return
    }

    try {
      await window.electron.ipcRenderer.invoke('add-category', {
        name: formData.name,
        description: formData.description,
        color: formData.color
      })
      
      setSuccess('Category added successfully')
      setFormData({ name: '', color: '#007bff', description: '' })
      loadCategories()
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError('Failed to add category')
      console.error(error)
    }
  }

  const handleAddBudget = async (e) => {
    e.preventDefault()
    
    if (!budgetForm.categoryId || !budgetForm.amount) {
      setError('Please fill in all budget fields')
      return
    }

    try {
      await window.electron.ipcRenderer.invoke('add-budget', {
        categoryId: parseInt(budgetForm.categoryId),
        amount: parseFloat(budgetForm.amount),
        month: budgetForm.month
      })
      
      setSuccess('Budget added successfully')
      loadBudgets()
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError('Failed to add budget')
      console.error(error)
    }
  }

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await window.electron.ipcRenderer.invoke('delete-category', id)
        loadCategories()
        loadBudgets()
        setSuccess('Category deleted successfully')
        setTimeout(() => setSuccess(''), 3000)
      } catch (error) {
        setError('Failed to delete category')
        console.error(error)
      }
    }
  }

  return (
    <div className="budget">
      <h1>Budget Management</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="budget-grid">
        <div className="card">
          <h2>Add Expense Category</h2>
          <form onSubmit={handleAddCategory}>
            <div className="form-group">
              <label>Category Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleCategoryChange}
                placeholder="e.g., Groceries, Utilities"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleCategoryChange}
                placeholder="Optional description"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Color</label>
              <input
                type="color"
                name="color"
                value={formData.color}
                onChange={handleCategoryChange}
              />
            </div>

            <button type="submit">Add Category</button>
          </form>
        </div>

        <div className="card">
          <h2>Set Budget</h2>
          <form onSubmit={handleAddBudget}>
            <div className="form-group">
              <label>Category</label>
              <select name="categoryId" value={budgetForm.categoryId} onChange={handleBudgetChange}>
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Budget Amount</label>
              <input
                type="number"
                name="amount"
                value={budgetForm.amount}
                onChange={handleBudgetChange}
                placeholder="0.00"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Month</label>
              <input
                type="month"
                name="month"
                value={budgetForm.month}
                onChange={handleBudgetChange}
              />
            </div>

            <button type="submit">Set Budget</button>
          </form>
        </div>
      </div>

      <div className="card">
        <h2>Categories</h2>
        {categories.length === 0 ? (
          <p>No categories yet. Create one above.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Color</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id}>
                  <td>{cat.name}</td>
                  <td>{cat.description || '-'}</td>
                  <td>
                    <div className="color-sample" style={{ backgroundColor: cat.color }}></div>
                  </td>
                  <td>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteCategory(cat.id)}
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

      <div className="card">
        <h2>Current Budgets</h2>
        {budgets.length === 0 ? (
          <p>No budgets set yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Amount</th>
                <th>Month</th>
              </tr>
            </thead>
            <tbody>
              {budgets.map(budget => {
                const category = categories.find(c => c.id === budget.categoryId)
                return (
                  <tr key={budget.id}>
                    <td>{category ? category.name : 'Unknown'}</td>
                    <td>${budget.amount.toFixed(2)}</td>
                    <td>{budget.month}</td>
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

export default Budget
