---
name: Artifact API prefix routing
description: Avoid collisions between local Next.js API routes and workspace-level artifact service paths.
---

When a storefront's local API works on its development port but fails through preview, inspect the artifact service path map. In this workspace the separate API Server owns `/api`, so the storefront uses a unique prefix such as `/_book-api` and rewrites it internally to its local `/api` handlers.

**Why:** Direct localhost requests bypass the workspace router, which can hide a cross-artifact path collision until the browser preview is used.

**How to apply:** Check existing artifact service paths before adding browser API calls. Keep the storefront proxy prefix unique and verify requests through the proxied preview URL.
