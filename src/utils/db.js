const DB_NAME = 'VinylPlayerDB';
const DB_VERSION = 2;
const STORE_NAME = 'songs';
const METADATA_STORE = 'metadata';

export const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains(METADATA_STORE)) {
                db.createObjectStore(METADATA_STORE);
            }
        };

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onerror = (event) => {
            reject('IndexedDB error: ' + event.target.errorCode);
        };
    });
};

export const saveTrack = async (file, name) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.add({ file, name, addedAt: Date.now() });

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject('Error saving track');
    });
};

export const getAllTracks = async () => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject('Error getting tracks');
    });
};

export const savePlaylistOrder = async (ids) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([METADATA_STORE], 'readwrite');
        const store = transaction.objectStore(METADATA_STORE);
        const request = store.put(ids, 'playlistOrder');

        request.onsuccess = () => resolve();
        request.onerror = () => reject('Error saving order');
    });
};

export const getPlaylistOrder = async () => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([METADATA_STORE], 'readonly');
        const store = transaction.objectStore(METADATA_STORE);
        const request = store.get('playlistOrder');

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject('Error getting order');
    });
};

export const deleteTrack = async (id) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME, METADATA_STORE], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = async () => {
            const orderRequest = transaction.objectStore(METADATA_STORE).get('playlistOrder');
            orderRequest.onsuccess = () => {
                const order = orderRequest.result;
                if (order) {
                    const newOrder = order.filter(trackId => trackId !== id);
                    transaction.objectStore(METADATA_STORE).put(newOrder, 'playlistOrder');
                }
                resolve();
            };
        };
        request.onerror = () => reject('Error deleting track');
    });
};

export const clearAllTracks = async () => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME, METADATA_STORE], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => {
            transaction.objectStore(METADATA_STORE).delete('playlistOrder');
            resolve();
        };
        request.onerror = () => reject('Error clearing tracks');
    });
};
