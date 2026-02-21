import { DBSQLClient } from "@databricks/sql";
import { requireDatabricksEnv } from "./env.js";

export async function runQuery(sql: string) {
  let client: DBSQLClient | null = null;

  try {
    const db = requireDatabricksEnv();

    client = new DBSQLClient();
    await client.connect({
      host: db.host,
      path: db.path,
      token: db.token,
    });

    const session = await client.openSession();
    try {
      const op = await session.executeStatement(sql, { runAsync: true });
      const rows = await op.fetchAll();
      await op.close();
      return rows;
    } finally {
      await session.close().catch((e) => console.error("Error closing session:", e));
    }
  } catch (e: any) {
    throw new Error(`Databricks error: ${e?.message || e}`);
  } finally {
    await client?.close().catch((e) => console.error("Error closing client:", e));
  }
}