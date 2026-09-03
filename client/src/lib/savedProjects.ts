export type SavedProjectKind = "wireframe" | "sitemap";

export type SavedProject<T> = {
  id: string;
  kind: SavedProjectKind;
  name: string;
  data: T;
  createdAt: number;
  updatedAt: number;
};

const DATABASE_NAME = "adster-toolbox-saved-projects";
const DATABASE_VERSION = 1;
const STORE_NAME = "projects";

function openDatabase(): Promise<IDBDatabase> {
  if (!globalThis.indexedDB) {
    return Promise.reject(new Error("IndexedDB is unavailable in this browser."));
  }

  return new Promise((resolve, reject) => {
    const request = globalThis.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onerror = () => reject(request.error ?? new Error("Could not open local project storage."));
    request.onupgradeneeded = () => {
      const database = request.result;
      const store = database.objectStoreNames.contains(STORE_NAME)
        ? request.transaction?.objectStore(STORE_NAME)
        : database.createObjectStore(STORE_NAME, { keyPath: "id" });
      if (store && !store.indexNames.contains("kind")) {
        store.createIndex("kind", "kind", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
  });
}

function newProjectId(kind: SavedProjectKind) {
  const suffix = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
  return `${kind}-${suffix}`;
}

export function normalizeProjectName(value: string, fallback: string) {
  return value.trim().replace(/\s+/g, " ") || fallback;
}

export function createSavedProject<T>(kind: SavedProjectKind, name: string, data: T, now = Date.now()): SavedProject<T> {
  return {
    id: newProjectId(kind),
    kind,
    name: normalizeProjectName(name, `Untitled ${kind}`),
    data,
    createdAt: now,
    updatedAt: now,
  };
}

export function sortSavedProjects<T>(projects: SavedProject<T>[]) {
  return [...projects].sort((left, right) => right.updatedAt - left.updatedAt || left.name.localeCompare(right.name));
}

export function cloneSavedProjectData<T>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T;
}

export async function listSavedProjects<T>(kind: SavedProjectKind): Promise<SavedProject<T>[]> {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.index("kind").getAll(IDBKeyRange.only(kind));
    const projects = await new Promise<SavedProject<T>[]>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result as SavedProject<T>[]);
      request.onerror = () => reject(request.error ?? new Error("Could not read saved projects."));
    });
    return sortSavedProjects(projects);
  } finally {
    database.close();
  }
}

export async function saveSavedProject<T>(project: SavedProject<T>): Promise<void> {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    const request = transaction.objectStore(STORE_NAME).put(project);
    await new Promise<void>((resolve, reject) => {
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error ?? new Error("Could not save this project."));
    });
  } finally {
    database.close();
  }
}

export async function deleteSavedProject(id: string): Promise<void> {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    const request = transaction.objectStore(STORE_NAME).delete(id);
    await new Promise<void>((resolve, reject) => {
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error ?? new Error("Could not delete this project."));
    });
  } finally {
    database.close();
  }
}
