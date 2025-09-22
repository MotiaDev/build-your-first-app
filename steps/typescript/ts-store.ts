// steps/typescript/ts-store.ts
import fs from "node:fs";
import path from "node:path";

export type Pet = {
  id: string;
  name: string;
  species: "dog" | "cat" | "bird" | "other";
  ageMonths: number;
  status: "new" | "available" | "pending" | "adopted";
  createdAt: number;
  updatedAt: number;
};

const DATA_DIR = path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "pets.json");

type DbShape = { seq: number; pets: Record<string, Pet> };

function ensureFile(): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(FILE)) {
    const init: DbShape = { seq: 1, pets: {} };
    fs.writeFileSync(FILE, JSON.stringify(init));
  }
}
function load(): DbShape {
  ensureFile();
  return JSON.parse(fs.readFileSync(FILE, "utf8")) as DbShape;
}
function save(db: DbShape): void {
  fs.writeFileSync(FILE, JSON.stringify(db));
}
const now = () => Date.now();

export const TSStore = {
  create(input: { name: string; species: Pet["species"]; ageMonths: number }): Pet {
    const db = load();
    const id = String(db.seq++);
    const pet: Pet = {
      id,
      name: input.name.trim(),
      species: input.species,
      ageMonths: Math.max(0, Math.floor(input.ageMonths)),
      status: "new",
      createdAt: now(),
      updatedAt: now(),
    };
    db.pets[id] = pet;
    save(db);
    return pet;
  },
  list(): Pet[] {
    const db = load();
    return Object.values(db.pets).sort((a, b) => b.updatedAt - a.updatedAt);
  },
  get(id: string): Pet | null {
    const db = load();
    return db.pets[id] ?? null;
  },
  update(id: string, patch: Partial<Omit<Pet, "id" | "createdAt">>): Pet | null {
    const db = load();
    const cur = db.pets[id];
    if (!cur) return null;
    const next: Pet = {
      ...cur,
      ...patch,
      name: typeof patch.name === "string" ? patch.name.trim() : cur.name,
      ageMonths:
        typeof patch.ageMonths === "number"
          ? Math.max(0, Math.floor(patch.ageMonths))
          : cur.ageMonths,
      updatedAt: now(),
    };
    db.pets[id] = next;
    save(db);
    return next;
  },
  remove(id: string): boolean {
    const db = load();
    if (!db.pets[id]) return false;
    delete db.pets[id];
    save(db);
    return true;
  },
};
