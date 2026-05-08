// ─────────────────────────────────────────────
// utils/apiClient.js
// Thin wrappers around Playwright request that
// automatically append Trello auth params.
// ─────────────────────────────────────────────
require('dotenv').config();

const BASE_URL  = 'https://api.trello.com/1';
const API_KEY   = process.env.TRELLO_API_KEY;
const API_TOKEN = process.env.TRELLO_API_TOKEN;

function authParams(extra = {}) {
  return new URLSearchParams({ key: API_KEY, token: API_TOKEN, ...extra }).toString();
}

async function post(request, path, params = {}) {
  return request.post(`${BASE_URL}${path}?${authParams(params)}`);
}

async function get(request, path, params = {}) {
  return request.get(`${BASE_URL}${path}?${authParams(params)}`);
}

async function put(request, path, params = {}) {
  return request.put(`${BASE_URL}${path}?${authParams(params)}`);
}

async function del(request, path, params = {}) {
  return request.delete(`${BASE_URL}${path}?${authParams(params)}`);
}

module.exports = { post, get, put, del };