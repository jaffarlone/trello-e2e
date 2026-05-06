// ─────────────────────────────────────────────
// utils/state.js
// Shared state object that flows through the
// full workflow: board → list → card → cleanup
// ─────────────────────────────────────────────

const state = {
  boardId:     null,
  listId:      null,
  doneListId:  null,
  cardId:      null,
  checklistId: null,
  labelId:     null,
  commentId:   null,
};

module.exports = state;
