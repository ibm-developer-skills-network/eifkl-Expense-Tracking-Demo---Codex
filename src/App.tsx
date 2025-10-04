import { useState, useEffect } from 'react';
import './App.css';

interface Expense {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
}

function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    const response = await fetch('/api/expenses');
    const data = await response.json();
    setExpenses(data);
  };

  const addExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description,
        amount: parseFloat(amount),
        category,
        date,
      }),
    });
    setDescription('');
    setAmount('');
    setCategory('Food');
    setDate(new Date().toISOString().split('T')[0]);
    fetchExpenses();
  };

  const deleteExpense = async (id: number) => {
    await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
    fetchExpenses();
  };

  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="app">
      <div className="container">
        <h1>💰 Expense Tracker</h1>

        <div className="total">
          <h2>Total Expenses</h2>
          <p className="amount">${total.toFixed(2)}</p>
        </div>

        <form onSubmit={addExpense} className="form">
          <div className="form-group">
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              required
            />

            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="Food">Food</option>
              <option value="Transport">Transport</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Shopping">Shopping</option>
              <option value="Bills">Bills</option>
              <option value="Other">Other</option>
            </select>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <button type="submit">Add Expense</button>
        </form>

        <div className="expenses-list">
          {expenses.map((expense) => (
            <div key={expense.id} className="expense-item">
              <div className="expense-info">
                <div className="expense-header">
                  <span className="expense-description">{expense.description}</span>
                  <span className="expense-amount">${expense.amount.toFixed(2)}</span>
                </div>
                <div className="expense-meta">
                  <span className="expense-category">{expense.category}</span>
                  <span className="expense-date">{new Date(expense.date).toLocaleDateString()}</span>
                </div>
              </div>
              <button
                className="delete-btn"
                onClick={() => deleteExpense(expense.id)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
