import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

// Load default dotenv first, then explicitly load ../.env relative to this file.
// This makes env loading robust when running from monorepo root via npm workspaces.
dotenv.config()
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, "../.env") })

export const ENV = {
  DATABRICKS_HOSTNAME: process.env.DATABRICKS_HOST || '',
  DATABRICKS_HTTP_PATH: process.env.DATABRICKS_HTTP_PATH || '',
  DATABRICKS_TOKEN: process.env.DATABRICKS_TOKEN || '',

  AZURESQL_SERVER: process.env.AZURESQL_SERVER || '',
  AZURESQL_DATABASE: process.env.AZURESQL_DATABASE || '',
  AZURESQL_USER: process.env.AZURESQL_USER || '',
  AZURESQL_PASSWORD: process.env.AZURESQL_PASSWORD || '',

  PORT: process.env.PORT || '8787',
}
