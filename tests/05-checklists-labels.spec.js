// ─────────────────────────────────────────────
// tests/05-checklists-labels.spec.js
// @functional
// Checklist and label management on cards
// ─────────────────────────────────────────────
const { test, expect } = require("@playwright/test");
const { PERF, auth, timedRequest } = require("../utils/api");
const { state } = require("../utils/state");

const { test, expect } = require('../fixtures/trello.fixture');


test.describe("@functional Checklist Management", () => {
  test("@functional CREATE checklist on card", async ({ request, cardId }) => {
    expect(cardId).toBeTruthy();
  
    const response = await request.post(`/checklists`, {
      params: {
        idCard: cardId,
        name: 'QA Checklist'
      }
    });
  
    expect(response.status()).toBe(200);
  });
  

  test("@functional ADD checklist item — unit tests written", async ({ request }) => {
    expect(state.checklistId).toBeTruthy();

    const { response, elapsed } = await timedRequest(
      request, "post",
      `/checklists/${state.checklistId}/checkItems?${auth({
        name:    "Unit tests written",
        checked: "false",
      })}`
    );

    expect(response.status()).toBe(200);
    expect(elapsed).toBeLessThan(PERF.CREATE_CARD);

    const body = await response.json();
    expect(body.name).toBe("Unit tests written");
    expect(body.state).toBe("incomplete");
  });

  test("@functional ADD checklist item — code reviewed", async ({ request }) => {
    expect(state.checklistId).toBeTruthy();

    const { response } = await timedRequest(
      request, "post",
      `/checklists/${state.checklistId}/checkItems?${auth({ name: "Code reviewed" })}`
    );

    expect(response.status()).toBe(200);
  });

  test("@functional ADD checklist item — QA sign-off", async ({ request }) => {
    expect(state.checklistId).toBeTruthy();

    const { response } = await timedRequest(
      request, "post",
      `/checklists/${state.checklistId}/checkItems?${auth({ name: "QA sign-off" })}`
    );

    expect(response.status()).toBe(200);
  });

  test("@functional GET checklist — all items present", async ({ request }) => {
    expect(state.checklistId).toBeTruthy();

    const { response, elapsed } = await timedRequest(
      request, "get", `/checklists/${state.checklistId}?${auth()}`
    );

    expect(response.status()).toBe(200);
    expect(elapsed).toBeLessThan(PERF.GET);

    const body = await response.json();
    expect(body.checkItems.length).toBeGreaterThanOrEqual(3);
  });

});

test.describe("@functional Label Management", () => {

  test("@functional CREATE label on board", async ({ request }) => {
    expect(state.boardId).toBeTruthy();

    const { response, elapsed } = await timedRequest(
      request, "post",
      `/labels?${auth({ name: "High Priority", color: "red", idBoard: state.boardId })}`
    );

    expect(response.status()).toBe(200);
    expect(elapsed).toBeLessThan(PERF.CREATE_CARD);

    const body = await response.json();
    expect(body.name).toBe("High Priority");
    expect(body.color).toBe("red");
    expect(body.idBoard).toBe(state.boardId);

    state.labelId = body.id;
    console.log(`  ✔ Label created: ${body.id}`);
  });

  test("@functional APPLY label to card", async ({ request }) => {
    expect(state.cardId).toBeTruthy();
    expect(state.labelId).toBeTruthy();

    const { response, elapsed } = await timedRequest(
      request, "post",
      `/cards/${state.cardId}/idLabels?${auth({ value: state.labelId })}`
    );

    expect(response.status()).toBe(200);
    expect(elapsed).toBeLessThan(PERF.CREATE_CARD);
  });

  test("@functional VERIFY label is attached to card", async ({ request }) => {
    expect(state.cardId).toBeTruthy();

    const { response } = await timedRequest(
      request, "get", `/cards/${state.cardId}?${auth()}`
    );

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.idLabels).toContain(state.labelId);
  });

});
