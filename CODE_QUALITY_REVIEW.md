# Code Quality Review

## Scope
This review covers a focused pass of the current repository structure and key runtime paths in:
- `backend/`
- `frontend/`
- `backend-worker/`

## High-priority findings

 codex/review-code-quality-v776n1
1. **Input validation gaps on route parameters and query dates**
   - Several backend endpoints accepted IDs and date query parameters without strict format validation.
   - Risk: malformed input reaching database paths and inconsistent API behavior.
   - **Status:** Addressed with explicit ID/date validation in backend entry controller routes.

2. **Potential filter-expression injection risk in worker history search**
   - Worker history endpoint used a dynamic `.or(...)` expression based on unvalidated request input.
   - Risk: expression manipulation in PostgREST filter strings and unintended query behavior.
   - **Status:** Addressed by enforcing strict identifier allowlist validation before building the `.or(...)` expression.

3. **CSV formula injection risk in exported files**
   - User-controlled text fields were exported directly to CSV.
   - Risk: opening CSV in spreadsheet apps could execute formulas (`=`, `+`, `-`, `@`) from malicious values.
   - **Status:** Addressed by sanitizing exported CSV cell values before output.
=======
1. **Unsafe parsing of base64 image payloads in backend upload flow**
   - The upload code assumed regex parsing always succeeds and dereferenced `matches[1]` / `matches[2]` unconditionally.
   - Risk: malformed payloads could throw runtime errors before graceful fallback handling.
   - **Status:** Addressed by validating payload type and regex match result before use.

2. **Controller-level DB clients created duplicate connection management logic**
   - Multiple controllers created their own PostgreSQL clients and connected at module load.
   - Risk: connection lifecycle inconsistency, reduced testability, and harder maintenance.
   - **Status:** Addressed by introducing a shared pooled DB client module and reusing it across controllers.

3. **Limited automated quality gates**
   - No lint/test scripts are defined for backend and backend-worker; frontend has no lint/test scripts either.
   - Risk: regressions and inconsistent style are harder to catch automatically.
   - Recommendation: add minimum CI checks (`eslint`, unit/smoke tests, and build checks) per package.
 main

## Medium-priority findings

1. **Time zone handling is manually implemented in multiple places**
   - IST conversions are done via manual offsets/string manipulation.
   - Risk: subtle bugs around date boundaries and maintainability costs.
   - Recommendation: centralize date/time helpers or use a dedicated timezone-aware utility.

 codex/review-code-quality-v776n1
2. **Potential race condition in gate pass sequence generation**
=======
2. **Hard dependency on local certificate files for backend HTTPS startup**
   - Missing cert files will fail startup.
   - Recommendation: support HTTP fallback for local development and strict HTTPS for production.

3. **Potential race condition in gate pass sequence generation**
 main
   - Sequence uses `COUNT(*) + 1` for daily code generation.
   - Risk: duplicate values under concurrent requests.
   - Recommendation: use DB-enforced unique sequence/transactional counter.

 codex/review-code-quality-v776n1
3. **Limited automated quality gates**
   - No lint/test scripts are defined for backend and backend-worker; frontend has no lint/test scripts either.
   - Risk: regressions and inconsistent style are harder to catch automatically.
   - Recommendation: add minimum CI checks (`eslint`, unit/smoke tests, and build checks) per package.

## What was changed in this review

- Added strict parameter validation in `backend/controllers/entry.controller.js`:
  - positive integer validation for ID-based routes
  - ISO date format validation for date filters and custom export range
- Made export date-range SQL fully parameterized (removed literal interval interpolation).
- Replaced hardcoded export host URL with request-derived origin.
- Added CSV formula-injection sanitization for exported values.
- Hardened worker entry/history endpoints in `backend-worker/src/routes/entry.js`:
  - validate `vehicle_reg` and `photos` input shape
  - guard base64 parse results before dereferencing
  - validate history identifier with allowlist before `.or(...)` filter

## What was changed in this review

- Added `backend/db/client.js` as a shared PostgreSQL connection pool helper.
- Updated these controllers to use the shared DB helper instead of creating per-file clients:
  - `backend/controllers/auth.controller.js`
  - `backend/controllers/blacklist.controller.js`
  - `backend/controllers/entry.controller.js`
- Hardened entry creation validation in `backend/controllers/entry.controller.js`:
  - reject missing/non-string `vehicle_reg`
  - normalize and validate `vehicle_reg` before blacklist check and insert
  - reject non-array `photos` payloads
  - validate regex parse output for base64 image payloads
 main

## Suggested next actions

1. Add linting and test scripts in all three packages.
2. Add a uniqueness constraint and robust sequence generation for gate pass IDs.
3. Standardize timezone handling behind one utility.
