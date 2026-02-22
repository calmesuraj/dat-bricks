import { runQuery as runDatabricksQuery } from './databricks.js'
import { runAzureSqlQuery } from './azuresql.js'

export async function runDbQuery(
    sqlText: string,
    provider: string | undefined
) {
    if (provider === 'azuresql') {
        return runAzureSqlQuery(sqlText)
    }

    // default
    return runDatabricksQuery(sqlText)
}