// ─────────────────────────────────────────────
// fixtures/trello.fixture.js
// ─────────────────────────────────────────────
import { test as base } from '@playwright/test';
import { post, del } from '../utils/apiClient';

export const test = base.extend({
  trello: async ({ request }, use) => {
    // Setup
    const board = await (await post(request, '/boards', { name: 'QA Board', defaultLists: 'false' })).json();
    const list  = await (await post(request, '/lists',  { name: 'To Do', idBoard: board.id })).json();
    const card  = await (await post(request, '/cards',  { name: 'QA Card', idList: list.id })).json();

    // Expose flat IDs so tests can use trello.boardId, trello.listId, trello.cardId
    // Also expose full objects as trello.board, trello.list, trello.card
    await use({
      board,   boardId: board.id,
      list,    listId:  list.id,
      card,    cardId:  card.id,
    });

    // Teardown — deleting the board removes all lists and cards under it
    await del(request, `/boards/${board.id}`);
  },
});

export { expect } from '@playwright/test';