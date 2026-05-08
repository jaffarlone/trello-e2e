// ─────────────────────────────────────────────
// utils/performance.js
// Wraps any async call and returns { response, elapsed }
// ─────────────────────────────────────────────
async function timedRequest(fn) {
  const start    = Date.now();
  const response = await fn();
  const elapsed  = Date.now() - start;
  return { response, elapsed };
}

module.exports = { timedRequest };