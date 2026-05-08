const { test, expect } = require('../fixtures/trello.fixture');
const { get } = require('../utils/apiClient');

test("CREATE board", async ({ trello }) => {
  expect(trello.boardId).toBeTruthy();
});

test("GET board", async ({ request, trello }) => {
  const res = await get(request, `/boards/${trello.boardId}`);
  expect(res.status()).toBe(200);
});
