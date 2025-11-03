// Database abstraction layer using IndexedDB
// This provides a file-like database interface for browser storage

import { Release } from "./mockData";

const DB_NAME = "review-process-db";
const DB_VERSION = 1;
export const STORE_RELEASES = "releases";
export const STORE_REVIEWED = "reviewed";
export const STORE_ISSUES = "issues";
export const STORE_ACTIVITY_LOG = "activityLog";
export const STORE_USERS = "users";

interface DB {
  db: IDBDatabase | null;
}

let dbInstance: DB = { db: null };

// Initialize IndexedDB
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (dbInstance.db) {
      resolve(dbInstance.db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error("Failed to open database"));
    };

    request.onsuccess = () => {
      dbInstance.db = request.result;
      resolve(dbInstance.db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORE_RELEASES)) {
        const releaseStore = db.createObjectStore(STORE_RELEASES, { keyPath: "id" });
        releaseStore.createIndex("compoundName", "compoundName", { unique: false });
        releaseStore.createIndex("createdAt", "createdAt", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_REVIEWED)) {
        db.createObjectStore(STORE_REVIEWED, { keyPath: "key" });
      }

      if (!db.objectStoreNames.contains(STORE_ISSUES)) {
        db.createObjectStore(STORE_ISSUES, { keyPath: "key" });
      }

      if (!db.objectStoreNames.contains(STORE_ACTIVITY_LOG)) {
        const activityStore = db.createObjectStore(STORE_ACTIVITY_LOG, { keyPath: "id", autoIncrement: true });
        activityStore.createIndex("releaseId", "releaseId", { unique: false });
        activityStore.createIndex("timestamp", "timestamp", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_USERS)) {
        db.createObjectStore(STORE_USERS, { keyPath: "key" });
      }
    };
  });
};

// Helper to get database
const getDB = async (): Promise<IDBDatabase> => {
  if (!dbInstance.db) {
    await initDB();
  }
  return dbInstance.db!;
};

// Releases CRUD operations
export const dbReleases = {
  // Get all releases
  getAll: async (): Promise<Release[]> => {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_RELEASES], "readonly");
      const store = transaction.objectStore(STORE_RELEASES);
      const request = store.getAll();

      request.onsuccess = () => {
        const releases = request.result as Release[];
        // Sort by createdAt descending (newest first)
        releases.sort((a, b) => {
          const timeA = new Date(a.createdAt || 0).getTime();
          const timeB = new Date(b.createdAt || 0).getTime();
          return timeB - timeA;
        });
        resolve(releases);
      };

      request.onerror = () => reject(request.error);
    });
  },

  // Get a single release by ID
  getById: async (id: string): Promise<Release | undefined> => {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_RELEASES], "readonly");
      const store = transaction.objectStore(STORE_RELEASES);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  // Save a release (create or update)
  save: async (release: Release): Promise<void> => {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_RELEASES], "readwrite");
      const store = transaction.objectStore(STORE_RELEASES);

      // Ensure createdAt exists
      const releaseWithTimestamp = {
        ...release,
        createdAt: release.createdAt || new Date().toISOString(),
      };

      const request = store.put(releaseWithTimestamp);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  // Delete a release
  delete: async (id: string): Promise<void> => {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_RELEASES], "readwrite");
      const store = transaction.objectStore(STORE_RELEASES);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },
};

// Generic key-value storage for reviewed, issues, activity log, users
const createKeyValueStore = (storeName: string) => ({
  get: async (key: string): Promise<any> => {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result?.value);
      request.onerror = () => reject(request.error);
    });
  },

  set: async (key: string, value: any): Promise<void> => {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.put({ key, value });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  delete: async (key: string): Promise<void> => {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },
});

// Export stores
export const dbReviewed = createKeyValueStore(STORE_REVIEWED);
export const dbIssues = createKeyValueStore(STORE_ISSUES);
export const dbUsers = createKeyValueStore(STORE_USERS);

// Activity log with special indexing
export const dbActivityLog = {
  add: async (activity: any): Promise<void> => {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_ACTIVITY_LOG], "readwrite");
      const store = transaction.objectStore(STORE_ACTIVITY_LOG);
      // Remove id from activity before adding (IndexedDB will auto-generate)
      const { id, ...activityWithoutId } = activity;
      const request = store.add(activityWithoutId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  getByRelease: async (releaseId: string): Promise<any[]> => {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_ACTIVITY_LOG], "readonly");
      const store = transaction.objectStore(STORE_ACTIVITY_LOG);
      const index = store.index("releaseId");
      const request = index.getAll(releaseId);

      request.onsuccess = () => {
        const activities = request.result;
        // Sort by timestamp descending
        activities.sort((a, b) => {
          const timeA = new Date(a.timestamp || 0).getTime();
          const timeB = new Date(b.timestamp || 0).getTime();
          return timeB - timeA;
        });
        resolve(activities);
      };
      request.onerror = () => reject(request.error);
    });
  },

  getAll: async (): Promise<any[]> => {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_ACTIVITY_LOG], "readonly");
      const store = transaction.objectStore(STORE_ACTIVITY_LOG);
      const request = store.getAll();

      request.onsuccess = () => {
        const activities = request.result;
        // Sort by timestamp descending
        activities.sort((a, b) => {
          const timeA = new Date(a.timestamp || 0).getTime();
          const timeB = new Date(b.timestamp || 0).getTime();
          return timeB - timeA;
        });
        resolve(activities);
      };
      request.onerror = () => reject(request.error);
    });
  },

  deleteByRelease: async (releaseId: string): Promise<void> => {
    const db = await getDB();
    return new Promise(async (resolve, reject) => {
      try {
        // Get all activities for this release
        const allActivities = await dbActivityLog.getByRelease(releaseId);

        // Delete each activity
        const transaction = db.transaction([STORE_ACTIVITY_LOG], "readwrite");
        const store = transaction.objectStore(STORE_ACTIVITY_LOG);

        const deletePromises = allActivities.map((activity) => {
          return new Promise<void>((resolve, reject) => {
            const request = store.delete(activity.id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
          });
        });

        await Promise.all(deletePromises);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
};

// Export database to JSON file
export const exportDatabase = async (): Promise<string> => {
  const releases = await dbReleases.getAll();
  const allReviewed: Record<string, any> = {};
  const allIssues: Record<string, any> = {};
  const allActivities = await dbActivityLog.getAll();
  const allUsers: Record<string, any> = {};

  // Get all reviewed keys
  const db = await getDB();
  const reviewedTransaction = db.transaction([STORE_REVIEWED], "readonly");
  const reviewedStore = reviewedTransaction.objectStore(STORE_REVIEWED);
  const reviewedRequest = reviewedStore.getAll();
  await new Promise((resolve) => {
    reviewedRequest.onsuccess = () => {
      reviewedRequest.result.forEach((item: any) => {
        allReviewed[item.key] = item.value;
      });
      resolve(undefined);
    };
  });

  // Get all issue keys
  const issueTransaction = db.transaction([STORE_ISSUES], "readonly");
  const issueStore = issueTransaction.objectStore(STORE_ISSUES);
  const issueRequest = issueStore.getAll();
  await new Promise((resolve) => {
    issueRequest.onsuccess = () => {
      issueRequest.result.forEach((item: any) => {
        allIssues[item.key] = item.value;
      });
      resolve(undefined);
    };
  });

  // Get all user keys
  const userTransaction = db.transaction([STORE_USERS], "readonly");
  const userStore = userTransaction.objectStore(STORE_USERS);
  const userRequest = userStore.getAll();
  await new Promise((resolve) => {
    userRequest.onsuccess = () => {
      userRequest.result.forEach((item: any) => {
        allUsers[item.key] = item.value;
      });
      resolve(undefined);
    };
  });

  const exportData = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    releases,
    reviewed: allReviewed,
    issues: allIssues,
    activityLog: allActivities,
    users: allUsers,
  };

  return JSON.stringify(exportData, null, 2);
};

// Import database from JSON file
export const importDatabase = async (jsonData: string): Promise<void> => {
  const data = JSON.parse(jsonData);

  // Clear existing data
  const db = await getDB();

  // Clear all stores
  const clearStore = (storeName: string) => {
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  await clearStore(STORE_RELEASES);
  await clearStore(STORE_REVIEWED);
  await clearStore(STORE_ISSUES);
  await clearStore(STORE_ACTIVITY_LOG);
  await clearStore(STORE_USERS);

  // Import releases
  if (data.releases && Array.isArray(data.releases)) {
    for (const release of data.releases) {
      await dbReleases.save(release);
    }
  }

  // Import reviewed states
  if (data.reviewed) {
    for (const [key, value] of Object.entries(data.reviewed)) {
      await dbReviewed.set(key, value);
    }
  }

  // Import issues
  if (data.issues) {
    for (const [key, value] of Object.entries(data.issues)) {
      await dbIssues.set(key, value);
    }
  }

  // Import activity log
  if (data.activityLog && Array.isArray(data.activityLog)) {
    for (const activity of data.activityLog) {
      await dbActivityLog.add(activity);
    }
  }

  // Import users
  if (data.users) {
    for (const [key, value] of Object.entries(data.users)) {
      await dbUsers.set(key, value);
    }
  }

};
