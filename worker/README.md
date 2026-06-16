# Purrmission Worker

This folder contains the planned backend for AI context checks.

## Current state

- `src/index.js` exposes `POST /analyze`.
- The endpoint currently returns deterministic mock data.
- The frontend can call this later through `window.PURRMISSION_AI_ENDPOINT`.
- `schema.sql` defines the first D1 tables for:
  - AI context cache
  - raw purchase events
  - temptation threads
  - derived user profiles

## Next implementation steps

1. Create a Cloudflare Worker project around `src/index.js`.
2. Bind a D1 database and run `schema.sql`.
3. Add OpenAI API key as a Worker secret.
4. Replace `mockAnalyze` with:
   - cache lookup
   - OpenAI structured JSON call
   - cache write
   - append-only event write
5. Add privacy controls before using profile data for advertising or third-party monetization.

## Data principle

Keep raw events append-only. Mark stale, dirty, or superseded records instead of deleting them from analytical history. Derived user profiles should be rebuilt from cleaned event subsets.
