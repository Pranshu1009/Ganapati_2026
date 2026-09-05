import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  createId,
  createReceiptNo,
  loadDonations,
  loadExpenses,
  saveDonations,
  saveExpenses,
} from '../utils/storage'
import { openWhatsAppReceipt } from '../utils/receipt'

const FinanceContext = createContext(null)

export function FinanceProvider({ children }) {
  const [donations, setDonations] = useState(() => loadDonations())
  const [expenses, setExpenses] = useState(() => loadExpenses())

  useEffect(() => {
    saveDonations(donations)
  }, [donations])

  useEffect(() => {
    saveExpenses(expenses)
  }, [expenses])

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

  function addDonation(form, { sendReceipt = true } = {}) {
    const donation = {
      id: createId('don'),
      receiptNo: createReceiptNo(),
      name: form.name.trim(),
      phone: form.phone.trim(),
      wing: form.wing.trim().toUpperCase(),
      roomNo: form.roomNo.trim(),
      amount: Number(form.amount),
      createdAt: new Date().toISOString(),
    }

    setDonations((prev) => [donation, ...prev])

    if (sendReceipt) {
      openWhatsAppReceipt(donation)
    }

    return donation
  }

  function deleteDonation(id) {
    setDonations((prev) => prev.filter((d) => d.id !== id))
  }

  function addExpense(form) {
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
    return expense
  }

  function deleteExpense(id) {
    setExpenses((prev) => prev.filter((e) => e.id !== id))
  }

  function resendReceipt(donation) {
    openWhatsAppReceipt(donation)
  }

  const value = {
    donations,
    expenses,
    totals,
    addDonation,
    deleteDonation,
    addExpense,
    deleteExpense,
    resendReceipt,
  }

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}

export function useFinance() {
  const ctx = useContext(FinanceContext)
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider')
  return ctx
}
