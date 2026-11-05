// server.ts
import express from "express";
import dotenv2 from "dotenv";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// src/db/mysql.ts
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();
var dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "theproteino_db"
};
var pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 1e4,
  // 10 seconds timeout
  enableKeepAlive: true,
  keepAliveInitialDelay: 1e4
});
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("Successfully connected to MySQL database.");
    connection.release();
    return true;
  } catch (error) {
    console.error("Error connecting to MySQL database:", error);
    return false;
  }
}

// server.ts
dotenv2.config();
var __dirname = path.dirname(fileURLToPath(import.meta.url));
var PORT = process.env.NODE_ENV === "production" ? process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3 : 3e3;
var IS_DEV = process.env.NODE_ENV !== "production";
async function startServer() {
  const app = express();
  testConnection().then((isConnected) => {
    if (!isConnected) {
      console.error("\x1B[31m[DATABASE ERROR]\x1B[0m: Connection test result:", isConnected);
    } else {
      console.log("\x1B[32m[DATABASE CONNECTED]\x1B[0m: Successfully connected to MySQL database.");
    }
  });
  app.use(express.json());
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app.get("/api/db-status", async (req, res) => {
    const isConnected = await testConnection();
    res.json({ connected: isConnected });
  });
  if (IS_DEV) {
    const vite = await createViteServer({
      server: { middlewareMode: true, allowedHosts: true },
      appType: "custom"
    });
    app.use(vite.middlewares);
    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const indexPath = path.resolve(__dirname, "index.html");
        const rawHtml = fs.readFileSync(indexPath, "utf-8");
        let template = await vite.transformIndexHtml(url, rawHtml);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist/index.html"));
    });
  }
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
startServer();
