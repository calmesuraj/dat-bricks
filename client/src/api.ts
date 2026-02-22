import { APP_PROVIDER } from './provider'

export async function runSQL(sql: string) {
  const res = await fetch(`/api/query?provider=${APP_PROVIDER}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sql }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data?.error || `HTTP ${res.status}`)
  }
  return data
}
