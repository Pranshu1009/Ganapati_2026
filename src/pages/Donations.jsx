import { useMemo, useState } from 'react'
import { useFinance } from '../context/FinanceContext'
import { formatDate, formatINR } from '../utils/receipt'

export default function Donations() {
  const { donations, deleteDonation, resendReceipt, totals } = useFinance()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return donations
    return donations.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.phone.includes(q) ||
        d.wing.toLowerCase().includes(q) ||
        d.roomNo.toLowerCase().includes(q) ||
        d.receiptNo.toLowerCase().includes(q),
    )
  }, [donations, query])

  return (
    <section className="stack">
      <header className="page-head reveal">
        <h1>Donations</h1>
        <p>
          {totals.donorCount} receipts · {formatINR(totals.totalDonation)} collected
        </p>
      </header>

      <div className="toolbar reveal delay-1">
        <input
          className="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, wing, room, phone…"
        />
      </div>

      <section className="panel reveal delay-2">
        {filtered.length === 0 ? (
          <p className="empty">No matching donations.</p>
        ) : (
          <ul className="list dense">
            {filtered.map((d) => (
              <li key={d.id}>
                <div>
                  <strong>{d.name}</strong>
                  <span>
                    Wing {d.wing} · Room {d.roomNo} · {d.phone}
                  </span>
                  <span className="muted">{d.receiptNo} · {formatDate(d.createdAt)}</span>
                </div>
                <div className="list-right actions">
                  <strong>{formatINR(d.amount)}</strong>
                  <button type="button" className="btn tiny" onClick={() => resendReceipt(d)}>
                    Resend
                  </button>
                  <button
                    type="button"
                    className="btn tiny danger"
                    onClick={() => {
                      if (confirm(`Delete receipt for ${d.name}?`)) deleteDonation(d.id)
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
