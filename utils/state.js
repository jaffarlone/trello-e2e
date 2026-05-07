// ─────────────────────────────────────────────
// utils/state.js
// Persistent state across spec files.
// Saves IDs to a temp JSON file so each spec
// file can read what the previous one created.
// ─────────────────────────────────────────────
const fs   = require("fs");
const path = require("path");

const STATE_FILE = path.join(__dirname, "..", ".state.json");

const defaults = {
  boardId:     null,
  listId:      null,
  doneListId:  null,
  cardId:      null,
  checklistId: null,
  labelId:     null,
  commentId:   null,
};

function load() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
    }
  } catch {}
  return { ...defaults };
}

function save(obj) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(obj, null, 2));
}

function clear() {
  if (fs.existsSync(STATE_FILE)) fs.unlinkSync(STATE_FILE);
}

// Proxy: any property set is immediately persisted to disk
const state = new Proxy(load(), {
  set(target, key, value) {
    target[key] = value;
    save(target);
    return true;
  },
});

module.exports = { state, clear };
