import express from "express";
import { runQuery } from "./databricks.js";

const router = express.Router();

router.get("/health", (_req, res) => res.json({ ok: true }));

router.get("/employees", async (_req, res) => {
  try {
    const rows = await runQuery("SELECT * FROM workspace.demo_db.employees LIMIT 100");
    res.json({ rows });
  } catch (e: any) {
    console.error("[EMPLOYEES ERROR]", e);
    res.status(500).json({ error: e?.message || "Internal Server Error" });
  }
});

router.post("/query", async (req, res) => {
  try {
    const { sql } = req.body as { sql?: string };
    if (!sql) return res.status(400).json({ error: "SQL query is required" });

    const rows = await runQuery(sql);
    res.json({ rows });
  } catch (e: any) {
    console.error("[QUERY ERROR]", e);
    res.status(500).json({ error: e?.message || "Failed to execute query" });
  }
});

export default router;