const { test, expect } = require('../fixtures/trello.fixture');
const { get } = require('../utils/apiClient');

test("CREATE card", async ({ trello }) => {
  expect(trello.cardId).toBeTruthy();
});

test("GET card", async ({ request, trello }) => {
  const res = await get(request, `/cards/${trello.cardId}`);
  expect(res.status()).toBe(200);
});
