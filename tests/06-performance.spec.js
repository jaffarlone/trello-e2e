const { test, expect } = require('../fixtures/trello.fixture');
const { get }          = require('../utils/apiClient');
const { timedRequest } = require('../utils/performance');

test.describe("@performance Performance Benchmarks", () => {

  test("GET board under 1.5s", async ({ request, trello }) => {
    const { response, elapsed } = await timedRequest(() =>
      get(request, `/boards/${trello.boardId}`)
    );
    expect(response.status()).toBe(200);
    expect(elapsed).toBeLessThan(1500);
  });

  test("GET card under 1.5s", async ({ request, trello }) => {
    const { response, elapsed } = await timedRequest(() =>
      get(request, `/cards/${trello.cardId}`)
    );
    expect(response.status()).toBe(200);
    expect(elapsed).toBeLessThan(1500);
  });

});