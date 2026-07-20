#!/usr/bin/env node
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const [target, ...targetArgs] = process.argv.slice(2);

if (!target) {
  console.error('Uso: node run-with-system-ca.mjs <script> [...args]');
  process.exit(1);
}

const env = { ...process.env };

if (process.platform === 'win32' && !env.NODE_EXTRA_CA_CERTS) {
  const ca = require('win-ca/api');
  const certificates = [];
  ca({ format: ca.der2.pem, ondata: (certificate) => certificates.push(certificate) });

  const caPath = resolve(tmpdir(), 'instagram-automation-windows-ca.pem');
  mkdirSync(dirname(caPath), { recursive: true });
  writeFileSync(caPath, `${certificates.join('\n')}\n`, 'utf8');
  env.NODE_EXTRA_CA_CERTS = caPath;
}

const result = spawnSync(process.execPath, [resolve(target), ...targetArgs], {
  env,
  stdio: 'inherit'
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
