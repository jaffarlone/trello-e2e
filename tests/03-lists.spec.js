// ─────────────────────────────────────────────
// tests/03-lists.spec.js
// @functional @negative
// List CRUD — create, read, update, validate
// ─────────────────────────────────────────────
const { test, expect } = require("@playwright/test");
const { BASE_URL, PERF, auth, timedRequest } = require("../utils/api");
const { state } = require("../utils/state");

test.describe("@functional List Management", () => {

  test("@functional CREATE list on board returns 200", async ({ request }) => {
    expect(state.boardId).toBeTruthy();

    const { response, elapsed } = await timedRequest(
      request, "post",
      `/lists?${auth({ name: "Backlog", idBoard: state.boardId, pos: "top" })}`
    );

    expect(response.status()).toBe(200);
    expect(elapsed).toBeLessThan(PERF.CREATE_LIST);

    const body = await response.json();
    expect(body).toHaveProperty("id");
    expect(body).toHaveProperty("name");
    expect(body.name).toBe("Backlog");
    expect(body.idBoard).toBe(state.boardId);
    expect(body.closed).toBe(false);
    expect(body.id).toMatch(/^[a-f0-9]{24}$/);

    state.listId = body.id;
    console.log(`  ✔ List created: ${body.id} (${elapsed}ms)`);
  });

  test("@functional CREATE second list — In Progress", async ({ request }) => {
    expect(state.boardId).toBeTruthy();

    const { response, elapsed } = await timedRequest(
      request, "post",
      `/lists?${auth({ name: "In Progress", idBoard: state.boardId })}`
    );

    expect(response.status()).toBe(200);
    expect(elapsed).toBeLessThan(PERF.CREATE_LIST);

    const body = await response.json();
    expect(body.name).toBe("In Progress");
  });

  test("@functional CREATE Done list for kanban move", async ({ request }) => {
    expect(state.boardId).toBeTruthy();

    const { response } = await timedRequest(
      request, "post",
      `/lists?${auth({ name: "Done", idBoard: state.boardId })}`
    );

    expect(response.status()).toBe(200);
    const body = await response.json();
    state.doneListId = body.id;
    console.log(`  ✔ Done list created: ${body.id}`);
  });

  test("@functional GET list by ID returns correct data", async ({ request }) => {
    expect(state.listId).toBeTruthy();

    const { response, elapsed } = await timedRequest(
      request, "get", `/lists/${state.listId}?${auth()}`
    );

    expect(response.status()).toBe(200);
    expect(elapsed).toBeLessThan(PERF.GET);

    const body = await response.json();
    expect(body.id).toBe(state.listId);
    expect(body.idBoard).toBe(state.boardId);
  });

  test("@functional UPDATE list — rename to To Do", async ({ request }) => {
    expect(state.listId).toBeTruthy();

    const { response, elapsed } = await timedRequest(
      request, "put",
      `/lists/${state.listId}?${auth({ name: "To Do" })}`
    );

    expect(response.status()).toBe(200);
    expect(elapsed).toBeLessThan(PERF.UPDATE);

    const body = await response.json();
    expect(body.name).toBe("To Do");
  });

  test("@functional GET board lists — all 3 lists present", async ({ request }) => {
    expect(state.boardId).toBeTruthy();

    const { response } = await timedRequest(
      request, "get", `/boards/${state.boardId}/lists?${auth()}`
    );

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.length).toBeGreaterThanOrEqual(3);
  });

  test("@negative CREATE list without board ID returns 400", async ({ request }) => {
    const response = await request.post(
      `${BASE_URL}/lists?${auth({ name: "No Board List" })}`
    );
    expect(response.status()).toBe(400);
  });

  test("@negative CREATE list on non-existent board returns 400 or 404", async ({ request }) => {
    const response = await request.post(
      `${BASE_URL}/lists?${auth({ name: "Ghost List", idBoard: "000000000000000000000000" })}`
    );
    expect([400, 401, 404]).toContain(response.status());
  });

});
