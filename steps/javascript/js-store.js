// steps/javascript/js-store.js
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), '.data');
const FILE = path.join(DATA_DIR, 'pets.json');

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(FILE)) {
    const init = { seq: 1, pets: {} };
    fs.writeFileSync(FILE, JSON.stringify(init));
  }
}

function load() {
  ensureFile();
  return JSON.parse(fs.readFileSync(FILE, 'utf8'));
}

function save(db) {
  fs.writeFileSync(FILE, JSON.stringify(db));
}

const now = () => Date.now();

function create({ name, species, ageMonths }) {
  const db = load();
  const id = String(db.seq++);
  const pet = {
    id,
    name: String(name).trim(),
    species,
    ageMonths: Math.max(0, Math.floor(Number(ageMonths))),
    status: 'available',
    createdAt: now(),
    updatedAt: now()
  };
  db.pets[id] = pet;
  save(db);
  return pet;
}

function list() {
  const db = load();
  return Object.values(db.pets).sort((a, b) => b.updatedAt - a.updatedAt);
}

function get(id) {
  const db = load();
  return db.pets[id] || null;
}

function update(id, patch) {
  const db = load();
  const cur = db.pets[id];
  if (!cur) return null;
  const next = {
    ...cur,
    ...patch,
    name: typeof patch.name === 'string' ? patch.name.trim() : cur.name,
    ageMonths: typeof patch.ageMonths === 'number'
      ? Math.max(0, Math.floor(patch.ageMonths)) : cur.ageMonths,
    updatedAt: now()
  };
  db.pets[id] = next;
  save(db);
  return next;
}

function remove(id) {
  const db = load();
  if (!db.pets[id]) return false;
  delete db.pets[id];
  save(db);
  return true;
}

module.exports = { create, list, get, update, remove };
