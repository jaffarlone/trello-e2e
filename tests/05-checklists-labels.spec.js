const { test, expect } = require('../fixtures/trello.fixture');
const { post } = require('../utils/apiClient');

test("CREATE checklist", async ({ request, trello }) => {
  const res = await post(request, '/checklists', {
    idCard: trello.cardId,
    name: 'Checklist'
  });

  const data = await res.json();
  expect(data.id).toBeTruthy();
});

test("ADD checklist item", async ({ request, trello }) => {
  const checklist = await post(request, '/checklists', {
    idCard: trello.cardId,
    name: 'Checklist'
  }).then(r => r.json());

  const res = await post(
    request,
    `/checklists/${checklist.id}/checkItems`,
    { name: 'Item 1' }
  );

  expect(res.status()).toBe(200);
});
