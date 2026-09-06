import { useState } from 'react'
import { useFinance } from '../context/FinanceContext'
import { exportAllDataToExcel } from '../utils/exportExcel'
import { formatDate, formatDay, formatINR } from '../utils/receipt'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const {
    totals,
    donations,
    expenses,
    syncMode,
    syncError,
    cloudEnabled,
    uploadLocalDataToCloud,
  } = useFinance()
  const recentDonations = donations.slice(0, 5)
  const recentExpenses = expenses.slice(0, 5)
  const [uploadMsg, setUploadMsg] = useState('')
  const [uploading, setUploading] = useState(false)

  function handleExport() {
    exportAllDataToExcel({ donations, expenses, totals })
  }

  async function handleUploadLocal() {
    setUploading(true)
    setUploadMsg('')
    try {
      const result = await uploadLocalDataToCloud()
      setUploadMsg(
        `Uploaded ${result.donations} chanda + ${result.expenses} expenses from this device to shared cloud.`,
      )
    } catch (err) {
      setUploadMsg(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const syncLabel =
    syncMode === 'cloud'
      ? 'Synced across all devices'
      : syncMode === 'connecting'
        ? 'Connecting to cloud…'
        : cloudEnabled
          ? 'Offline — local only'
          : 'Cloud not configured'

  return (
    <section className="stack">
      <header className="page-head reveal">
        <h1>Dashboard</h1>
        <p>Track chanda, expenses, and balance for the Ganapati celebration.</p>
        <p className={`sync-pill ${syncMode === 'cloud' ? 'ok' : 'warn'}`}>{syncLabel}</p>
        {syncError ? <p className="form-error">{syncError}</p> : null}
      </header>

      <div className="stat-grid reveal delay-1">
        <article className="stat-block donation">
          <p className="stat-label">Total Donation</p>
          <p className="stat-value">{formatINR(totals.totalDonation)}</p>
          <p className="stat-meta">{totals.donorCount} entries</p>
        </article>
        <article className="stat-block expense">
          <p className="stat-label">Total Expense</p>
          <p className="stat-value">{formatINR(totals.totalExpense)}</p>
          <p className="stat-meta">{totals.expenseCount} entries</p>
        </article>
        <article className="stat-block remaining">
          <p className="stat-label">Amount Remaining</p>
          <p className="stat-value">{formatINR(totals.remaining)}</p>
          <p className="stat-meta">Donations − Expenses</p>
        </article>
      </div>

      <div className="action-row reveal delay-2">
        <Link className="btn primary" to="/collect">
          Collect Chanda
        </Link>
        <Link className="btn ghost" to="/expenses">
          Add Expense
        </Link>
        <button type="button" className="btn ghost" onClick={handleExport}>
          Download Excel
        </button>
        {cloudEnabled ? (
          <button
            type="button"
            className="btn ghost"
            onClick={handleUploadLocal}
            disabled={uploading}
          >
            {uploading ? 'Uploading…' : 'Upload this phone’s data'}
          </button>
        ) : null}
      </div>
      {uploadMsg ? <p className="hint">{uploadMsg}</p> : null}

      <div className="split-panels reveal delay-3">
        <section className="panel">
          <div className="panel-head">
            <h2>Recent chanda</h2>
            <Link to="/donations">View all</Link>
          </div>
          {recentDonations.length === 0 ? (
            <p className="empty">No chanda collected yet.</p>
          ) : (
            <ul className="list">
              {recentDonations.map((d) => (
                <li key={d.id}>
                  <div>
                    <strong>
                      Wing {d.wing} · Room {d.roomNo}
                    </strong>
                    <span>{d.receiptNo}</span>
                  </div>
                  <div className="list-right">
                    <strong>{formatINR(d.amount)}</strong>
                    <span>{formatDate(d.createdAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel">
          <div className="panel-head">
            <h2>Recent expenses</h2>
            <Link to="/expenses">View all</Link>
          </div>
          {recentExpenses.length === 0 ? (
            <p className="empty">No expenses recorded yet.</p>
          ) : (
            <ul className="list">
              {recentExpenses.map((e) => (
                <li key={e.id}>
                  <div>
                    <strong>{e.title}</strong>
                    <span>{e.category}</span>
                  </div>
                  <div className="list-right">
                    <strong>{formatINR(e.amount)}</strong>
                    <span>{formatDay(e.expenseDate || e.createdAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </section>
  )
}
