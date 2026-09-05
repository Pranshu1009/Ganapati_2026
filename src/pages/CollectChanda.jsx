import { useState } from 'react'
import { useFinance } from '../context/FinanceContext'
import { formatINR } from '../utils/receipt'

const empty = {
  name: '',
  phone: '',
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
    if (!form.name.trim()) return 'Enter donor name.'
    const phone = form.phone.replace(/\D/g, '')
    if (phone.length < 10) return 'Enter a valid 10-digit mobile number.'
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

    const donation = addDonation(form, { sendReceipt: true })
    setSuccess(donation)
    setForm(empty)
  }

  return (
    <section className="stack narrow">
      <header className="page-head reveal">
        <h1>Collect Chanda</h1>
        <p>Save donor details and send a WhatsApp digital receipt instantly.</p>
      </header>

      <form className="form-panel reveal delay-1" onSubmit={handleSubmit}>
        <div className="field-grid">
          <label>
            Donor name
            <input
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="e.g. Priya Sharma"
              autoComplete="name"
              required
            />
          </label>
          <label>
            Mobile number
            <input
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              placeholder="10-digit WhatsApp number"
              inputMode="tel"
              autoComplete="tel"
              required
            />
          </label>
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
          Save &amp; Send Receipt
        </button>
        <p className="hint">
          WhatsApp opens with a ready receipt for the donor. Tap send to deliver it.
        </p>
      </form>

      {success ? (
        <aside className="success-banner reveal" role="status">
          <div>
            <p className="success-title">Chanda recorded</p>
            <p>
              {success.name} · {formatINR(success.amount)} · Receipt {success.receiptNo}
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
