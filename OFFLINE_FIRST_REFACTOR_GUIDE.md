# 🧭 Offline-First Data Flow Refactor Guide  
### for Next.js + Supabase + Vercel PWA Projects

> **Purpose:**  
> This guide defines the complete strategy for refactoring an existing Next.js + Supabase + Vercel app into a fully **offline-first PWA** that synchronizes data seamlessly between the client and server.

---

## 📦 Overview

The objective is to implement a **reactive offline-first data architecture** where:

1. The app **loads instantly** from local data.  
2. **IndexedDB (via Dexie)** stores structured entities locally.  
3. **Supabase** provides authentication, real-time updates, and canonical data storage.  
4. Data is **merged, synced, and reconciled** automatically in the background.  

This architecture ensures the app feels native, supports offline usage, and maintains cross-device consistency.

---

## ⚙️ Core Refactor Steps

### 1. Initialize Local Data Layer
- Use **Dexie.js** as the IndexedDB wrapper.  
- Create dedicated stores for each entity (e.g., `users`, `projects`, `tasks`).  
- Include metadata fields:
  ```js
  { id, data, updated_at, deleted, dirty }
  ```
- Load all data from IndexedDB on app startup.

### 2. Auth Handling
- Maintain Supabase session tokens locally.  
- On startup:
  - Restore session if valid.
  - Refresh token silently if expired.
- Use `supabase.auth.onAuthStateChange()` to detect re-auth or logout.

### 3. Sync Strategy
#### Initial Sync
- On app launch, request only updated data:
  ```sql
  SELECT * FROM table WHERE updated_at > last_sync_time;
  ```
- Merge results into IndexedDB.  

#### Continuous Sync
- Queue local writes (`dirty: true`) for background sync.  
- On sync:
  - Push dirty records to Supabase.  
  - Pull recent changes.  
  - Resolve conflicts by timestamp (`last_write_wins`) or custom logic.  
- Run every 30–60 s when online.

### 4. Local-First CRUD
- All create/update/delete operations should:
  1. Write to IndexedDB immediately.  
  2. Mark the record as `dirty`.  
  3. Update UI optimistically.  
  4. Trigger background sync.

### 5. Real-Time Updates
- Subscribe to Supabase Realtime channels:
  ```js
  supabase
    .channel('projects')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' },
      payload => mergeIntoIndexedDB(payload))
    .subscribe();
  ```

### 6. Service Worker Integration
- Use Service Worker for:
  - Static asset caching (`/public` + build output).  
  - Background Sync API for queued writes.  
  - Offline request interception.

### 7. Dexie Schema Versioning
- Example:
  ```js
  db.version(2).stores({
    users: 'id, updated_at, dirty, deleted',
    projects: 'id, updated_at, dirty, deleted'
  });
  ```
- Always include:
  - **Forward migration script**
  - **Rollback migration script**

---

## 🧩 Branch & Safety Protocol

### Git Workflow
```bash
git checkout -b feature/offline-first-refactor-$(date +%Y%m%d)
```

### Commit Messages
Use clear semantic commits:
```bash
feat: implement offline-first sync with IndexedDB + Supabase
chore: add Dexie schema v2 migrations and rollback
fix: resolve merge conflict logic in local sync
docs: add offline-first architecture guide
```

### Rollback Plan
If migration fails or sync breaks:
1. Run the provided rollback migration (`dexie.downgrade()` or `db.delete()`).  
2. Revert branch:
   ```bash
   git reset --hard origin/main
   git checkout main
   ```
3. Re-run tests to confirm recovery.

---

## 🧠 Conflict Resolution Policy

| Scenario | Strategy |
|-----------|-----------|
| Both devices update same record | **Last write wins** (timestamp-based) |
| Local delete vs. server update | Prefer delete (user intent) |
| Schema mismatch | Force local migration or rebuild DB |
| Sync errors | Queue retry with exponential backoff |

---

## 🔐 Security Checklist

- Use Supabase **Row Level Security (RLS)** to isolate user data.  
- Never store secrets in client DB.  
- Use environment variables for Supabase keys.  
- Verify data integrity before writing to IndexedDB.

---

## 🧱 Folder Structure Recommendation

```
src/
 ├── app/
 │    ├── layout.tsx
 │    ├── page.tsx
 │    └── ...
 ├── lib/
 │    ├── db.ts              // Dexie setup & schema versions
 │    ├── sync.ts            // background sync logic
 │    └── auth.ts            // Supabase auth helpers
 ├── hooks/
 │    └── useSync.ts         // custom sync + realtime hook
 ├── service-worker.js       // offline cache & background sync
 └── README_OFFLINE_FIRST.md
```

---

## 🧰 Developer Checklist

- [ ] Install Dexie: `npm install dexie`  
- [ ] Register service worker in `_app.tsx`  
- [ ] Add `useSync()` hook to all CRUD modules  
- [ ] Test on Chrome, Edge, and Safari (including mobile PWAs)  
- [ ] Verify offline/online transitions  
- [ ] Run E2E tests before merge  

---

## 📈 Expected Results

| Goal | Expected Behavior |
|------|--------------------|
| **Fast startup** | UI renders from local IndexedDB instantly |
| **Offline CRUD** | Users can modify data without connection |
| **Auto-sync** | Changes propagate silently once online |
| **Conflict-safe** | No data loss on multi-device usage |
| **Cross-platform** | Works consistently on desktop & mobile PWAs |

---

## 📜 Appendix

### Useful Packages
- [`dexie`](https://www.npmjs.com/package/dexie)
- [`supabase-js`](https://supabase.com/docs)
- [`workbox`](https://developer.chrome.com/docs/workbox) for service-worker helpers

### References
- *Google Developers — Offline-First PWA Best Practices*  
- *Supabase Realtime Documentation*  
- *Dexie.js Migration Patterns*

---

**Author:**  
*AI-Generated Implementation Blueprint based on discussions with Rajeev Kumar (UID, Ahmedabad)*  
_Last updated: October 08, 2025_
