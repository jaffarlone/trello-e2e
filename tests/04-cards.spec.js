// ─────────────────────────────────────────────
// tests/04-cards.spec.js
// @functional @negative
// Card CRUD — create, read, update, comment, move
// ─────────────────────────────────────────────
const { test, expect } = require("@playwright/test");
const { BASE_URL, PERF, auth, timedRequest } = require("../utils/api");
// const { state } = require("../utils/state");

let state = {};

test.beforeAll(async ({ request }) => {
  // Create board
  const board = await request.post(`/boards`, {
    params: { name: 'QA Board' }
  });
  const boardData = await board.json();
  state.boardId = boardData.id;

  // Create list
  const list = await request.post(`/lists`, {
    params: { name: 'To Do', idBoard: state.boardId }
  });
  const listData = await list.json();
  state.listId = listData.id;
});

test.describe("@functional Card Management", () => {

  test("@functional CREATE card in list returns 200 with full schema", async ({ request }) => {
    expect(state.listId).toBeTruthy();

    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const { response, elapsed } = await timedRequest(
      request, "post",
      `/cards?${auth({
        idList: state.listId,
        name:   "E2E Test Task",
        desc:   "Created by automated E2E test suite",
        due:    dueDate,
        pos:    "top",
      })}`
    );

    expect(response.status()).toBe(200);
    expect(elapsed).toBeLessThan(PERF.CREATE_CARD);

    const body = await response.json();
    // Full schema validation
    expect(body).toHaveProperty("id");
    expect(body).toHaveProperty("name");
    expect(body).toHaveProperty("desc");
    expect(body).toHaveProperty("idList");
    expect(body).toHaveProperty("idBoard");
    expect(body).toHaveProperty("due");
    expect(body).toHaveProperty("badges");
    expect(body).toHaveProperty("url");
    expect(body).toHaveProperty("shortUrl");
    expect(body.name).toBe("E2E Test Task");
    expect(body.desc).toBe("Created by automated E2E test suite");
    expect(body.idList).toBe(state.listId);
    expect(body.idBoard).toBe(state.boardId);
    expect(body.closed).toBe(false);
    expect(body.id).toMatch(/^[a-f0-9]{24}$/);

    state.cardId = body.id;
    console.log(`  ✔ Card created: ${body.id} (${elapsed}ms)`);
  });

  test("@functional GET card by ID returns correct data", async ({ request }) => {
    expect(state.cardId).toBeTruthy();

    const { response, elapsed } = await timedRequest(
      request, "get", `/cards/${state.cardId}?${auth()}`
    );

    expect(response.status()).toBe(200);
    expect(elapsed).toBeLessThan(PERF.GET);

    const body = await response.json();
    expect(body.id).toBe(state.cardId);
    expect(body.name).toBe("E2E Test Task");
  });

  test("@functional GET card specific field (name)", async ({ request }) => {
    expect(state.cardId).toBeTruthy();

    const { response, elapsed } = await timedRequest(
      request, "get", `/cards/${state.cardId}/name?${auth()}`
    );

    expect(response.status()).toBe(200);
    expect(elapsed).toBeLessThan(PERF.GET);
  });

  test("@functional UPDATE card — rename, new desc, mark due complete", async ({ request }) => {
    expect(state.cardId).toBeTruthy();

    const { response, elapsed } = await timedRequest(
      request, "put",
      `/cards/${state.cardId}?${auth({
        name:        "E2E Test Task (Updated)",
        desc:        "Updated by automated E2E test suite",
        dueComplete: "true",
      })}`
    );

    expect(response.status()).toBe(200);
    expect(elapsed).toBeLessThan(PERF.UPDATE);

    const body = await response.json();
    expect(body.name).toBe("E2E Test Task (Updated)");
    expect(body.desc).toBe("Updated by automated E2E test suite");
    expect(body.dueComplete).toBe(true);
  });

  test("@functional ADD comment to card", async ({ request }) => {
    expect(state.cardId).toBeTruthy();

    const { response, elapsed } = await timedRequest(
      request, "post",
      `/cards/${state.cardId}/actions/comments?${auth({ text: "E2E automated comment ✅" })}`
    );

    expect(response.status()).toBe(200);
    expect(elapsed).toBeLessThan(PERF.CREATE_CARD);

    const body = await response.json();
    expect(body).toHaveProperty("id");
    expect(body.type).toBe("commentCard");
    expect(body.data.text).toBe("E2E automated comment ✅");

    state.commentId = body.id;
  });

  test("@functional GET card actions — comment appears", async ({ request }) => {
    expect(state.cardId).toBeTruthy();

    const { response, elapsed } = await timedRequest(
      request, "get", `/cards/${state.cardId}/actions?${auth({ filter: "commentCard" })}`
    );

    expect(response.status()).toBe(200);
    expect(elapsed).toBeLessThan(PERF.GET);

    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
    expect(body[0].type).toBe("commentCard");
  });

  test("@functional MOVE card to Done list (kanban)", async ({ request }) => {
    expect(state.cardId).toBeTruthy();
    expect(state.doneListId).toBeTruthy();

    const { response, elapsed } = await timedRequest(
      request, "put",
      `/cards/${state.cardId}?${auth({ idList: state.doneListId })}`
    );

    expect(response.status()).toBe(200);
    expect(elapsed).toBeLessThan(PERF.UPDATE);

    const body = await response.json();
    expect(body.idList).toBe(state.doneListId);
  });

  test("@functional VERIFY card is in Done list after move", async ({ request }) => {
    expect(state.cardId).toBeTruthy();

    const { response } = await timedRequest(
      request, "get", `/cards/${state.cardId}?${auth()}`
    );

    const body = await response.json();
    expect(body.idList).toBe(state.doneListId);
  });

  test("@negative CREATE card with empty name — Trello returns 200 with blank name", async ({ request }) => {
    // Trello does NOT reject empty card names — it creates an untitled card
    // This test documents the actual API behavior and cleans up immediately
    const response = await request.post(
      `${BASE_URL}/cards?${auth({ idList: state.listId, name: "" })}`
    );
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty("id");
    expect(body.name).toBe("");

    // clean up the untitled card immediately
    await request.delete(`${BASE_URL}/cards/${body.id}?${auth()}`);
  });

  test("@negative CREATE card without list ID returns 400", async ({ request }) => {
    const response = await request.post(
      `${BASE_URL}/cards?${auth({ name: "No List Card" })}`
    );
    expect(response.status()).toBe(400);
  });

  test("@negative GET card with invalid ID returns 400 or 404", async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/cards/invalid_id_xyz?${auth()}`
    );
    expect([400, 404]).toContain(response.status());
  });

  test("@negative GET non-existent card returns 400 or 404", async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/cards/000000000000000000000000?${auth()}`
    );
    expect([400, 404]).toContain(response.status());
  });

});