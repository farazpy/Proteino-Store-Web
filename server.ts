import express from 'express';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { testConnection } from './src/db/mysql.ts';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Port 3000 in dev for AI Studio preview iframe; process.env.PORT (e.g. 3002) in production on VPS
const PORT = process.env.NODE_ENV === 'production'
  ? (process.env.PORT ? parseInt(process.env.PORT, 10) : 3000)
  : 3000;
const IS_DEV = process.env.NODE_ENV !== 'production';

async function startServer() {
  const app = express();

  // Test MySQL connection on startup (non-blocking)
  testConnection().then(isConnected => {
    if (!isConnected) {
      console.error('\x1b[31m[DATABASE ERROR]\x1b[0m: Connection test result:', isConnected);
    } else {
      console.log('\x1b[32m[DATABASE CONNECTED]\x1b[0m: Successfully connected to MySQL database.');
    }
  });

  // Middleware
  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Database sample route
  app.get('/api/db-status', async (req, res) => {
    const isConnected = await testConnection();
    res.json({ connected: isConnected });
  });

  if (IS_DEV) {
    const vite = await createViteServer({
      server: { middlewareMode: true, allowedHosts: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
    
    // Serve index.html for all other routes (SPA)
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const indexPath = path.resolve(__dirname, 'index.html');
        const rawHtml = fs.readFileSync(indexPath, 'utf-8');
        let template = await vite.transformIndexHtml(url, rawHtml);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer();
