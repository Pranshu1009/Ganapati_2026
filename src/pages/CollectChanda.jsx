import { useState } from 'react'
import { useFinance } from '../context/FinanceContext'
import { formatINR } from '../utils/receipt'

const empty = {
  wing: '',
  roomNo: '',
  amount: '',
}

export default function CollectChanda() {
  const { addDonation } = useFinance()
  const [form, setForm] = useState(empty)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  function validate() {
    if (!form.wing.trim()) return 'Enter wing.'
    if (!form.roomNo.trim()) return 'Enter room number.'
    if (!form.amount || Number(form.amount) <= 0) return 'Enter a valid amount.'
    return ''
  }

  function handleSubmit(e) {
    e.preventDefault()
    const msg = validate()
    if (msg) {
      setError(msg)
      return
    }

    const donation = addDonation(form)
    setSuccess(donation)
    setForm(empty)
  }

  return (
    <section className="stack narrow">
      <header className="page-head reveal">
        <h1>Collect Chanda</h1>
        <p>Save wing, room number, and amount for each contribution.</p>
      </header>

      <form className="form-panel reveal delay-1" onSubmit={handleSubmit}>
        <div className="field-grid">
          <label>
            Wing
            <input
              value={form.wing}
              onChange={(e) => update('wing', e.target.value)}
              placeholder="A / B / C"
              required
            />
          </label>
          <label>
            Room no.
            <input
              value={form.roomNo}
              onChange={(e) => update('roomNo', e.target.value)}
              placeholder="e.g. 1204"
              required
            />
          </label>
          <label className="full">
            Amount (₹)
            <input
              value={form.amount}
              onChange={(e) => update('amount', e.target.value)}
              placeholder="500"
              inputMode="numeric"
              type="number"
              min="1"
              required
            />
          </label>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <button type="submit" className="btn primary wide">
          Save Chanda
        </button>
      </form>

      {success ? (
        <aside className="success-banner reveal" role="status">
          <div>
            <p className="success-title">Chanda recorded</p>
            <p>
              Wing {success.wing} · Room {success.roomNo} · {formatINR(success.amount)} ·{' '}
              {success.receiptNo}
            </p>
          </div>
          <button type="button" className="btn ghost" onClick={() => setSuccess(null)}>
            Dismiss
          </button>
        </aside>
      ) : null}
    </section>
  )
}
