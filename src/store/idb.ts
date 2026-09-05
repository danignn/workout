/**
 * Minimal IndexedDB wrapper for progress photos. Photos are far too large for
 * localStorage, so the blobs live here and only their metadata goes in app state.
 */
const DB_NAME = 'bloom-photos';
const STORE = 'photos';

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE)) {
          req.result.createObjectStore(STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
}

async function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(STORE, mode);
    const req = run(transaction.objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export function putPhoto(id: string, blob: Blob): Promise<IDBValidKey> {
  return tx('readwrite', (store) => store.put(blob, id));
}

export function getPhoto(id: string): Promise<Blob | undefined> {
  return tx('readonly', (store) => store.get(id) as IDBRequest<Blob | undefined>);
}

export function deletePhoto(id: string): Promise<undefined> {
  return tx('readwrite', (store) => store.delete(id) as IDBRequest<undefined>);
}

/** Wipes every stored photo. Used by "Erase everything", which must not leave
 *  orphaned image blobs sitting on the device after the metadata is gone. */
export function clearPhotos(): Promise<undefined> {
  return tx('readwrite', (store) => store.clear() as IDBRequest<undefined>);
}
