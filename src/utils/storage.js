const KEYS = {
  donations: 'gds_donations',
  expenses: 'gds_expenses',
}

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function loadDonations() {
  return read(KEYS.donations, [])
}

export function saveDonations(donations) {
  write(KEYS.donations, donations)
}

export function loadExpenses() {
  return read(KEYS.expenses, [])
}

export function saveExpenses(expenses) {
  write(KEYS.expenses, expenses)
}

export function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function createReceiptNo() {
  const year = new Date().getFullYear()
  const seq = String(Date.now()).slice(-6)
  return `GDS-${year}-${seq}`
}
