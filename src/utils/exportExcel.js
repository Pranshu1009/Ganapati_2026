import * as XLSX from 'xlsx'
import { formatDay } from './receipt'

export function exportAllDataToExcel({ donations, expenses, totals }) {
  const chandaRows = donations.map((d, index) => ({
    'S.No': index + 1,
    'Receipt No': d.receiptNo || '',
    Wing: d.wing || '',
    'Room No': d.roomNo || '',
    Amount: Number(d.amount) || 0,
    'Collected On': d.createdAt ? formatDay(d.createdAt) : '',
  }))

  const expenseRows = expenses.map((e, index) => ({
    'S.No': index + 1,
    Title: e.title || '',
    Category: e.category || '',
    Amount: Number(e.amount) || 0,
    'Expense Date': formatDay(e.expenseDate || e.createdAt),
    Note: e.note || '',
  }))

  const summaryRows = [
    { Particular: 'Total Chanda / Donation', Amount: Number(totals.totalDonation) || 0 },
    { Particular: 'Total Expense', Amount: Number(totals.totalExpense) || 0 },
    { Particular: 'Amount Remaining', Amount: Number(totals.remaining) || 0 },
    { Particular: 'Total Chanda Entries', Amount: Number(totals.donorCount) || 0 },
    { Particular: 'Total Expense Entries', Amount: Number(totals.expenseCount) || 0 },
  ]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(summaryRows), 'Summary')
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(
      chandaRows.length
        ? chandaRows
        : [{ 'S.No': '', 'Receipt No': '', Wing: '', 'Room No': '', Amount: '', 'Collected On': '' }],
    ),
    'Chanda',
  )
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(
      expenseRows.length
        ? expenseRows
        : [{ 'S.No': '', Title: '', Category: '', Amount: '', 'Expense Date': '', Note: '' }],
    ),
    'Expenses',
  )

  const stamp = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(workbook, `Gokul-Dhara-Ganapati-${stamp}.xlsx`)
}
