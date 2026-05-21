// load-test.js — run with: node load-test.js
// Requires: npm install autocannon

const autocannon = require('autocannon');

const BASE_URL = 'http://localhost';

async function runTest(title, url, opts = {}) {
  console.log(`\n🔫 Running: ${title}`);
  const result = await autocannon({
    url,
    connections: opts.connections || 10,
    duration:    opts.duration    || 15,
    ...opts,
  });

  console.log(`  Requests/sec: ${result.requests.average}`);
  console.log(`  Latency avg:  ${result.latency.average}ms`);
  console.log(`  Errors:       ${result.errors}`);
  console.log(`  Non-2xx:      ${result.non2xx}`);
}

async function main() {
  console.log('🎵 MusicHub Load Test');
  console.log('=====================');

  // Test 1 — Frontend
  await runTest('Frontend (static files)', `${BASE_URL}/pages/login.html`, {
    connections: 20,
    duration: 15,
  });

  // Test 2 — Auth service (login)
  await runTest('Auth Service — POST /api/auth/login', `${BASE_URL}/api/auth/login`, {
    connections: 10,
    duration: 15,
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'admin@musichub.com', password: 'password' }),
  });

  // Test 3 — Song service (list songs)
  await runTest('Song Service — GET /api/songs', `${BASE_URL}/api/songs`, {
    connections: 15,
    duration: 15,
  });

  // Test 4 — Health endpoints
  await runTest('Health Checks', `${BASE_URL}/health`, {
    connections: 5,
    duration: 10,
  });

  console.log('\n✅ Load test complete! Check Grafana at http://localhost:3001');
}

main().catch(console.error);