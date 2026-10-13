---
name: Next.js in a Vite artifact
description: A Next.js App Router scaffold can run in a web artifact created from the React/Vite template, with one router-layout conflict to avoid.
---

When adapting the generated web artifact to Next.js, the starter may leave `src/pages` behind. Next.js rejects a root-level `app/` together with `src/pages/`; place both Next routers under `src/`, or remove the unused starter pages directory if keeping `app/` at the artifact root.

**Why:** The artifact bootstrap can leave template source files that Next.js still detects even after the Vite app is no longer used.

**How to apply:** Before starting Next.js, inspect for both `app/` and `src/pages/` and choose one consistent router layout.
