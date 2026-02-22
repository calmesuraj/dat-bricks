export type Provider = 'databricks' | 'azuresql'

// Code-level provider flag for client requests and default table SQL.
export const APP_PROVIDER: Provider = 'azuresql'

export const TABLE_QUERIES: Record<Provider, Array<{ name: string; query: string }>> = {
  databricks: [
    { name: 'employees', query: 'SELECT * FROM workspace.demo_db.employees' },
    { name: 'departments', query: 'SELECT * FROM workspace.demo_db.department' },
  ],
  azuresql: [
    { name: 'employees', query: 'SELECT TOP 100 * FROM dbo.Employees' },
    { name: 'departments', query: 'SELECT TOP 100 * FROM dbo.Departments' },
  ],
}

