# V1/V2 Boundary & Scope Fixes for feature-roadmap.md

> Generated from adversarial review (Oracle + Momus blockers).
> Each fix: exact old→new replacement text, line numbers, one-sentence justification.

---

## 1. Task 19 depends on V2 task 16 → stub import, use OpenCorporates+LinkedIn only

**Decision:** Option (c) — Stub `github_crossref` for V1 with degraded but functional OpenCorporates + LinkedIn-only timeline.
**Why:** Task 16 (PyDriller+lizard+radon+commit mining) is explicitly V2 and moving it would violate the "skip PyDriller" V1 scope; deferring task 19 would remove an entire V1 feature unnecessarily when it can run perfectly well against OpenCorporates alone.

### Fix 1a — Task 19 "What to do" (line 1363)

**OLD:**
```
  What to do: In `backend/services/timeline.py`, parse CV work history dates. Cross-reference against GitHub commit data from **task 16's `GitHubAnalysisResult`** — import `backend/services/github_crossref.py` and call its analysis function. Also cross-reference against company existence (OpenCorporates, task 20). **LinkedIn is NOT scraped** — candidate can optionally provide their profile URL (browser-side fetch). Flag gaps > 6 months, overlaps, and date contradictions (>3 month mismatch). Return `{ timeline: [{ role, cvDate, evidenceDate, match }], flags: [] }`.
```

**NEW:**
```
  What to do: In `backend/services/timeline.py`, parse CV work history dates. **V1 evidence sources:** company existence via OpenCorporates (task 20) + candidate-provided LinkedIn profile URL (optional, browser-side fetch — NOT server scraping). Flag gaps > 6 months, overlaps, and date contradictions (>3 month mismatch between CV claims and OpenCorporates registration dates). **V1 limitation:** GitHub deep analysis (`github_crossref.py`) is deferred to V2 — the `TimelineResult` will show `evidence_source: "OpenCorporates"` or `"LinkedIn (candidate-provided)"` only, never `"GitHub commits"`. The service file imports OpenCorporates directly; the `github_crossref` import and cross-reference logic is added in V2. Return `{ timeline: [{ role, cvDate, evidenceDate, match }], flags: [], v1_limitations: ["GitHub commit verification unavailable in V1"] }`.
```

### Fix 1b — Task 19 OSS cannibalized (line 1365)

**OLD:**
```
  OSS cannibalized: PyDriller commit data from task 16, OpenCorporates (task 20), candidate-provided LinkedIn URL (optional browser-side fetch)
```

**NEW:**
```
  OSS cannibalized: OpenCorporates API (task 20), candidate-provided LinkedIn URL (optional browser-side fetch). GitHub deep analysis (PyDriller/PyGithub/lizard/radon) deferred to V2.
```

### Fix 1c — Task 19 Parallelization (line 1366)

**OLD:**
```
  Parallelization: Wave 3 parallel | Blocked by: Phase 2 complete
```

**NEW:**
```
  Parallelization: Wave 3 parallel | Blocked by: task 20 (OpenCorporates API wrapper must exist). Phase 2 NOT required — GitHub crossref is V2-only.
```

### Fix 1d — Task 19 Acceptance criteria (line 1367)

**OLD:**
```
  Acceptance criteria: CV claims "2020-2024 at Company X" → timeline shows whether GitHub activity supports it.
```

**NEW:**
```
  Acceptance criteria: CV claims "2020-2024 at Company X" → timeline cross-checks Company X existence + registration dates via OpenCorporates. "Company not found in registry" flag shown for unregistered employers. V1 limitation: no GitHub commit verification (deferred to V2).
```

### Fix 1e — Task 19 QA (line 1368)

**OLD:**
```
  QA: Test with consistent CV → all green. Test with fabricated dates → flags shown.
```

**NEW:**
```
  QA: Test with CV listing "BNP Paribas 2020-2024" → OpenCorporates confirms company exists since 2000 → green. Test with CV listing "FakeTech 2020-2024" → OpenCorporates returns no match → flag "⚠️ Company unverified." Note: V1 cannot flag date inconsistencies within a verified company (e.g., claiming 2020-2024 at a company dissolved in 2022 requires GitHub commit data — V2 feature).
```

### Fix 1f — Task 19 Commit message (line 1369)

**OLD:**
```
  Commit: Y | feat: add employment timeline cross-reference via GitHub + OpenCorporates
```

**NEW:**
```
  Commit: Y | feat: add employment timeline cross-reference via OpenCorporates + LinkedIn (V1 — GitHub deferred)
```

---

## 2. Task 7 BERT body vs V1 LLM-only → rewrite for LLM-only parsing

**Decision:** Replace the hybrid BERT+LLM architecture with a single-pass LLM extraction via LiteLLM.
**Why:** V1 tier explicitly says "LLM-only parsing (skip BERT)"; the 431MB BERT model + torch runtime adds 15-20h of work, 1.5GB RAM, and complexity that contradicts the V1 goal of "function over form."

### Fix 2a — Task 7 title (line 1125)

**OLD:**
```
- [ ] 7. Hybrid resume parser: BERT model (primary) + LLM fallback
```

**NEW:**
```
- [ ] 7. LLM-powered resume parser (V1: LiteLLM only, BERT deferred to V2)
```

### Fix 2b — Task 7 "What to do" header + Layer 1 (lines 1126-1132)

**OLD:**
```
  What to do: Build a dual-engine resume parser — deterministic BERT NER model for English (offline, free, fast), LLM via LiteLLM for French and low-confidence fields.

  **Layer 1 — Client-side file ingestion** (`src/lib/cv-reader.ts`):
  - Accept PDF, DOCX, TXT, and image (JPEG/PNG via Tesseract.js for OCR)
  - Use `pdfjs-dist` for PDF → raw text, `mammoth` for DOCX → raw text
  - Tesseract.js for OCR — bundle `eng.traineddata` and `fra.traineddata` in `/public/tesseract/`
  - All extraction is client-side
```

**NEW:**
```
  What to do: Build a single-pass LLM-powered resume parser using LiteLLM. V1 uses LLM extraction exclusively (BERT model deferred to V2). The LLM receives raw CV text + a structured extraction prompt with the `ParsedResume` Pydantic schema and returns JSON. LiteLLM handles provider routing, retries, and fallbacks — we write zero parser logic, only a prompt template and schema validation.

  **Layer 1 — Client-side file ingestion** (`src/lib/cv-reader.ts`):
  - Accept PDF, DOCX, TXT, and image (JPEG/PNG via Tesseract.js for OCR)
  - Use `pdfjs-dist` for PDF → raw text, `mammoth` for DOCX → raw text
  - Tesseract.js for OCR — bundle `eng.traineddata` and `fra.traineddata` in `/public/tesseract/`
  - All extraction is client-side (same as original plan)
```

### Fix 2c — Task 7 Layer 2-3 (lines 1134-1161) — REPLACE ENTIRELY

**OLD (lines 1134-1161):**
```
  **Layer 2 — BERT NER model (primary, offline, deterministic):**
  - **Use `yashpwr/resume-ner-bert-v2`** — HuggingFace BERT model fine-tuned on 22,542 resumes. Apache 2.0 license. `pip install transformers`.
  - **90.87% F1 score**, extracts **25 entity types**: NAME, EMAIL, PHONE, URL, LINKEDIN, LOCATION, COLLEGE_NAME, DEGREE, BRANCH, YEAR_OF_GRADUATION, GPA, COMPANY_NAME, JOB_TITLE, JOB_DURATION, JOB_LOCATION, SKILL, HARDSKILL, SOFTSKILL, CERT, LANGUAGE, PROJECT, AWARD, PUBLICATION, DESIGNATION, PROFESSIONAL_SUMMARY.
  - Per-token confidence scores. 431MB model — downloaded once, cached locally. Fully offline after download.
  - **English only.** French resumes go to the LLM fallback.

  **Layer 3 — LLM fallback (for French + low-confidence fields):**
  - If the BERT model returns `overall_confidence < 0.6`, or if language detection says `fr`, send the CV to the LLM via `llm_client.call(use_case="resume_extraction", ...)`.
  - The LLM handles French natively and catches edge cases the BERT model misses.
  - Cache LLM enrichment results per `sha256(cv_text)` in SQLite `enrichment_cache` (TTL 30 days).

  **Layer 4 — Frontend display** (unchanged): structured preview, confidence indicators, edit/correct fields, raw text + structured data both go into AI matching prompt.

  **Architecture:**
  ```
  CV text → BERT model (fast, offline, English)
              ↓
         confidence ≥ 0.6? → YES → return ParsedResume
              ↓ NO (or French detected)
         LLM via LiteLLM → return EnrichedResume
  ```

  **Why this is better than LLM-only:**
  - **Offline**: BERT runs without internet. LLM is a fallback, not the only path.
  - **Deterministic**: BERT gives the same output for the same input. Testable. Auditable.
  - **Faster**: BERT inference ~0.5s vs LLM ~3-5s. For English resumes, no API call at all.
  - **GDPR-friendly**: English CV data stays on-server (BERT runs locally).
  - **French handled**: LLM fallback catches the ~10% case where the BERT model can't help.
```

**NEW (replaces lines 1134-1161):**
```
  **Layer 2 — LLM extraction (V1: LiteLLM single pass):**
  - Send raw CV text to the LLM via `llm_client.call(use_case="resume_extraction", messages=[...])`.
  - The extraction prompt includes the full `ParsedResume` Pydantic schema and instructs the LLM to output valid JSON matching it.
  - Backend validates LLM output against the `ParsedResume` schema; rejects malformed JSON and retries once.
  - **All fields are LLM-extracted** — name, email, phone, skills, experience, education, languages, etc. English + French in one pass (LLMs handle both natively).
  - Cache extraction results per `sha256(cv_text)` in SQLite `enrichment_cache` (TTL 30 days) to avoid re-parsing identical CVs.
  - LLM confidence: each field gets a confidence score (1.0 = model is certain, derived from structured output; in practice, treat scores ≥0.7 as "high confidence"). Fields with confidence < 0.6 are marked in `fields_needing_enrichment` and shown with a warning badge on the frontend.

  **V2 upgrade path:** In V2, add `yashpwr/resume-ner-bert-v2` (431MB, 90.87% F1, offline) as primary parser for English CVs, with LLM as fallback. V1 skips this entirely — LLM-only is simpler, handles both languages, and requires zero ML model management.

  **Layer 3 — Frontend display** (unchanged): structured preview, confidence indicators, edit/correct fields, raw text + structured data both go into AI matching prompt.

  **Architecture (V1):**
  ```
  CV text → LiteLLM (gpt-4o-mini or configured provider)
              ↓
         JSON validated against ParsedResume schema
              ↓
         confidence per field from LLM confidence scores
              ↓
         return ParsedResume (all fields LLM-extracted)
  ```
```

### Fix 2d — Task 7 "Why this is better" section — DELETE + REPLACE (was lines 1156-1161)

Replace the old "Why this is better than LLM-only" block with a "Why V1 LLM-only" block.

**NEW (replaces lines 1156-1161):**
```
  **Why V1 is LLM-only:**
  - **Simpler**: One extraction path instead of BERT→confidence-check→LLM-fallback branching. Zero ML model management.
  - **Handles both languages**: LLMs natively parse English and French in a single pass.
  - **LiteLLM provides retries/fallbacks**: If the primary provider fails, LiteLLM's router automatically retries with a fallback model — no custom error handling needed.
  - **Faster to implement**: No `transformers` model download, no GPU/CPU config, no PyTorch dependency for parsing. Just a prompt template + schema validation (~50 lines of service code).
```

### Fix 2e — Task 7 Must NOT do (line 1163)

**OLD:**
```
  Must NOT do: Upload files to any external service. Use a paid CV parsing API.
```

**NEW:**
```
  Must NOT do: Upload files to any external service. Use a paid CV parsing API. Install BERT/torch for resume parsing in V1 (deferred to V2 — LLM-only covers both languages).
```

### Fix 2f — Task 7 OSS cannibalized (line 1164)

**OLD:**
```
  OSS cannibalized: `yashpwr/resume-ner-bert-v2` (Apache 2.0, 90.87% F1, 25 fields), LiteLLM (for French/low-confidence fallback), `pdfjs-dist`, `mammoth`, `tesseract.js`
```

**NEW:**
```
  OSS cannibalized: LiteLLM (LLM provider abstraction — does the actual extraction), `pdfjs-dist`, `mammoth`, `tesseract.js`. BERT model (`yashpwr/resume-ner-bert-v2`) deferred to V2.
```

### Fix 2g — Task 7 New dependencies (line 1165)

**OLD:**
```
  New dependencies: `transformers>=4.40`, `torch>=2.0` (already common in ML stacks)
```

**NEW:**
```
  New dependencies: None for parsing — LiteLLM already installed in Phase 0. `transformers` + `torch` needed only for AI detection (task 15, ZipPy+RoBERTa), not resume parsing.
```

### Fix 2h — Task 7 Acceptance criteria (lines 1168-1173) — REWRITE

**OLD:**
```
  Acceptance criteria:
    - Upload English CV → BERT model returns ParsedResume with name, skills, experience, confidence > 0.7
    - Upload French CV → language detected as `fr`, LLM fallback activated, returns ParsedResume
    - BERT model returns low confidence → LLM fallback enriches fields
    - Upload scanned image CV → OCR extracts text, BERT parses it
    - LLM unavailable → BERT still works for English (degraded but functional)
    - `pnpm run build` + `cd backend && python -m pytest` pass
```

**NEW:**
```
  Acceptance criteria:
    - Upload English CV → LLM returns ParsedResume with name, email, skills, experience (all fields populated)
    - Upload French CV → LLM returns ParsedResume with French-language fields correctly extracted
    - Upload scanned image CV → OCR extracts text, LLM parses it
    - LLM returns malformed JSON → backend rejects, retries once, returns 502 on second failure
    - `pnpm run build` + `cd backend && python -m pytest` pass
```

### Fix 2i — Task 7 QA (lines 1175-1177) — REWRITE

**OLD:**
```
  QA:
    - Happy: English CV → deterministic ParsedResume. Run twice → same output.
    - French: French CV → LLM fallback returns structured fields.
    - Offline: Kill internet → English CV still parses via BERT. French shows "⚠️ French CV — requires LLM (offline)".
```

**NEW:**
```
  QA:
    - Happy: English CV → ParsedResume with all major fields populated (name, email, skills, experience). Run twice → key fields (name, email, phone) consistent across both runs; minor wording variations in descriptions are expected (LLM non-determinism).
    - French: French CV → LLM returns structured fields in original language. Skills and job titles preserved in French.
    - Offline: Kill internet → parser shows "⚠️ LLM unavailable — try again when connected" (V1 has no offline fallback; BERT offline mode is a V2 feature).
```

### Fix 2j — Task 7 Commit message (line 1178)

**OLD:**
```
  Commit: Y | feat: add dual-engine resume parser (BERT model + LLM fallback)
```

**NEW:**
```
  Commit: Y | feat: add LLM-powered resume parser via LiteLLM (V1 — BERT deferred)
```

---

## 3. CSRF/rate limiting scope conflict → remove from task 3, defer to V2

**Decision:** Remove CSRF and rate limiting from task 3 (Phase 0). The V1 tier is the authority — "No CSRF/rate limiting" at line 38.
**Why:** CSRF and rate limiting are production hardening, not V1 functional requirements; deploying them in Phase 0 introduces complexity and attack surface before any features work, and they're explicitly listed in the V2 tier description at line 39.

### Fix 3a — Task 3 CSRF/rate limiting paragraph (line 835)

**OLD:**
```
   Use Pydantic v2 for request/response schemas. Add proper error handling (404, 401, 403, 422, 500). Add request logging middleware. Add CORS for Vite dev server (origin: `http://localhost:5173`). Add CSRF protection: require `X-CSRF-Token` header on all mutating endpoints (POST/PUT/DELETE). Backend sets `csrf_token` cookie on `/auth/jwt/login`, frontend reads it and includes in header. Add rate limiting via `slowapi`: 5 req/s per IP on `/auth/*` endpoints, 1 req/s on AI-calling endpoints, 20 req/s on all other API routes. Return 429 with `Retry-After` header.
```

**NEW:**
```
   Use Pydantic v2 for request/response schemas. Add proper error handling (404, 401, 403, 422, 500). Add request logging middleware. Add CORS for Vite dev server (origin: `http://localhost:5173`). **CSRF protection and rate limiting are deferred to V2** (see V2 tier at §Tier Strategy). For V1, the backend runs on localhost only — Docker Compose does not expose ports to the host network, and the frontend communicates via the internal Docker bridge network. V1 is inherently local/trusted.
```

### Fix 3b — Update V1 tier description to remove any ambiguity (line 38) — already correct, no change needed

Line 38 already says "No CSRF/rate limiting" — this is the correct spec. The inconsistency was in task 3 mandating them.

---

## 4. `import spacy` in AC → replace with correct V1 imports

**Decision:** Replace `spacy` with `litellm, transformers` in the task 6 import check.
**Why:** spaCy was removed from the dependency list (line 26: "Deadweight deps removed: spaCy models"); the import test must verify the deps actually installed for V1 backend work.

### Fix 4a — Task 6 AC import check (line 1114)

**OLD:**
```
    - `cd backend && python -c "import fastapi, sqlalchemy, alembic, spacy; print('ok')"` succeeds
```

**NEW:**
```
    - `cd backend && python -c "import fastapi, sqlalchemy, alembic, litellm, transformers; print('ok')"` succeeds
```

---

## 5. V1 task count 22 vs 19 → update all counts and aggregates

**Decision:** Update "19" to "22" everywhere, "8 deferred" to "5 deferred."
**Why:** Literal counting of V1-scoped tasks per the phase breakdown table (lines 92-96) yields 5+6+5+4+2=22 V1 tasks and 27-22=5 deferred; the plan's stated 19/8 is a factual error that downstream ETA and wall-clock estimates depend on.

### Verification of V1 task count:
| Phase | Range | V1 IDs | Count |
|-------|-------|--------|-------|
| 0 — Foundation | 1-5 | 1, 2, 3, 4, 5 | 5 |
| 1 — Core UX | 6-11 | 6, 7, 8, 9, 10, 11 | 6 |
| 2 — Integrity | 12-17 | 12, 13, 14, 15, 17 | 5 |
| 3 — Verification | 18-22 | 18, 19, 20, 21 | 4 |
| 4 — Platform | 23-27 | 24, 27 | 2 |
| **Total V1** | | | **22** |

Deferred to V2: 16, 22, 23, 25, 26 = **5 tasks**.

### Fix 5a — Tier Strategy table (line 38)

**OLD:**
```
| **V1** — "It works" | Functional, self-hosted, single-user. LLM-only parsing (skip BERT). PyGithub metadata (skip PyDriller). Stub GDPR. Single LLM provider. No CSRF/rate limiting. No bias reports, court records, ATS API, or audit viewer. | 19 of 27 | 55-80h |
```

**NEW:**
```
| **V1** — "It works" | Functional, self-hosted, single-user. LLM-only parsing (skip BERT). PyGithub metadata (skip PyDriller). Stub GDPR. Single LLM provider. No CSRF/rate limiting. No bias reports, court records, ATS API, or audit viewer. | 22 of 27 | 55-80h |
```

### Fix 5b — Tier Strategy table (line 39)

**OLD:**
```
| **V2** — "Production ready" | Multi-user hardening, BERT fallback, deep GitHub analysis, court records, bias reports, GDPR implementation, CSRF/rate limiting, multi-provider fallback, audit viewer, ATS API. | 8 deferred | 35-55h |
```

**NEW:**
```
| **V2** — "Production ready" | Multi-user hardening, BERT fallback, deep GitHub analysis, court records, bias reports, GDPR implementation, CSRF/rate limiting, multi-provider fallback, audit viewer, ATS API. | 5 deferred | 35-55h |
```

### Fix 5c — Total V1 row (line 97)

**OLD:**
```
| **Total V1** | | **19** | **55-80h** | **10-14 days** | |
```

**NEW:**
```
| **Total V1** | | **22** | **55-80h** | **10-14 days** | |
```

### Fix 5d — Total V2 row (line 98)

**OLD:**
```
| **Total V2** | | **8** | **35-55h** | Future | |
```

**NEW:**
```
| **Total V2** | | **5** | **35-55h** | Future | |
```

### Fix 5e — V1 parallel AI agent timeline (line 100)

**OLD:**
```
> **V1 parallel AI agent timeline:** 7-10 days wall-clock (19 tasks, max parallelism within each wave). V2 adds 3-5 days when scheduled.
```

**NEW:**
```
> **V1 parallel AI agent timeline:** 7-10 days wall-clock (22 tasks, max parallelism within each wave). V2 adds 3-5 days when scheduled.
```

### Fix 5f — V2 parallel AI agent timeline (line 100 continued)

The V2 tasks per-wave timeline stays the same since the per-phase V2 counts are unchanged (only the summary was wrong).

**Note on hours:** The per-phase hour estimates (lines 92-96) were already based on the actual V1 task breakdown (not the erroneous 19), so 55-80h and 10-14 days remain accurate — only the count label was wrong.

---

## 6. LLM-only parsing can't be deterministic → fix acceptance criteria

**Decision:** Replace "Run twice → same output" with "Run twice → key structured fields consistent."
**Why:** LLMs (including gpt-4o-mini at temperature=0) are inherently non-deterministic at the token level; demanding byte-identical output is an impossible AC that would cause false CI failures even when parsing is correct.

### Fix 6a — Task 7 QA (line 1175) — already fixed in Fix 2i above

The rewritten QA at Fix 2i ("key fields consistent across both runs; minor wording variations in descriptions are expected") already addresses this.

### Fix 6b — Performance spec if affected (line 739) — no change needed

The performance spec at line 739 targets response latency, not determinism. No fix needed.

---

## 7. Docker 1G RAM too small → increase to 2G for V1

**Decision:** Increase `memory: 1G` to `memory: 2G` for the backend container.
**Why:** The performance spec at line 739 says "Backend container <2GB RAM (includes ML models)", and RoBERTa (needed for V1 task 15 AI detection via ZipPy+RoBERTa) consumes ~1.2-1.5GB in RAM alone before accounting for Python, FastAPI, libSQL, and LiteLLM overhead.

### Fix 7a — Docker resource limits (line 853)

**OLD:**
```
   - Resource limits: backend — `cpus: '2', memory: 1G`; frontend — `cpus: '1', memory: 512M`.
```

**NEW:**
```
   - Resource limits: backend — `cpus: '2', memory: 2G`; frontend — `cpus: '1', memory: 512M`.
```

### Fix 7b — HuggingFace cache description (line 850) — context update

**OLD:**
```
   - HuggingFace model cache: named volume `hf_cache` mounted at `/root/.cache/huggingface/` — persists BERT (431MB) and RoBERTa (500MB) model downloads across container restarts. First `docker compose up` takes ~5 min for model download; subsequent starts are instant.
```

**NEW:**
```
   - HuggingFace model cache: named volume `hf_cache` mounted at `/root/.cache/huggingface/` — persists RoBERTa model (~500MB, needed for AI detection in task 15) across container restarts. First `docker compose up` takes ~3 min for model download; subsequent starts are instant. (BERT model for resume parsing is V2-only — not loaded in V1.)
```

### Fix 7c — Note on performance spec consistency (line 739)

Line 739 already says `<2GB RAM` which is consistent with the new `2G` limit. No change needed — the spec and Docker config now agree.

---

## Summary of Changes

| # | Issue | Files changed | Lines | V1/V2 impact |
|---|-------|-------------|-------|-------------|
| 1 | Task 19→16 dependency | 1 file | 6 edits | Task 19 stays V1 with degraded GitHub |
| 2 | Task 7 BERT→LLM-only | 1 file | 10 edits | Task 7 rewritten for V1 LLM-only |
| 3 | CSRF/rate limiting | 1 file | 1 edit | Removed from V1 task 3 |
| 4 | `import spacy` in AC | 1 file | 1 edit | Replaced with litellm, transformers |
| 5 | V1 count 19→22 | 1 file | 6 edits | Counts reconciled, hours unchanged |
| 6 | Deterministic AC | 1 file | (covered by fix 2) | AC rewritten for LLM non-determinism |
| 7 | Docker 1G→2G | 1 file | 2 edits | RAM matches performance spec + RoBERTa |

**Total: ~27 line-level edits across 1 file.** 25 line replacements, 2 explanatory context updates.
