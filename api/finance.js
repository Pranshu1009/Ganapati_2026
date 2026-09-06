const GIST_ID = '2cdd53b03ba41ca6b0e35ebc6e6790af'
const FILE_NAME = 'finance.json'

function json(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(body))
}

function normalizeStore(raw) {
  return {
    donations: raw?.donations && typeof raw.donations === 'object' ? raw.donations : {},
    expenses: raw?.expenses && typeof raw.expenses === 'object' ? raw.expenses : {},
  }
}

async function readGist(token) {
  const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'User-Agent': 'gokul-dhara-society',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Cloud read failed (${response.status}): ${text}`)
  }
  const payload = await response.json()
  const file = payload.files?.[FILE_NAME]
  if (!file?.content && file?.raw_url) {
    const raw = await fetch(file.raw_url)
    return normalizeStore(await raw.json())
  }
  return normalizeStore(JSON.parse(file?.content || '{}'))
}

async function writeGist(token, data) {
  const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'gokul-dhara-society',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({
      files: {
        [FILE_NAME]: {
          content: JSON.stringify(data, null, 2),
        },
      },
    }),
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Cloud write failed (${response.status}): ${text}`)
  }
  return response.json()
}

export default async function handler(req, res) {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || process.env.FINANCE_GITHUB_TOKEN
  if (!token) {
    return json(res, 503, {
      error:
        'Shared cloud is not configured yet. Add GITHUB_TOKEN in Vercel → Project → Settings → Environment Variables, then Redeploy.',
    })
  }

  try {
    if (req.method === 'GET') {
      const data = await readGist(token)
      return json(res, 200, data)
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
      const store = await readGist(token)

      if (body.replace === true) {
        const next = normalizeStore(body.data || body)
        await writeGist(token, next)
        return json(res, 200, next)
      }

      if (body.action === 'upsertDonation' && body.donation?.id) {
        store.donations[body.donation.id] = body.donation
      } else if (body.action === 'deleteDonation' && body.id) {
        delete store.donations[body.id]
      } else if (body.action === 'upsertExpense' && body.expense?.id) {
        store.expenses[body.expense.id] = body.expense
      } else if (body.action === 'deleteExpense' && body.id) {
        delete store.expenses[body.id]
      } else if (body.action === 'mergeLocal') {
        const incoming = normalizeStore(body.data)
        store.donations = { ...store.donations, ...incoming.donations }
        store.expenses = { ...store.expenses, ...incoming.expenses }
      } else {
        return json(res, 400, { error: 'Unknown action' })
      }

      await writeGist(token, store)
      return json(res, 200, store)
    }

    res.setHeader('Allow', 'GET, PUT, POST')
    return json(res, 405, { error: 'Method not allowed' })
  } catch (error) {
    return json(res, 500, { error: error.message || 'Server error' })
  }
}
