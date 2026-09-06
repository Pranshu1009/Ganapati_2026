import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  deleteDonationCloud,
  deleteExpenseCloud,
  forceUploadLocalToCloud,
  migrateLocalToCloudIfNeeded,
  subscribeFinance,
  writeDonation,
  writeExpense,
} from '../lib/cloudStore'
import { createId, createReceiptNo } from '../utils/storage'

const FinanceContext = createContext(null)

export function FinanceProvider({ children }) {
  const [donations, setDonations] = useState([])
  const [expenses, setExpenses] = useState([])
  const [syncMode, setSyncMode] = useState('connecting')
  const [syncError, setSyncError] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true
    let unsubscribe = () => {}

    async function start() {
      try {
        await migrateLocalToCloudIfNeeded()
      } catch (err) {
        console.error(err)
      }

      if (!active) return

      unsubscribe = subscribeFinance(
        ({ donations: nextDonations, expenses: nextExpenses, mode }) => {
          if (!active) return
          setDonations(nextDonations)
          setExpenses(nextExpenses)
          setSyncMode(mode)
          setReady(true)
          if (mode === 'cloud') setSyncError('')
        },
        (error) => {
          if (!active) return
          setSyncError(
            error?.message ||
              'Cloud sync unavailable. Data on this device only until sync is fixed.',
          )
          setSyncMode('local')
          setReady(true)
        },
      )
    }

    start()

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const totals = useMemo(() => {
    const totalDonation = donations.reduce((sum, d) => sum + Number(d.amount), 0)
    const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
    return {
      totalDonation,
      totalExpense,
      remaining: totalDonation - totalExpense,
      donorCount: donations.length,
      expenseCount: expenses.length,
    }
  }, [donations, expenses])

  async function addDonation(form) {
    const donation = {
      id: createId('don'),
      receiptNo: createReceiptNo(),
      wing: form.wing.trim().toUpperCase(),
      roomNo: form.roomNo.trim(),
      amount: Number(form.amount),
      createdAt: new Date().toISOString(),
    }

    setDonations((prev) => [donation, ...prev])
    try {
      await writeDonation(donation)
      setSyncError('')
      setSyncMode('cloud')
    } catch (err) {
      console.error(err)
      setSyncError(err.message || 'Failed to sync chanda to cloud.')
    }
    return donation
  }

  async function deleteDonation(id) {
    setDonations((prev) => prev.filter((d) => d.id !== id))
    try {
      await deleteDonationCloud(id)
    } catch (err) {
      console.error(err)
      setSyncError(err.message || 'Failed to delete chanda from cloud.')
    }
  }

  async function addExpense(form) {
    const expenseDate = form.expenseDate || new Date().toISOString().slice(0, 10)
    const expense = {
      id: createId('exp'),
      title: form.title.trim(),
      category: form.category.trim(),
      amount: Number(form.amount),
      note: form.note?.trim() || '',
      expenseDate,
      createdAt: new Date().toISOString(),
    }
    setExpenses((prev) => [expense, ...prev])
    try {
      await writeExpense(expense)
      setSyncError('')
      setSyncMode('cloud')
    } catch (err) {
      console.error(err)
      setSyncError(err.message || 'Failed to sync expense to cloud.')
    }
    return expense
  }

  async function deleteExpense(id) {
    setExpenses((prev) => prev.filter((e) => e.id !== id))
    try {
      await deleteExpenseCloud(id)
    } catch (err) {
      console.error(err)
      setSyncError(err.message || 'Failed to delete expense from cloud.')
    }
  }

  async function uploadLocalDataToCloud() {
    const result = await forceUploadLocalToCloud()
    setSyncError('')
    setSyncMode('cloud')
    return result
  }

  const value = {
    donations,
    expenses,
    totals,
    syncMode,
    syncError,
    ready,
    cloudEnabled: true,
    addDonation,
    deleteDonation,
    addExpense,
    deleteExpense,
    uploadLocalDataToCloud,
  }

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}

export function useFinance() {
  const ctx = useContext(FinanceContext)
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider')
  return ctx
}
