import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import './Comparison.css'

function Comparison() {
  const [comparisonData, setComparisonData] = useState([])
  const [categoryComparison, setCategoryComparison] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadComparisonData()
  }, [])

  const loadComparisonData = async () => {
    try {
      setLoading(true)
      const catComparison = await window.electron.ipcRenderer.invoke('get-category-comparison')
      setCategoryComparison(catComparison || [])
      
      const byMonth = await window.electron.ipcRenderer.invoke('get-monthly-comparison')
      setComparisonData(byMonth || [])
    } catch (error) {
      console.error('Error loading comparison data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="comparison"><p>Loading comparison data...</p></div>
  }

  return (
    <div className="comparison">
      <h1>Projected vs Actual Analysis</h1>

      {categoryComparison.length > 0 && (
        <div className="chart card">
          <h2>Category Spending Comparison</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={categoryComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="projected" fill="#8884d8" name="Projected" />
              <Bar dataKey="actual" fill="#82ca9d" name="Actual" />
              <Bar dataKey="variance" fill="#ffc658" name="Variance" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {comparisonData.length > 0 && (
        <div className="chart card">
          <h2>Monthly Budget Comparison</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              <Legend />
              <Line type="monotone" dataKey="projectedIncome" stroke="#8884d8" name="Projected Income" strokeWidth={2} />
              <Line type="monotone" dataKey="actualIncome" stroke="#82ca9d" name="Actual Income" strokeWidth={2} />
              <Line type="monotone" dataKey="projectedExpense" stroke="#ffc658" name="Projected Expense" strokeWidth={2} />
              <Line type="monotone" dataKey="actualExpense" stroke="#ff7c7c" name="Actual Expense" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {categoryComparison.length === 0 && comparisonData.length === 0 && (
        <div className="card">
          <p>No comparison data available. Add projected and actual transactions to see analysis.</p>
        </div>
      )}
    </div>
  )
}

export default Comparison
