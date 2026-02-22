import { DBSQLClient } from "@databricks/sql"
import { ENV } from "./env.js"

export async function runQuery(sql: string) {
  let client: DBSQLClient | null = null

  try {
    // validate env
    if (!ENV.DATABRICKS_HOSTNAME) throw new Error("Missing DATABRICKS_HOST")
    if (!ENV.DATABRICKS_HTTP_PATH) throw new Error("Missing DATABRICKS_HTTP_PATH")
    if (!ENV.DATABRICKS_TOKEN) throw new Error("Missing DATABRICKS_TOKEN")

    client = new DBSQLClient()
    await client.connect({
      host: ENV.DATABRICKS_HOSTNAME,
      path: ENV.DATABRICKS_HTTP_PATH,
      token: ENV.DATABRICKS_TOKEN,
    })

    const session = await client.openSession()
    try {
      const op = await session.executeStatement(sql, { runAsync: true })
      const rows = await op.fetchAll()
      await op.close()
      return rows
    } finally {
      await session.close().catch((e) => console.error("Error closing session:", e))
    }
  } catch (e: any) {
    throw new Error(`Databricks error: ${e?.message || e}`)
  } finally {
    await client?.close().catch((e) => console.error("Error closing client:", e))
  }
}