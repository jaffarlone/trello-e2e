// ─────────────────────────────────────────────
// tests/01-auth.spec.js
// @functional @negative
// Validates authentication before any workflow tests run
// ─────────────────────────────────────────────
const { test, expect } = require("@playwright/test");
const { BASE_URL, API_KEY, API_TOKEN, PERF, auth, timedRequest } = require("../utils/api");

test.describe("@functional Auth Validation", () => {

  test("@negative missing API key returns 401", async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/members/me?token=${API_TOKEN}`
    );
    expect(response.status()).toBe(401);
  });

  test("@negative invalid token returns 401", async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/members/me?key=${API_KEY}&token=invalid_token_xyz`
    );
    expect(response.status()).toBe(401);
  });

  test("@functional valid credentials return member profile", async ({ request }) => {
    const { response, elapsed } = await timedRequest(
      request, "get", `/members/me?${auth()}`
    );

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty("id");
    expect(body).toHaveProperty("username");
    expect(body.id).toBeTruthy();
    expect(elapsed).toBeLessThan(PERF.GET);

    console.log(`  ✔ Authenticated as: ${body.username} (${elapsed}ms)`);
  });

  test("@functional GET /members/me returns correct schema", async ({ request }) => {
    const { response } = await timedRequest(
      request, "get", `/members/me?${auth()}`
    );
    expect(response.status()).toBe(200);

    const body = await response.json();
    // Schema checks
    expect(body).toHaveProperty("id");
    expect(body).toHaveProperty("username");
    expect(body).toHaveProperty("fullName");
    expect(body).toHaveProperty("email");
    expect(body).toHaveProperty("url");
    expect(body.id).toMatch(/^[a-f0-9]{24}$/);
  });

});
