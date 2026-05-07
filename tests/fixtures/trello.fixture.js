// fixtures/trello.fixture.js

const base = require('@playwright/test');

exports.test = base.test.extend({
  cardId: async ({ request }, use) => {
    // Create board
    const boardRes = await request.post(`/boards`, {
      params: { name: 'QA Board' }
    });
    const board = await boardRes.json();

    // Create list
    const listRes = await request.post(`/lists`, {
      params: { name: 'To Do', idBoard: board.id }
    });
    const list = await listRes.json();

    // Create card
    const cardRes = await request.post(`/cards`, {
      params: { name: 'Test Card', idList: list.id }
    });
    const card = await cardRes.json();

    await use(card.id);
  }
});

exports.expect = base.expect;