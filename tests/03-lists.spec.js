const { test, expect } = require('../fixtures/trello.fixture');

test("CREATE list", async ({ trello }) => {
  expect(trello.listId).toBeTruthy();
});
