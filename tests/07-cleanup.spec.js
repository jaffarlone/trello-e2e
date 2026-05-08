// @functional
// Teardown — delete card, archive lists, delete board
// Always runs last to keep Trello account clean
// ─────────────────────────────────────────────
const { test, expect } = require("@playwright/test");
const { BASE_URL, PERF, auth, timedRequest } = require("../utils/api");
const { state, clear } = require("../utils/state");

test.describe("@functional Cleanup", () => {

  test("DELETE card", async ({ request }) => {
    if (!state.cardId) {
      return;
    }

    const { response, elapsed } = await timedRequest(
      request, "delete", `/cards/${state.cardId}?${auth()}`
    );

    expect(response.status()).toBe(200);
    expect(elapsed).toBeLessThan(PERF.DELETE);
  });

  test("VERIFY card is gone after delete", async ({ request }) => {
    if (!state.cardId) return;

    const response = await request.get(
      `${BASE_URL}/cards/${state.cardId}?${auth()}`
    );
    expect([400, 404]).toContain(response.status());
  });

  test("ARCHIVE Backlog list", async ({ request }) => {
    if (!state.listId) {
      return;
    }

    const { response, elapsed } = await timedRequest(
      request, "put",
      `/lists/${state.listId}/closed?${auth({ value: "true" })}`
    );

    expect(response.status()).toBe(200);
    expect(elapsed).toBeLessThan(PERF.DELETE);
  });

  test("ARCHIVE Done list", async ({ request }) => {
    if (!state.doneListId) {
      return;
    }

    const { response, elapsed } = await timedRequest(
      request, "put",
      `/lists/${state.doneListId}/closed?${auth({ value: "true" })}`
    );

    expect(response.status()).toBe(200);
    expect(elapsed).toBeLessThan(PERF.DELETE);
  });

  test("DELETE board — hard delete", async ({ request }) => {
    if (!state.boardId) {
      return;
    }

    const { response, elapsed } = await timedRequest(
      request, "delete", `/boards/${state.boardId}?${auth()}`
    );

    expect(response.status()).toBe(200);
    expect(elapsed).toBeLessThan(PERF.DELETE);
  });

  test("VERIFY board is gone after delete", async ({ request }) => {
    if (!state.boardId) return;

    const response = await request.get(
      `${BASE_URL}/boards/${state.boardId}?${auth()}`
    );
    expect([400, 404]).toContain(response.status());
  });

});

test.afterAll(() => {
  clear();
});
