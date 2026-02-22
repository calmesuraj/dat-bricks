import 'dotenv/config'

import express, { Request, Response } from 'express'
import cors from 'cors'
import routes from './routes.js'
import { ENV } from './env.js'

process.on('unhandledRejection', (e) => {
  console.error('[UNHANDLED REJECTION]', e)
  process.exit(1)
})
process.on('uncaughtException', (e) => {
  console.error('[UNCAUGHT EXCEPTION]', e)
  process.exit(1)
})

console.log('[BOOT] ENV:', {
  PORT: ENV.PORT,
  DATABRICKS: {
    HOST: !!ENV.DATABRICKS_HOSTNAME,
    PATH: !!ENV.DATABRICKS_HTTP_PATH,
    TOKEN: !!ENV.DATABRICKS_TOKEN,
  },
  AZURESQL: {
    SERVER: !!ENV.AZURESQL_SERVER,
    DB: !!ENV.AZURESQL_DATABASE,
    USER: !!ENV.AZURESQL_USER,
    PASS: !!ENV.AZURESQL_PASSWORD,
  },
})

const app = express()
app.use(express.json())
app.use(cors())

app.get('/api/health', (_req: Request, res: Response) => res.json({ ok: true }))

// ✅ all query endpoints live here (supports provider flag)
app.use('/api', routes)

const port = Number(ENV.PORT) || 8787
const server = app.listen(port, () => {
  console.log(`API on http://localhost:${port}`)
})
server.on('error', (err) => {
  console.error('[SERVER LISTEN ERROR]', err)
  process.exit(1)
})