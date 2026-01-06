import React, { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import './Dashboard.css'

function Dashboard() {
  const [accounts, setAccounts] = useState([])
  const [totalBalance, setTotalBalance] = useState(0)
  const [chartData, setChartData] = useState([])
  const [categorySpending, setCategorySpending] = useState([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const response = await window.electron.ipcRenderer.invoke('get-accounts')
      setAccounts(response || [])
      
      const total = (response || []).reduce((sum, acc) => sum + acc.balance, 0)
      setTotalBalance(total)

      const spending = await window.electron.ipcRenderer.invoke('get-category-spending')
      setCategorySpending(spending || [])

      const balanceHistory = await window.electron.ipcRenderer.invoke('get-balance-history')
      setChartData(balanceHistory || [])
    } catch (error) {
      console.error('Error loading dashboard:', error)
    }
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658', '#ff7c7c']

  return (
    <div className="dashboard">
      <h1>Financial Overview</h1>
      
      <div className="summary-cards">
        <div className="summary-card">
          <h3>Total Balance</h3>
          <p className="amount">${totalBalance.toFixed(2)}</p>
        </div>
        <div className="summary-card">
          <h3>Accounts</h3>
          <p className="amount">{accounts.length}</p>
        </div>
      </div>

      <div className="accounts-summary card">
        <h2>Account Balances</h2>
        <table>
          <thead>
            <tr>
              <th>Account Name</th>
              <th>Type</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map(account => (
              <tr key={account.id}>
                <td>{account.name}</td>
                <td>{account.type}</td>
                <td>${account.balance.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="charts-container">
        {chartData.length > 0 && (
          <div className="chart card">
            <h2>Balance Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Legend />
                <Line type="monotone" dataKey="balance" stroke="#8884d8" name="Total Balance" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {categorySpending.length > 0 && (
          <div className="chart card">
            <h2>Spending by Category</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categorySpending}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: $${value.toFixed(2)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categorySpending.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
