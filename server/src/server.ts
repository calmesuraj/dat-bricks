import express from "express";
import cors from "cors";
import routes from "./routes.js";
import { ENV } from "./env.js";
import path from "path";
import { fileURLToPath } from "url";

process.on("unhandledRejection", (e) => {
  console.error("[UNHANDLED REJECTION]", e);
  process.exit(1);
});
process.on("uncaughtException", (e) => {
  console.error("[UNCAUGHT EXCEPTION]", e);
  process.exit(1);
});

console.log("[BOOT] ENV:", {
  PORT: ENV.PORT,
  HOST: !!ENV.DATABRICKS_HOSTNAME,
  PATH: !!ENV.DATABRICKS_HTTP_PATH,
  TOKEN: !!ENV.DATABRICKS_TOKEN,
});

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api", routes);

// Serve client build from server/public
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "../public");

app.use(express.static(publicDir));

// SPA fallback (don’t swallow /api)
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) return res.status(404).end();
  res.sendFile(path.join(publicDir, "index.html"));
});

const port = Number(ENV.PORT) || 8080;
const server = app.listen(port, () => console.log(`Listening on ${port}`));

server.on("error", (err) => {
  console.error("[SERVER LISTEN ERROR]", err);
  process.exit(1);
});