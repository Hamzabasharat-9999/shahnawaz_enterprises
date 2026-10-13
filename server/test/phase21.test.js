import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';

let server;
let baseUrl;

before(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  if (!server) return;
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
});

test('health endpoint identifies Phase 21 and disables caching', async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.phase, 21);
  assert.equal(body.service, 'Shahnawaz Enterprises API');
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.ok(Number.isNaN(Date.parse(body.timestamp)) === false);
});

test('readiness endpoint returns a valid database state', async () => {
  const response = await fetch(`${baseUrl}/api/ready`);
  const body = await response.json();
  assert.ok([200, 503].includes(response.status));
  assert.equal(body.phase, 21);
  assert.equal(body.ok, response.status === 200);
  assert.ok(['connected', 'unavailable'].includes(body.database));
  assert.equal(body.database === 'connected', response.status === 200);
});

test('public company profile exposes expected identity and metadata', async () => {
  const response = await fetch(`${baseUrl}/api/company`);
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.company.name, 'Shahnawaz Enterprises');
  assert.equal(body.company.tagline, 'We Make Interiors');
  assert.ok(Array.isArray(body.company.services));
  assert.ok(body.company.services.length > 0);
  assert.equal(typeof body.meta.profileComplete, 'boolean');
  assert.ok(['company-details-pending', 'complete'].includes(body.meta.contentStatus));
});

test('security headers are present and Express signature is hidden', async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.headers.get('x-powered-by'), null);
  assert.ok(response.headers.get('x-content-type-options'));
  assert.ok(response.headers.get('x-frame-options'));
});

test('configured local frontend origin receives CORS permission', async () => {
  const response = await fetch(`${baseUrl}/api/health`, {
    headers: { Origin: 'http://localhost:5173' }
  });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('access-control-allow-origin'), 'http://localhost:5173');
});

test('untrusted origin is not granted CORS permission', async () => {
  const response = await fetch(`${baseUrl}/api/health`, {
    headers: { Origin: 'https://untrusted.invalid' }
  });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('access-control-allow-origin'), null);
});

test('unknown API route returns a controlled 404 response', async () => {
  const response = await fetch(`${baseUrl}/api/phase20-route-that-does-not-exist`);
  const body = await response.json();
  assert.equal(response.status, 404);
  assert.equal(body.message, 'The requested API route was not found.');
});

test('malformed JSON is rejected with HTTP 400', async () => {
  const response = await fetch(`${baseUrl}/api/chatbot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{"malformed":'
  });
  const body = await response.json();
  assert.equal(response.status, 400);
  assert.equal(body.message, 'Request body contains invalid JSON.');
});

test('email status endpoint reports configuration without exposing credentials', async () => {
  const response = await fetch(`${baseUrl}/api/email/status`);
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.phase, 21);
  assert.equal(typeof body.email.configured, 'boolean');
  assert.equal(typeof body.email.adminRecipientConfigured, 'boolean');
  assert.equal(Object.hasOwn(body.email, 'password'), false);
  assert.equal(Object.hasOwn(body.email, 'SMTP_PASS'), false);
});
