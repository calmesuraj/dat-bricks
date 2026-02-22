import express from 'express'
import { runDbQuery } from './db.js'
import { DEFAULT_PROVIDER, type Provider } from './provider.js'

const router = express.Router()

function normalizeProvider(p: unknown): Provider {
  const provider = (typeof p === 'string' ? p : '').toLowerCase()
  if (provider === 'azuresql') return 'azuresql'
  if (provider === 'databricks') return 'databricks'
  return DEFAULT_PROVIDER
}

router.get('/employees', async (req, res) => {
  const provider = normalizeProvider(req.query.provider)

  try {
    // NOTE: these SQLs differ per DB, so use the correct one
    const sql =
      provider === 'azuresql'
        ? 'SELECT TOP 100 * FROM dbo.Employees'
        : 'SELECT * FROM workspace.demo_db.employees LIMIT 100'

    const rows = await runDbQuery(sql, provider)
    return res.json({ provider, rows })
  } catch (e: any) {
    console.error(`[EMPLOYEES ERROR] provider=${provider}`, e?.message || e)
    return res.status(500).json({ provider, error: e?.message || 'Internal Server Error' })
  }
})

router.post('/query', async (req, res) => {
  const provider = normalizeProvider(req.query.provider)
  const { sql } = req.body || {}

  console.log(`[QUERY] provider=${provider} sql=${sql}`)

  if (!sql) return res.status(400).json({ error: 'Missing sql' })

  try {
    const rows = await runDbQuery(sql, provider)
    return res.json({ provider, rows })
  } catch (e: any) {
    console.error(`[QUERY ERROR] provider=${provider}`, e?.message || e)
    return res.status(500).json({ provider, error: e?.message || 'Internal Server Error' })
  }
})

export default router
