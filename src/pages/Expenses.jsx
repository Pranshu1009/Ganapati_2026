import { useState } from 'react'
import { useFinance } from '../context/FinanceContext'
import { formatDate, formatINR } from '../utils/receipt'

const empty = {
  title: '',
  category: 'Decoration',
  amount: '',
  note: '',
}

const categories = ['Decoration', 'Prasad', 'Lighting', 'Sound', 'Mandap', 'Misc']

export default function Expenses() {
  const { expenses, addExpense, deleteExpense, totals } = useFinance()
  const [form, setForm] = useState(empty)
  const [error, setError] = useState('')

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) {
      setError('Enter expense title.')
      return
    }
    if (!form.amount || Number(form.amount) <= 0) {
      setError('Enter a valid amount.')
      return
    }
    addExpense(form)
    setForm(empty)
  }

  return (
    <section className="stack">
      <header className="page-head reveal">
        <h1>Expenses</h1>
        <p>
          {totals.expenseCount} entries · {formatINR(totals.totalExpense)} spent ·{' '}
          {formatINR(totals.remaining)} remaining
        </p>
      </header>

      <form className="form-panel reveal delay-1" onSubmit={handleSubmit}>
        <div className="field-grid">
          <label className="full">
            Title
            <input
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="e.g. Flower decoration"
              required
            />
          </label>
          <label>
            Category
            <select value={form.category} onChange={(e) => update('category', e.target.value)}>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label>
            Amount (₹)
            <input
              value={form.amount}
              onChange={(e) => update('amount', e.target.value)}
              type="number"
              min="1"
              inputMode="numeric"
              placeholder="1000"
              required
            />
          </label>
          <label className="full">
            Note (optional)
            <input
              value={form.note}
              onChange={(e) => update('note', e.target.value)}
              placeholder="Vendor / bill details"
            />
          </label>
        </div>
        {error ? <p className="form-error">{error}</p> : null}
        <button type="submit" className="btn primary">
          Add Expense
        </button>
      </form>

      <section className="panel reveal delay-2">
        {expenses.length === 0 ? (
          <p className="empty">No expenses yet.</p>
        ) : (
          <ul className="list dense">
            {expenses.map((e) => (
              <li key={e.id}>
                <div>
                  <strong>{e.title}</strong>
                  <span>
                    {e.category}
                    {e.note ? ` · ${e.note}` : ''}
                  </span>
                  <span className="muted">{formatDate(e.createdAt)}</span>
                </div>
                <div className="list-right actions">
                  <strong>{formatINR(e.amount)}</strong>
                  <button
                    type="button"
                    className="btn tiny danger"
                    onClick={() => {
                      if (confirm(`Delete expense “${e.title}”?`)) deleteExpense(e.id)
                    }}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  )
}
