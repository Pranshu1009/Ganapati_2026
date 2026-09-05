import { useMemo, useState } from 'react'
import { useFinance } from '../context/FinanceContext'
import { formatDay, formatINR, todayInputValue } from '../utils/receipt'

function emptyForm() {
  return {
    title: '',
    category: 'Decoration',
    amount: '',
    expenseDate: todayInputValue(),
    note: '',
  }
}

const categories = ['Decoration', 'Prasad', 'Lighting', 'Sound', 'Mandap', 'Misc']

export default function Expenses() {
  const { expenses, addExpense, deleteExpense, totals } = useFinance()
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  const sortedExpenses = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = q
      ? expenses.filter(
          (e) =>
            e.title.toLowerCase().includes(q) ||
            e.category.toLowerCase().includes(q) ||
            (e.note || '').toLowerCase().includes(q) ||
            (e.expenseDate || '').includes(q) ||
            formatDay(e.expenseDate || e.createdAt).toLowerCase().includes(q),
        )
      : expenses

    return [...list].sort((a, b) => {
      const da = a.expenseDate || a.createdAt.slice(0, 10)
      const db = b.expenseDate || b.createdAt.slice(0, 10)
      if (da === db) return new Date(b.createdAt) - new Date(a.createdAt)
      return db.localeCompare(da)
    })
  }, [expenses, query])

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
    if (!form.expenseDate) {
      setError('Select the expense date.')
      return
    }
    if (!form.amount || Number(form.amount) <= 0) {
      setError('Enter a valid amount.')
      return
    }
    addExpense(form)
    setForm(emptyForm())
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
            Expense date
            <input
              type="date"
              value={form.expenseDate}
              onChange={(e) => update('expenseDate', e.target.value)}
              required
            />
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
        <div className="panel-head">
          <h2>All expenses</h2>
          <span className="muted-count">{sortedExpenses.length} shown</span>
        </div>

        <div className="toolbar">
          <input
            className="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, category, date…"
          />
        </div>

        {sortedExpenses.length === 0 ? (
          <p className="empty">No expenses to show.</p>
        ) : (
          <ul className="list dense">
            {sortedExpenses.map((e) => (
              <li key={e.id}>
                <div>
                  <strong>{e.title}</strong>
                  <span>
                    {e.category}
                    {e.note ? ` · ${e.note}` : ''}
                  </span>
                  <span className="muted">Date: {formatDay(e.expenseDate || e.createdAt)}</span>
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
