// ─────────────────────────────────────────────
// utils/api.js
// Shared helpers for Trello API tests
// ─────────────────────────────────────────────
require("dotenv").config();

const BASE_URL  = "https://api.trello.com/1";
const API_KEY   = process.env.TRELLO_API_KEY;
const API_TOKEN = process.env.TRELLO_API_TOKEN;

// Performance thresholds in milliseconds
const PERF = {
  CREATE_BOARD: 3000,
  CREATE_LIST:  2000,
  CREATE_CARD:  2000,
  UPDATE:       2000,
  GET:          1500,
  DELETE:       2000,
};

/**
 * Build authenticated query string
 * @param {object} extra - additional query params
 * @returns {string} - URL-encoded query string
 */
function auth(extra = {}) {
  if (!API_KEY || !API_TOKEN) {
    throw new Error(
      "Missing TRELLO_API_KEY or TRELLO_API_TOKEN in .env file.\n" +
      "See .env.example for setup instructions."
    );
  }
  return new URLSearchParams({ key: API_KEY, token: API_TOKEN, ...extra }).toString();
}

/**
 * Timed API request — measures response time for performance assertions
 * @param {object} context - Playwright request context
 * @param {string} method  - HTTP method (get, post, put, delete)
 * @param {string} path    - API path (e.g. /boards/123)
 * @param {object} options - Playwright request options
 * @returns {{ response, elapsed }} 
 */
async function timedRequest(context, method, path, options = {}) {
  const start    = Date.now();
  const response = await context[method](`${BASE_URL}${path}`, options);
  const elapsed  = Date.now() - start;
  return { response, elapsed };
}

/**
 * Assert response time is within threshold and log result
 * @param {number} elapsed   - actual elapsed ms
 * @param {number} threshold - max allowed ms
 * @param {string} label     - label for console output
 */
function assertPerf(elapsed, threshold, label) {
  const status = elapsed < threshold ? "✔" : "✘";
  console.log(`  ${status} ${label}: ${elapsed}ms (limit: ${threshold}ms)`);
  return elapsed < threshold;
}

module.exports = { BASE_URL, API_KEY, API_TOKEN, PERF, auth, timedRequest, assertPerf };
