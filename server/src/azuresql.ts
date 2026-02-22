import sql from 'mssql'
import { ENV } from './env.js'

let pool: sql.ConnectionPool | null = null

export async function runAzureSqlQuery(query: string) {

    if (!ENV.AZURESQL_SERVER ||
        !ENV.AZURESQL_DATABASE ||
        !ENV.AZURESQL_USER ||
        !ENV.AZURESQL_PASSWORD) {
        throw new Error('Azure SQL environment variables not configured')
    }

    if (!pool) {
        pool = await sql.connect({
            server: ENV.AZURESQL_SERVER,
            database: ENV.AZURESQL_DATABASE,
            user: ENV.AZURESQL_USER,
            password: ENV.AZURESQL_PASSWORD,
            options: {
                encrypt: true,
                trustServerCertificate: false,
            },
            pool: {
                max: 10,
                min: 0,
                idleTimeoutMillis: 30000,
            },
        })
    }

    const result = await pool.request().query(query)
    return result.recordset
}