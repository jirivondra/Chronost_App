# Postman collection sync

Keeps the Postman collection in [chronos_postman_colection](https://github.com/jirivondra/chronos_postman_colection) in sync with the API's OpenAPI spec, without ever overwriting hand-written test scripts or unrelated requests (e.g. the `Errors` folder).

## Flow

```mermaid
sequenceDiagram
    actor Dev as Developer
    participant App as Chronost_App (main)
    participant CI as postman-sync workflow
    participant Repo as chronos_postman_colection
    actor Rev as Reviewer

    Dev->>App: Merge PR touching api/main.py
    App->>CI: Trigger (push to main, paths: api/main.py)
    CI->>CI: export_openapi.py -> openapi.json
    CI->>CI: validate_examples.py (Pydantic model examples still valid)
    CI->>CI: generate.js -> one skeleton file per endpoint
    CI->>Repo: Checkout (scripts/, sync-manifest.json, collections/*.json)
    CI->>CI: compose.js (skeletons + scripts + manifest -> new collection.json)
    CI->>CI: check-missing-scripts.js -> checklist
    CI->>CI: start API locally, run newman against the composed collection
    CI->>CI: summarize-newman.js -> collection run summary
    CI->>Repo: Open PR (branch sync/openapi-update, body = checklist + run summary)
    Repo-->>Rev: PR with updated collection + checklist + run results
    Rev->>Repo: Review & merge (or add missing scripts/manifest entries first)
```

If the live collection run fails, the PR still opens (so the diff is visible), but the workflow run itself is marked failed so it doesn't go unnoticed.

## Files

- `generate.js` — converts the exported OpenAPI spec into one skeleton request per endpoint (`<method>_<path>.json`), using the spec's `example` values (set via `model_config` on the Pydantic models in `api/main.py`) so a freshly wired-up request is directly usable, not full of `<string>` placeholders.
- `compose.js` — for each request name listed in the target repo's `sync-manifest.json`, syncs only `method` and the URL's path segments (translated into this collection's `{{param}}`-in-path convention) from the matching skeleton, and re-attaches the `prerequest`/`test` scripts from `scripts/<key>.js`. Everything else — `header`, `body`, and any request/folder not listed in the manifest — is left untouched.
- `check-missing-scripts.js` — flags endpoints with no manifest entry yet (no request wired up), no script file yet, or whose example `body` fields have drifted from the spec's (missing a field that's now in the spec, or still sending one that's gone); the result becomes part of the PR body. It never changes `body` or scripts itself, since a field being "missing" can be intentional (e.g. a partial-update example) — a human always decides.
- `summarize-newman.js` — turns the JSON report from running the composed collection (via `newman`) against a live local instance of the API into a short pass/fail summary, appended to the PR body. This is the one check that verifies the collection actually _behaves_ correctly, not just that its shape matches the spec.
- `canonical-key.js` — shared `<method>_<path>` key derivation used by both `generate.js` and `compose.js`.
- `../api/validate_examples.py` — validates that the `example` on `TodoCreate`/`TodoUpdate` still passes the model's own validation, so `generate.js`'s output can't silently drift into an invalid example.

## Adding a new endpoint

The pipeline never invents new requests or folder placement — a human decides that once:

1. Run the workflow (or `generate.js` locally) to get the new endpoint's skeleton, already filled with realistic example data
2. Create the request in Postman using that skeleton, place it in the right folder, export and commit
3. Add an entry to `sync-manifest.json` in `chronos_postman_colection` mapping the endpoint key to the request's name
4. Optionally add `scripts/<key>.js` for its test script

From then on, that request's method/URL stays in sync automatically.
