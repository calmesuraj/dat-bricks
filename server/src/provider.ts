export type Provider = "databricks" | "azuresql"

// Code-level default provider. Set to "azuresql" to route all calls to Azure SQL by default.
export const DEFAULT_PROVIDER: Provider = "azuresql"

