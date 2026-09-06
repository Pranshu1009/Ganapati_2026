import { useMemo, useState } from 'react'
import { useFinance } from '../context/FinanceContext'
import { formatDate, formatINR } from '../utils/receipt'

export default function Donations() {
  const { donations, deleteDonation, totals } = useFinance()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return donations
    return donations.filter(
      (d) =>
        d.wing.toLowerCase().includes(q) ||
        d.roomNo.toLowerCase().includes(q) ||
        String(d.amount).includes(q) ||
        d.receiptNo.toLowerCase().includes(q),
    )
  }, [donations, query])

  return (
    <section className="stack">
      <header className="page-head reveal">
        <h1>Chanda Records</h1>
        <p>
          {totals.donorCount} entries · {formatINR(totals.totalDonation)} collected
        </p>
      </header>

      <div className="toolbar reveal delay-1">
        <input
          className="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by wing, room, amount, receipt…"
        />
      </div>

      <section className="panel reveal delay-2">
        {filtered.length === 0 ? (
          <p className="empty">No matching chanda records.</p>
        ) : (
          <ul className="list dense">
            {filtered.map((d) => (
              <li key={d.id}>
                <div>
                  <strong>
                    Wing {d.wing} · Room {d.roomNo}
                  </strong>
                  <span className="muted">{d.receiptNo} · {formatDate(d.createdAt)}</span>
                </div>
                <div className="list-right actions">
                  <strong>{formatINR(d.amount)}</strong>
                  <button
                    type="button"
                    className="btn tiny danger"
                    onClick={() => {
                      if (confirm(`Delete chanda for Wing ${d.wing} · Room ${d.roomNo}?`)) {
                        deleteDonation(d.id)
                      }
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
