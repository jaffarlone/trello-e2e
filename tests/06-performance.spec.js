// ─────────────────────────────────────────────
// tests/06-performance.spec.js
// @performance
// Response time benchmarks and concurrency tests
// ─────────────────────────────────────────────
const { test, expect, request } = require("@playwright/test");
const { BASE_URL, PERF, auth, timedRequest } = require("../utils/api");
const state = require("../utils/state");

test.describe("@performance Performance Benchmarks", () => {

  test("@performance GET /members/me — under 1.5s", async ({ request }) => {
    const { response, elapsed } = await timedRequest(
      request, "get", `/members/me?${auth()}`
    );
    expect(response.status()).toBe(200);
    expect(elapsed).toBeLessThan(PERF.GET);
    console.log(`  ✔ GET /members/me: ${elapsed}ms`);
  });

  test("@performance GET board — under 1.5s", async ({ request }) => {
    expect(state.boardId).toBeTruthy();

    const { response, elapsed } = await timedRequest(
      request, "get", `/boards/${state.boardId}?${auth()}`
    );
    expect(response.status()).toBe(200);
    expect(elapsed).toBeLessThan(PERF.GET);
    console.log(`  ✔ GET /boards: ${elapsed}ms`);
  });

  test("@performance GET card — under 1.5s", async ({ request }) => {
    expect(state.cardId).toBeTruthy();

    const { response, elapsed } = await timedRequest(
      request, "get", `/cards/${state.cardId}?${auth()}`
    );
    expect(response.status()).toBe(200);
    expect(elapsed).toBeLessThan(PERF.GET);
    console.log(`  ✔ GET /cards: ${elapsed}ms`);
  });

  test("@performance 10 concurrent GET board requests — all under 3s", async () => {
    expect(state.boardId).toBeTruthy();
    const ctx = await request.newContext();

    const requests = Array.from({ length: 10 }, () =>
      timedRequest(ctx, "get", `/boards/${state.boardId}?${auth()}`)
    );

    const results = await Promise.all(requests);
    const times   = results.map(r => r.elapsed);
    const avg     = times.reduce((a, b) => a + b, 0) / times.length;
    const max     = Math.max(...times);
    const min     = Math.min(...times);

    for (const { response, elapsed } of results) {
      expect(response.status()).toBe(200);
      expect(elapsed).toBeLessThan(3000);
    }

    console.log(`  ✔ Concurrent GETs — avg: ${avg.toFixed(0)}ms | min: ${min}ms | max: ${max}ms`);
    await ctx.dispose();
  });

  test("@performance sequential card creation — 3 cards each under threshold", async () => {
    expect(state.listId).toBeTruthy();
    const ctx   = await request.newContext();
    const times = [];

    for (let i = 1; i <= 3; i++) {
      const { response, elapsed } = await timedRequest(
        ctx, "post",
        `/cards?${auth({ idList: state.listId, name: `Perf Test Card ${i}` })}`
      );
      expect(response.status()).toBe(200);
      expect(elapsed).toBeLessThan(PERF.CREATE_CARD);
      times.push(elapsed);

      // clean up immediately
      const body = await response.json();
      await ctx.delete(`${BASE_URL}/cards/${body.id}?${auth()}`);
    }

    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    console.log(`  ✔ Avg card creation: ${avg.toFixed(0)}ms | times: [${times.join(", ")}]ms`);
    await ctx.dispose();
  });

  test("@performance rate limit — rapid requests return 200 or 429 (never 500)", async () => {
    const ctx = await request.newContext();

    const requests  = Array.from({ length: 15 }, () =>
      ctx.get(`${BASE_URL}/members/me?${auth()}`)
    );
    const responses = await Promise.all(requests);
    const statuses  = responses.map(r => r.status());
    const hits429   = statuses.filter(s => s === 429).length;

    for (const status of statuses) {
      expect([200, 429]).toContain(status);
    }

    console.log(`  ✔ 15 rapid requests — 200s: ${statuses.filter(s => s === 200).length} | 429s: ${hits429}`);
    await ctx.dispose();
  });

});
