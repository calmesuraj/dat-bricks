import "dotenv/config";

function optional(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim() ? v : undefined;
}

export const ENV = {
  DATABRICKS_HOSTNAME: optional("DATABRICKS_HOST"),
  DATABRICKS_HTTP_PATH: optional("DATABRICKS_HTTP_PATH"),
  DATABRICKS_TOKEN: optional("DATABRICKS_TOKEN"),
  PORT: process.env.PORT || "8080",
};

// Throw only when you actually need DB settings
export function requireDatabricksEnv() {
  if (!ENV.DATABRICKS_HOSTNAME) throw new Error("Missing environment variable: DATABRICKS_HOST");
  if (!ENV.DATABRICKS_HTTP_PATH) throw new Error("Missing environment variable: DATABRICKS_HTTP_PATH");
  if (!ENV.DATABRICKS_TOKEN) throw new Error("Missing environment variable: DATABRICKS_TOKEN");
  return {
    host: ENV.DATABRICKS_HOSTNAME,
    path: ENV.DATABRICKS_HTTP_PATH,
    token: ENV.DATABRICKS_TOKEN,
  };
}