// ─────────────────────────────────────────────
// tests/02-boards.spec.js
// @functional @negative @performance
// Board CRUD — create, read, update, validate
// ─────────────────────────────────────────────
const { test, expect } = require("@playwright/test");
const { BASE_URL, PERF, auth, timedRequest } = require("../utils/api");
const { state } = require("../utils/state");

test.describe("@functional Board Management", () => {

  test("@functional CREATE board returns 200 with correct schema", async ({ request }) => {
    const boardName = `E2E Test Board — ${Date.now()}`;

    const { response, elapsed } = await timedRequest(
      request, "post",
      `/boards?${auth({ name: boardName, defaultLists: "false", desc: "Automated E2E test board" })}`
    );

    expect(response.status()).toBe(200);
    expect(elapsed).toBeLessThan(PERF.CREATE_BOARD);

    const body = await response.json();
    expect(body).toHaveProperty("id");
    expect(body).toHaveProperty("name");
    expect(body).toHaveProperty("url");
    expect(body).toHaveProperty("closed");
    expect(body).toHaveProperty("prefs");
    expect(body.name).toBe(boardName);
    expect(body.closed).toBe(false);
    expect(body.id).toMatch(/^[a-f0-9]{24}$/);

    state.boardId = body.id;
    console.log(`  ✔ Board created: ${body.id} (${elapsed}ms)`);
  });

  test("@functional GET board returns correct data", async ({ request }) => {
    expect(state.boardId).toBeTruthy();

    const { response, elapsed } = await timedRequest(
      request, "get", `/boards/${state.boardId}?${auth()}`
    );

    expect(response.status()).toBe(200);
    expect(elapsed).toBeLessThan(PERF.GET);

    const body = await response.json();
    expect(body.id).toBe(state.boardId);
    expect(body.closed).toBe(false);
    expect(body).toHaveProperty("prefs");
  });

  test("@functional GET board — specific field (name)", async ({ request }) => {
    expect(state.boardId).toBeTruthy();

    const { response, elapsed } = await timedRequest(
      request, "get", `/boards/${state.boardId}/name?${auth()}`
    );

    expect(response.status()).toBe(200);
    expect(elapsed).toBeLessThan(PERF.GET);

    const body = await response.json();
    expect(body).toHaveProperty("_value");
  });

  test("@functional UPDATE board — rename and new description", async ({ request }) => {
    expect(state.boardId).toBeTruthy();
    const updatedName = `E2E Board (Updated) — ${Date.now()}`;

    const { response, elapsed } = await timedRequest(
      request, "put",
      `/boards/${state.boardId}?${auth({ name: updatedName, desc: "Updated by E2E suite" })}`
    );

    expect(response.status()).toBe(200);
    expect(elapsed).toBeLessThan(PERF.UPDATE);

    const body = await response.json();
    expect(body.name).toBe(updatedName);
    expect(body.desc).toBe("Updated by E2E suite");
  });

  test("@functional GET board lists — returns array", async ({ request }) => {
    expect(state.boardId).toBeTruthy();

    const { response, elapsed } = await timedRequest(
      request, "get", `/boards/${state.boardId}/lists?${auth()}`
    );

    expect(response.status()).toBe(200);
    expect(elapsed).toBeLessThan(PERF.GET);

    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test("@negative GET board with invalid ID returns 400 or 404", async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/boards/invalid_id_xyz?${auth()}`
    );
    expect([400, 404]).toContain(response.status());
  });

  test("@negative GET non-existent board returns 400 or 404", async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/boards/000000000000000000000000?${auth()}`
    );
    expect([400, 404]).toContain(response.status());
  });

  test("@negative CREATE board without name returns 400", async ({ request }) => {
    const response = await request.post(
      `${BASE_URL}/boards?${auth({ defaultLists: "false" })}`
    );
    expect(response.status()).toBe(400);
  });

});
