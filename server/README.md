# Backend API Guide (Beginner Friendly)

This folder (`server/`) is your backend.

If you are new to backend, think of it like this:
- Frontend (React) shows buttons/tables.
- Backend (Express API) receives requests from frontend.
- Backend talks to database using secret credentials.
- Backend sends data back to frontend as JSON.

Your backend supports two databases:
- Databricks SQL
- Azure SQL

## 1) What Is an API in This Project?

An API is just URLs your frontend calls.

Example:
- Frontend calls: `POST /api/query`
- Backend runs SQL
- Backend returns rows

So API is the "middle layer" between UI and DB.

## 2) Main Files and What They Do

- `src/server.ts`
  Creates and starts Express server.
- `src/routes.ts`
  Defines API endpoints (`/api/query`, `/api/employees`).
- `src/provider.ts`
  Default database provider if request does not specify one.
- `src/db.ts`
  Chooses which DB function to call (Databricks or Azure SQL).
- `src/databricks.ts`
  Databricks connection + query execution.
- `src/azuresql.ts`
  Azure SQL connection + query execution.
- `src/env.ts`
  Loads env vars from process and `server/.env`.

## 3) End-to-End Request Flow

When frontend asks for data, this happens:

1. Frontend sends request to backend URL.
   Example: `POST /api/query?provider=azuresql`
2. `src/routes.ts` reads:
   - `provider` from URL query string
   - `sql` from JSON request body
3. `src/routes.ts` calls `runDbQuery(sql, provider)` from `src/db.ts`
4. `src/db.ts` routes request:
   - `azuresql` -> `runAzureSqlQuery` in `src/azuresql.ts`
   - otherwise -> `runQuery` in `src/databricks.ts`
5. DB returns rows
6. Backend returns JSON response to frontend:
   - success: `{ provider, rows }`
   - failure: `{ provider, error }`

## 4) How Provider Selection Works

There are two ways provider is chosen:

1. Explicit in request URL:
   - `?provider=azuresql`
   - `?provider=databricks`
2. Default from code in `src/provider.ts`:
```ts
export const DEFAULT_PROVIDER: Provider = "azuresql"
```

Priority rule:
- If URL has `provider`, that is used.
- If URL has no `provider`, backend uses `DEFAULT_PROVIDER`.

## 5) API Endpoints You Have

### GET `/api/employees`
Runs a built-in sample query based on provider.

- Azure SQL query:
  `SELECT TOP 100 * FROM dbo.Employees`
- Databricks query:
  `SELECT * FROM workspace.demo_db.employees LIMIT 100`

### POST `/api/query`
Runs custom SQL you send in request body.

Request body:
```json
{
  "sql": "SELECT TOP 10 * FROM dbo.Employees"
}
```

Examples:
- `POST /api/query?provider=azuresql`
- `POST /api/query?provider=databricks`
- `POST /api/query` (uses default provider)

## 6) SQL Syntax Difference (Very Important)

Databricks and Azure SQL do not use exactly the same SQL.

Examples:
- Databricks: `LIMIT 100`
- Azure SQL: `TOP 100`

If you send Databricks SQL to Azure, you get SQL errors.
If you send Azure SQL syntax to Databricks, you also get errors.

## 7) Environment Variables

Backend reads env vars in `src/env.ts`.

Common:
- `PORT` (default `8787`)

Databricks:
- `DATABRICKS_HOST`
- `DATABRICKS_HTTP_PATH`
- `DATABRICKS_TOKEN`

Azure SQL:
- `AZURESQL_SERVER`
- `AZURESQL_DATABASE`
- `AZURESQL_USER`
- `AZURESQL_PASSWORD`

Where values come from:
- Local dev: `server/.env`
- Production: Azure App Settings (set by GitHub Actions secrets)

## 8) Local Run Commands

From repo root:
```bash
npm run dev:server
```

Or from `server/`:
```bash
npm run dev
```

Server URL:
- `http://localhost:8787`

## 9) Test API Without Frontend (Recommended)

Testing directly helps you learn backend faster.

Example Azure SQL request:
```bash
curl -X POST "http://localhost:8787/api/query?provider=azuresql" \
  -H "Content-Type: application/json" \
  -d "{\"sql\":\"SELECT TOP 5 * FROM dbo.Employees\"}"
```

Example Databricks request:
```bash
curl -X POST "http://localhost:8787/api/query?provider=databricks" \
  -H "Content-Type: application/json" \
  -d "{\"sql\":\"SELECT * FROM workspace.demo_db.employees LIMIT 5\"}"
```

## 10) Production Notes

- Backend serves frontend static files from `server/public`.
- Deployment workflow copies `client/dist` into `server/public`.
- Do not deploy real `.env`; use cloud app settings/secrets.

## 11) Common Errors and Meaning

- `Missing DATABRICKS_HOST`
  Databricks env vars are not loaded.
- `Azure SQL environment variables not configured`
  One or more `AZURESQL_*` vars missing.
- `...workspace.demo_db... not supported in SQL Server`
  Databricks SQL was sent to Azure SQL.

## 12) Simple Mental Model

Use this:

1. Route receives request
2. Route reads `provider` + `sql`
3. DB router picks Databricks or Azure function
4. Function executes SQL
5. JSON response goes back

That is your backend in one line:
"Receive request -> run SQL safely -> return JSON."

## 13) Deep Dive Chapter: Understanding Each File Like a Story

This chapter is intentionally detailed. Read it slowly once, then come back when needed.

### Chapter A: `src/server.ts` (The Main Door + Wiring Room)

This is the first file that runs when your backend starts.

It does 4 important jobs:
1. Creates the Express app.
2. Adds middleware (`json`, `cors`).
3. Connects route file (`/api` -> `routes.ts`).
4. Starts the HTTP server on a port.

Think of `server.ts` as your house's main electrical panel:
- It does not run SQL.
- It does not choose provider.
- It only wires modules together and opens the backend to incoming requests.

When you run `npm run dev` in server:
- `tsx watch src/server.ts` starts this file.
- Any request to `/api/*` gets forwarded to `routes.ts`.

### Chapter B: `src/routes.ts` (Reception Desk)

This file is where requests are received and interpreted.

For each route:
- It reads input from request (`req.query`, `req.body`).
- It validates required data (example: `sql` must exist for `/query`).
- It calls business logic (`runDbQuery`).
- It sends JSON response (`res.json(...)`).

Two current routes:
1. `GET /api/employees`
   Good for smoke testing with predefined SQL.
2. `POST /api/query`
   Real query endpoint where frontend sends any SQL.

`routes.ts` is not the DB layer.
It is the API contract layer.

### Chapter C: `src/provider.ts` (Default Rule Book)

This file only defines one concept: default provider.

Example:
```ts
export const DEFAULT_PROVIDER: Provider = "azuresql"
```

Why this exists:
- If frontend does not pass `?provider=...`, backend still needs a provider.
- This avoids hardcoding default in multiple files.

`routes.ts` checks request provider first.
If missing, it uses `DEFAULT_PROVIDER`.

### Chapter D: `src/db.ts` (Traffic Controller)

This file routes SQL execution to correct adapter.

Pseudo logic:
- if provider is `azuresql` -> call Azure function
- else -> call Databricks function

Why this layer is useful:
- Keeps `routes.ts` simple.
- Makes architecture scalable (you can add more providers later).
- Keeps provider switch in one place.

### Chapter E: `src/databricks.ts` (Databricks Adapter)

This file contains Databricks-only logic.

What it does:
1. Validates Databricks env vars exist.
2. Creates `DBSQLClient`.
3. Connects using host/path/token.
4. Opens session and runs SQL.
5. Fetches rows.
6. Closes operation/session/client safely.

Important design point:
- `try/catch/finally` ensures resources are closed even on errors.

### Chapter F: `src/azuresql.ts` (Azure SQL Adapter)

This file contains Azure SQL-only logic using `mssql`.

What it does:
1. Validates Azure env vars.
2. Creates connection pool once (`pool` cached in module).
3. Executes query using pool request.
4. Returns `recordset`.

Why pool reuse matters:
- Faster than reconnecting every request.
- Better for production efficiency.

### Chapter G: `src/env.ts` (Configuration Loader)

This file converts environment variables into one `ENV` object.

It loads:
- process environment
- and local `server/.env` for development

Why centralize env reading:
- One place to manage config.
- Consistent names across backend.
- Clear error behavior when vars are missing.

## 14) Recreate This Backend From Scratch (Step-by-Step Blueprint)

Use this if you need to rebuild later in a new repo.

### Step 1: Initialize server project
1. Create `server/` folder.
2. Install dependencies:
   - runtime: `express cors dotenv mssql @databricks/sql`
   - dev: `typescript tsx @types/express @types/cors @types/mssql`
3. Add scripts:
   - `dev`: `tsx watch src/server.ts`
   - `build`: `tsc -p tsconfig.json`
   - `start`: `node dist/server.js`

### Step 2: Create folder/files
Create:
- `src/server.ts`
- `src/routes.ts`
- `src/provider.ts`
- `src/db.ts`
- `src/databricks.ts`
- `src/azuresql.ts`
- `src/env.ts`

### Step 3: Build server shell
In `server.ts`:
1. create app
2. add json + cors
3. mount `/api`
4. add static serve + fallback
5. listen on port

### Step 4: Define API contract
In `routes.ts`:
1. add `/api/employees` (sample query)
2. add `/api/query` (custom SQL)
3. read `provider` and `sql`
4. return JSON success/error

### Step 5: Add provider strategy
In `provider.ts`:
1. define provider type union
2. define `DEFAULT_PROVIDER`

In `db.ts`:
1. switch by provider
2. call databricks or azuresql adapter

### Step 6: Add Databricks adapter
In `databricks.ts`:
1. validate env
2. connect with SDK
3. execute SQL
4. fetch rows
5. close resources

### Step 7: Add Azure SQL adapter
In `azuresql.ts`:
1. validate env
2. create pooled connection
3. run query
4. return recordset

### Step 8: Add env loader
In `env.ts`:
1. load `.env` for local dev
2. export typed `ENV` values

### Step 9: Verify locally
1. start server
2. call `/api/query` with curl/Postman
3. verify rows return
4. test both providers

### Step 10: Make production-ready
1. build frontend
2. copy `client/dist` -> `server/public`
3. set secrets in cloud app settings
4. run server from `dist/server.js`

## 15) Practical Learning Path (If You Are New)

Follow this order:
1. Read `src/server.ts` to understand startup.
2. Read `src/routes.ts` to understand request handling.
3. Call API with curl and observe logs.
4. Read `src/db.ts` + `src/provider.ts` to understand provider switch.
5. Read adapters (`databricks.ts`, `azuresql.ts`) last.

If you get stuck, trace one request end-to-end:
- "Which route was called?"
- "Which provider was selected?"
- "Which adapter ran?"
- "What SQL was executed?"
- "What JSON came back?"
