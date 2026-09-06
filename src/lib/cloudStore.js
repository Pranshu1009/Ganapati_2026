import { loadDonations, loadExpenses, saveDonations, saveExpenses } from '../utils/storage'

const API_URL = '/api/finance'
const POLL_MS = 8000

function sortByCreatedAtDesc(list) {
  return [...list].sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
}

function mapToList(value) {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean)
  return Object.values(value).filter(Boolean)
}

function toMap(list) {
  const map = {}
  list.forEach((item) => {
    if (item?.id) map[item.id] = item
  })
  return map
}

async function apiRequest(method, body) {
  const response = await fetch(API_URL, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload.error || `Cloud request failed (${response.status})`)
  }
  return payload
}

export async function fetchFinance() {
  const data = await apiRequest('GET')
  return {
    donations: sortByCreatedAtDesc(mapToList(data.donations)),
    expenses: sortByCreatedAtDesc(mapToList(data.expenses)),
    mode: 'cloud',
  }
}

export function subscribeFinance(onData, onError) {
  let stopped = false
  let timer = null

  async function tick() {
    try {
      const result = await fetchFinance()
      if (!stopped) onData(result)
    } catch (error) {
      console.error('Cloud sync error', error)
      if (!stopped) {
        onError?.(error)
        onData({
          donations: loadDonations(),
          expenses: loadExpenses(),
          mode: 'local',
        })
      }
    }
  }

  tick()
  timer = setInterval(tick, POLL_MS)

  return () => {
    stopped = true
    if (timer) clearInterval(timer)
  }
}

export async function writeDonation(donation) {
  try {
    await apiRequest('POST', { action: 'upsertDonation', donation })
  } catch (error) {
    const next = [donation, ...loadDonations().filter((d) => d.id !== donation.id)]
    saveDonations(next)
    throw error
  }
}

export async function deleteDonationCloud(id) {
  try {
    await apiRequest('POST', { action: 'deleteDonation', id })
  } catch (error) {
    saveDonations(loadDonations().filter((d) => d.id !== id))
    throw error
  }
}

export async function writeExpense(expense) {
  try {
    await apiRequest('POST', { action: 'upsertExpense', expense })
  } catch (error) {
    const next = [expense, ...loadExpenses().filter((e) => e.id !== expense.id)]
    saveExpenses(next)
    throw error
  }
}

export async function deleteExpenseCloud(id) {
  try {
    await apiRequest('POST', { action: 'deleteExpense', id })
  } catch (error) {
    saveExpenses(loadExpenses().filter((e) => e.id !== id))
    throw error
  }
}

export async function migrateLocalToCloudIfNeeded() {
  const localDonations = loadDonations()
  const localExpenses = loadExpenses()
  if (!localDonations.length && !localExpenses.length) return { migrated: false }

  try {
    const cloud = await fetchFinance()
    if (cloud.donations.length === 0 && cloud.expenses.length === 0) {
      await apiRequest('POST', {
        action: 'mergeLocal',
        data: {
          donations: toMap(localDonations),
          expenses: toMap(localExpenses),
        },
      })
      return {
        migrated: true,
        donations: localDonations.length,
        expenses: localExpenses.length,
      }
    }
  } catch {
    return { migrated: false }
  }

  return { migrated: false }
}

export async function forceUploadLocalToCloud() {
  const localDonations = loadDonations()
  const localExpenses = loadExpenses()
  await apiRequest('POST', {
    action: 'mergeLocal',
    data: {
      donations: toMap(localDonations),
      expenses: toMap(localExpenses),
    },
  })
  return {
    donations: localDonations.length,
    expenses: localExpenses.length,
  }
}

export const isCloudConfigured = true
