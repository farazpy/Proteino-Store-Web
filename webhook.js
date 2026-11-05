import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.WEBHOOK_PORT || 9000;
const SECRET = process.env.WEBHOOK_SECRET || '';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Status check on root
app.get('/', (req, res) => {
  res.json({
    app: 'Theproteino Auto-Deploy Webhook',
    status: 'online',
    endpoint: '/update',
    method: 'POST or GET',
    timestamp: new Date().toISOString()
  });
});

// Custom endpoint /update
app.all('/update', (req, res) => {
  // If WEBHOOK_SECRET is set, verify authorization
  if (SECRET) {
    const providedSecret =
      req.headers['x-webhook-secret'] ||
      req.headers['x-hub-signature-256'] ||
      req.query.secret ||
      req.body?.secret;

    if (!providedSecret || (providedSecret !== SECRET && !providedSecret.includes(SECRET))) {
      console.warn(`[Webhook] Unauthorized request to /update from ${req.ip}`);
      return res.status(401).json({
        success: false,
        error: 'Unauthorized. Secret key missing or mismatch.'
      });
    }
  }

  const deployScript = path.resolve(__dirname, 'deploy.sh');

  if (!fs.existsSync(deployScript)) {
    console.error(`[Webhook] Error: deploy.sh not found at ${deployScript}`);
    return res.status(500).json({
      success: false,
      error: 'deploy.sh not found in root directory'
    });
  }

  console.log(`\n======================================================`);
  console.log(`[Webhook] Received trigger on /update at ${new Date().toISOString()}`);
  console.log(`[Webhook] Triggered by: ${req.ip} | User-Agent: ${req.get('user-agent') || 'unknown'}`);
  console.log(`[Webhook] Spawning: bash ${deployScript}`);
  console.log(`======================================================\n`);

  // Send fast acknowledgement back to GitHub or caller to avoid HTTP timeout
  res.status(200).json({
    success: true,
    message: 'Auto-deployment process started successfully with deploy.sh',
    triggeredAt: new Date().toISOString()
  });

  // Spawn deploy.sh asynchronously so it doesn't block the HTTP server
  const child = spawn('bash', [deployScript], {
    cwd: __dirname,
    stdio: 'inherit',
    detached: true
  });

  child.on('error', (err) => {
    console.error('[Webhook] Failed to execute deploy.sh:', err);
  });

  child.unref();
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Webhook Server] Listening on port ${PORT}`);
  console.log(`[Webhook Server] Endpoint ready: http://0.0.0.0:${PORT}/update`);
});
