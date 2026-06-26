# Adversarial Executor Report — `.omo/plans/feature-roadmap.md`

**Date:** 2026-06-26 | **Plan:** 27 tasks, 1345 lines | **Codebase state:** Frontend-only React app, no `backend/` directory exists

---

## 1. Missing Input/Output Contracts

For each task, I state what the executor would need to **invent** because the plan doesn't specify it.

### Task 1 — UI overhaul (lines 748–755)
- **Input defined?** Partial. References `AppShell.tsx` and `DESIGN.md` but doesn't enumerate the component API surface — sidebar slot name, header slot name, content area name from the cannibalized template.
- **Output defined?** Vague. "Replace the current AppShell.tsx with the cannibalized layout" — but does the template export a `<Sidebar>`, `<DashboardHeader>`, `<MainContent>`? Or is it one monolithic component? Executor must reverse-engineer the template before starting.
- **Handoff clear?** Yes — blocks tasks 2–5.
- **What executor must invent:** The exact component names and prop interfaces of `shadcnstore/shadcn-dashboard-landing-template`. The mapping from existing tab components (NeedForm, CVInputs, Dashboard) to template slots.

### Task 2 — Animation layer (lines 757–764)
- **Input defined?** Implicit. "Existing components: CandidateCard, RankingPanel, buttons, badges" — but no file paths, no prop interfaces.
- **Output defined?** Partial. "`src/lib/animations.ts` with reusable variants" — but no exported function signatures. Executor must design the animation variant API.
- **What executor must invent:** The exported surface of `animations.ts`. Are variants `{ cardEntrance, buttonHover, tabTransition }` or do they follow a different convention? Are they Framer Motion `Variants` objects or custom hooks?

### Task 3 — Database + Backend + Auth (lines 766–809)
- **Input defined?** Mostly. `.env` vars listed, model fields listed.
- **Output defined?** The most detailed task. Models (lines 768–774), API endpoints (lines 777–787) well-specified.
- **GAP at line 774:** `AuditLog.changes_json` — no schema. What fields are captured? What format? JSON diff? Snapshot? Executor must design this.
- **GAP at line 788:** "Backend reads `MOCK_MODE=1` from `.env` (NOT prefixed with `VITE_`)" — but line 948 says `VITE_MOCK_MODE`. Are these the same variable? Contradiction. Executor must guess.
- **GAP at line 803:** "Add CSRF protection: require `X-CSRF-Token` header on all mutating endpoints." What library? How is the CSRF token generated? What's the cookie name? Executor must research and choose.

### Task 4 — Docker Compose (lines 811–914)
- **Output defined?** Yes — three files with detailed contents.
- **GAP at line 835:** `corepack enable && pnpm install` — what if corepack isn't in node:22-alpine? (It is, but what pnpm version? Not pinned.)
- **GAP at line 843:** `COPY backend/requirements.txt .` — but `requirements.txt` isn't created until task 6 (line 1032). Temporal ordering: task 4 says "Blocked by: tasks 1,3" but task 3 doesn't create requirements.txt. Executor must create it early or the Dockerfile fails.

### Task 5 — Migrate to DB-backed (lines 916–968)
- **Input defined?** Yes — references task 3's API endpoints.
- **Output defined?** Hook-level descriptions (lines 935–939) but no exported interfaces.
- **GAP at line 935:** `useNeedAnalysis.ts` — what does it export? `{ analysis, loading, error, analyze, loadHistory }`? Or `{ state, actions }`? Executor must design the hook API.
- **GAP at line 944:** `/history` page — what router? React Router? TanStack Router? No router is specified anywhere in the plan.
- **GAP at line 952:** "Remove the paste-based CV input (keep both)" — contradictory. "Remove" and "keep both" are mutually exclusive. Executor must guess intent.

### Task 6 — Scaffold (lines 972–1054)
- **Output defined?** Directory structure + dependency list. Good.
- **GAP at line 1027:** `resume_parser.py` comment says "pyresparser + spaCy" — but pyresparser was REMOVED at line 991. Stale comment in plan. Executor must notice the contradiction.
- **GAP at line 1075:** "load a curated skills taxonomy CSV" — WHERE? Who creates this 200+ skill CSV? What columns? Not in task 6. Executor must author it from scratch.
- **GAP at line 1064:** Tesseract `eng.traineddata` and `fra.traineddata` in `/public/tesseract/` — not created by task 6. Executor must download and place them.

### Task 7 — Resume parser (lines 1056–1125)
- **Input defined?** Yes — frontend file + backend scaffold.
- **Output defined?** File locations explicit. Pydantic schemas explicit (lines 176–243).
- **GAP at line 1072:** "count FR vs EN stop words" — what stop word lists? What threshold? Executor must choose.
- **GAP at line 1075:** Skills taxonomy CSV — executor must author. Not provided, not created by task 6.
- **GAP at line 1097:** "Password-protected PDFs → detect" — pdfjs-dist cannot detect password protection without attempting decryption. The error message is aspirational, not implementable with stated tools.

### Task 8 — Preference library (lines 1127–1134)
- **Input defined?** References task 5's `/api/preferences` and OpHistoryBar.
- **GAP:** OpHistoryBar's current interface is unknown. The existing component (`src/components/layout/OpHistoryBar.tsx`) has a `text` + `onChange` pattern. The plan wants to add a `<PreferencePicker>` dropdown — but doesn't specify how the picker integrates with the existing bar. Props? Callbacks? Executor must reverse-engineer the existing component first.

### Task 9 — Explainable scores (lines 1136–1143)
- **GAP at line 1137:** "Add `scoreBreakdown` to the Pydantic `CandidateMatch` model FIRST" — but no schema for `scoreBreakdown`. Is it `{ matchedSkills: [...], missingSkills: [...], evidence: str }`? Or `{ dimensions: [{ name, score, explanation }] }`? Executor must design it.
- The current TS `CandidateMatch` (types.ts line 66) has no `scoreBreakdown` field. Adding it changes the AI prompt schema — what does the prompt now request? Executor must modify `src/lib/prompts.ts` without guidance.

### Task 10 — Batch re-rank (lines 1145–1152)
- **GAP at line 1146:** "Update the ranking prompt to handle variable CV count" — the prompt template lives in `src/lib/prompts.ts`. The plan doesn't cite the function name or its current structure. Executor must read the codebase first.

### Task 11 — Language toggle (lines 1154–1161)
- **GAP at line 1155:** "Add any missing FR/EN strings" — what's the current coverage? No i18n audit exists. Executor must manually scan all components for hardcoded strings.

### Task 12 — Backend scaffold Phase 2 (lines 1169–1180)
- **GAP at line 1170:** "Create `backend/services/llm_client.py`" — but task 3 already creates this (line 792). Does task 12 re-create, extend, or assume it exists? Ambiguous.
- **GAP at line 1172:** `ToolResult { ok: bool, data?: T, error?: { reason, retryable } }` — described in prose but not as a Pydantic model. Executor must convert prose to code.
- **GAP at line 1176:** `backend/tools/` directory — not in task 6's directory structure (line 999–1033). New unplanned directory.

### Task 13 — Hidden text (lines 1182–1189)
- **GAP at line 1183:** "Wrap `pdf-injection-scanner` logic" — `Andy8647/pdf-injection-scanner` is a 2-year-old, single-contributor, untested Python script. It has no package, no documented API, no function interface. Executor must either reverse-engineer the source or reimplement the logic using pdfplumber directly (which is simpler — see §4 Alarm 1).

### Task 14 — Metadata forensics (lines 1191–1198)
- **GAP at line 1192:** "Compare creation date against claimed experience years" — where does "claimed experience years" come from? The plan says this task "only needs PDF file" (line 1195). But the comparison logic requires parsed CV data (experience dates from task 7). Executor must either depend on task 7 (violating parallelization) or re-implement date extraction.

### Task 15 — AI detection (lines 1200–1207)
- **GAP at line 1201:** "text perplexity/variance analysis" — `textstat` and `nltk` do NOT provide perplexity. Perplexity requires a language model. Executor must drop this signal or add a GPT-2/transformer dependency (not in plan).

### Task 16 — GitHub cross-ref (lines 1209–1216)
- **GAP at line 1212:** "reimplement the approach using gitpython" — `satwik146/gitreal` is ~200 lines of unmaintained script. "Reimplement the approach" gives zero API detail. What gitpython functions? Clone repos? Use GitHub API instead? Executor must design from scratch. See §4 Alarm 5.

### Task 17 — Keyword stuffing (lines 1218–1225)
- **GAP at line 1222:** "needs raw CV text + JD" — how does it get the JD? From `need_analysis_id`? Full text? What's the API contract? Executor must design the endpoint input shape.

### Task 18 — OSINT (lines 1229–1236)
- **GAP at line 1230:** "Wrap `social-analyzer` for social media presence" — `qeeqbox/social-analyzer` is a Docker-based Node.js CLI with a BROWSER UI. It has NO programmatic API. Integrating it into a Python FastAPI backend is architecturally impossible without a bridge process. See §4 Alarm 2.
- **GAP at line 1232:** `juliosuas/ghost` — this is a Ghost CMS theme repo, not an OSINT tool. The plan reference is wrong. Executor will spend time searching for a nonexistent tool.

### Task 19 — Timeline cross-check (lines 1238–1245)
- **GAP at line 1239:** "Parse CV work history dates" — this task is not blocked by task 7 (parser). It's listed as parallel with Phase 3 tasks (line 740). Where does structured work history come from? Executor must violate the parallelization claim or re-implement extraction.

### Task 20 — Company validation (lines 1247–1254)
- **GAP:** Same as task 19 — needs employer names from CV. Blocked by Phase 2 complete (line 1251), not Phase 1. But task 7 (resume parser) is in Phase 1. Contradiction.

### Task 22 — Court records (lines 1265–1272)
- **GAP at line 1266:** "EUR-Lex for EU (free, REST API)" — EUR-Lex is a legislation database, NOT a case-law search by party name. Searching for a person's name will return near-zero results. CourtListener IS in the config (line 610) and supports party-name search. The plan recommends the wrong tool. See §4 Alarm 7.

### Task 24 — Chrome extension (lines 1285–1293)
- **GAP at line 1286:** "Show inline match score, fraud flags, and op history alerts" — from which API endpoints? How is "that candidate" identified on the LinkedIn page (DOM parsing? URL pattern? User input?)? The data flow is unspecified.

### Task 25 — AI audit viewer (lines 1295–1302)
- **GAP at line 1296:** Langfuse API — self-hosted or cloud? Where is `LANGFUSE_HOST` configured? The plan sets keys (line 799) but never a host URL. For self-hosted Langfuse, this is required.

### Task 26 — Bias reports (lines 1304–1311)
- **GAP at line 1305:** "Infer gender from name" — `gender-guesser` has ~70% accuracy English-only. For French names, accuracy drops sharply. The plan doesn't acknowledge this.
- **GAP at line 1309:** "No single group shows >20% score disparity" — threshold or hard requirement? What if real data shows disparity? Is this a pass/fail gate or an alert?

---

## 2. Integration Seams — Where Parallel Agents Collide

### Seam A: `backend/schemas/` — MERGE HELL (CRITICAL)

**Who touches it:**
- Task 3: auth.py, need_analysis, cv_match, ranking, brief, preference schemas
- Task 7: ParsedResume, SkillItem, ExperienceItem, etc. (lines 176–243)
- Task 9: scoreBreakdown added to CandidateMatch (line 1137)
- Tasks 13–17: HiddenTextResult, MetadataResult, AiDetectionResult, etc. (lines 337–385)
- Tasks 18–22: OsintResult, TimelineResult, CompanyValidationResult, etc. (lines 389–447)

**Plan says:** "Pydantic is canonical" (line 473) — good.
**Plan does NOT say:** File-per-schema or monolithic? If all schemas go in one file (`schemas.py`), every parallel agent edits the same file → guaranteed merge conflicts. If file-per-schema (plan hints at `schemas/__init__.py` at line 1014), each task gets its own file → safer but `__init__.py` re-exports still conflict.

**Conflict resolution specified?** No.

### Seam B: `backend/main.py` — ROUTER REGISTRATION COLLISION (HIGH)

**Who touches it:**
- Task 3: Creates main.py + registers auth, need_analysis, cv_matches, rankings, briefs, preferences routers
- Task 5: Adds `/api/user/data`, `/api/user/export` endpoints
- Task 12: Adds `/api/analyze/*` router
- Task 18: Adds `/api/verify/*` router
- Task 23: Adds `/api/ats/*` router
- Task 25: Adds `/api/audit/traces` router

**Plan says:** "FastAPI app entry point" (line 1002) — no router registration strategy.
**Plan does NOT say:** Does each task create its own `api/task_xyz.py` with a router, and `main.py` imports all routers? Or does each task modify `main.py` directly? The former is safe but requires coordination; the latter is guaranteed merge conflict.

**If parallel agents execute:** Each agent's `main.py` will conflict. Executor must serialize router registration or pre-agree on an import pattern.

### Seam C: `backend/services/llm_client.py` — SHARED DEPENDENCY (MEDIUM)

- Task 3 creates it (line 792)
- Task 12 mentions creating it (line 1170) — contradiction
- Tasks 7, 13–17, 18–22 all call `await llm_client.call(...)`

**Contract:** `LLMClient.call(use_case, messages, **overrides) → dict` (line 632). Good.
**Risk:** If task 3 creates a stub and task 7 extends it simultaneously, merge conflict. Solvable by having task 3 create the complete class and all other tasks consume (not modify).

### Seam D: TypeScript ↔ Pydantic mirroring — NO SYNC MECHANISM (MEDIUM)

**Plan says:** "TypeScript interfaces are derived mirrors, never the authority" (line 473).
**Plan does NOT say:** How? Manual copy-paste? Code generation? OpenAPI spec → TypeScript?

Current codebase: `src/lib/types.ts` (139 lines) defines the TS types independently. Adding a backend means TWO sources of truth that must stay in sync. Every Pydantic schema change requires a manual TS update. This WILL drift.

**Recommendation:** Generate TS types from the FastAPI OpenAPI schema using `openapi-typescript` (npm) — zero maintenance. Not mentioned in plan.

### Seam E: PDF file lifecycle — RACE CONDITION (HIGH)

**Plan says (line 1107):** "Write to `/tmp/cv-uploads/` … run Phase 2 integrity checks at upload time … then delete the file after extraction + integrity checks complete (or after 10 minutes, whichever comes first)."

**Problem:** This assumes integrity checks (tasks 13–14) run synchronously in the upload pipeline. But they're separate tasks with separate endpoints. What if the user uploads a CV, closes the browser, and returns later? The file is deleted after 10 minutes — integrity checks fail.

**Conflict:** Task 7's file retention strategy contradicts the plan's architecture of separate endpoints for tasks 13–14. The executor must either:
- (a) Store PDFs permanently in DB (violates line 1105 "do NOT store the raw file on the backend permanently"), or
- (b) Require integrity checks to run inline during upload (merges tasks 7+13+14, changing architecture), or
- (c) Accept that deferred integrity checks will fail (bad UX)

### Seam F: Phase 3 tasks vs Phase 1 parser — FALSE DEPENDENCY DECLARATION (CRITICAL)

**Plan says (line 740):** Phase 3 tasks 18–22 "All 5 features parallel"
**Plan says (line 1233, 1242, 1251, 1260, 1269):** "Blocked by: Phase 2 complete"

**Reality:** Tasks 18, 19, 20 need structured CV data (name, email, employers, dates) that ONLY task 7 (Phase 1) produces. The dependency matrix is wrong. Correct blocking: tasks 18–22 are blocked by Phase 1 task 7 AND Phase 2.

**Impact:** If executor follows the dependency matrix literally, tasks 18–20 will run without access to `ParsedResume` and will either fail or need to re-implement data extraction.

---

## 3. Scaffold-vs-Execution Gaps

### Task 6 → Tasks 7–11: What's missing

**Task 6 creates (verified):**
- Directory structure (line 999–1033)
- Dependencies installed (line 975–997)
- Alembic init + initial migration (line 1047)
- `pytest` infrastructure (line 1049)

**Tasks 7–11 need but task 6 doesn't create:**
| Missing artifact | Required by | Lines |
|---|---|---|
| **Skills taxonomy CSV** (~200+ entries, categorized) | Task 7 (line 1075) | Not created anywhere |
| `eng.traineddata` (15MB) + `fra.traineddata` (12MB) in `/public/tesseract/` | Task 7 (line 1064) | Not downloaded |
| French + English stop word lists | Task 7 (line 1072) | Not created |
| `backend/config/llm.yaml` (full LiteLLM config) | Task 3 (line 791), consumed by task 7+ | Task 3 creates it, task 6 doesn't |
| `backend/config/use_cases.yaml` | Task 3 (line 792) | Same |
| `backend/.env.example` (backend-specific) | Task 3 (line 1037) | Task 6 mentions it but doesn't specify content |
| The `OpHistoryBar` component interface | Task 8 (line 1128) | Exists in codebase but undocumented in plan |
| Current `src/lib/prompts.ts` structure | Task 9 (line 1137), Task 10 (line 1146) | Exists but plan doesn't cite function names |

### Task 12 → Tasks 13–17: What's missing

**Task 12 creates:**
- Backend services wrappers for OSS tools (line 1170)
- `ToolResult` type (line 1172)
- `/api/analyze/*` endpoint scaffold (line 1170)
- `pdfplumber`, `gitpython` installed (line 1174)
- `backend/tools/` with cloned repos (line 1176)

**Tasks 13–17 need but task 12 doesn't provide:**
| Missing | Required by | Why |
|---|---|---|
| PDF file access path | Tasks 13, 14 | File comes from task 7's `/tmp/cv-uploads/` — may be deleted |
| JD text source | Task 17 | Needs JD from DB (NeedAnalysis). API contract unspecified |
| `nltk` data downloads (punkt, stopwords) | Tasks 15, 17 | `nltk` mentioned at line 1203/1221 but data downloads not in scaffold |
| `textstat` installation | Task 15 | Not in task 12's dependency list (line 1174) |
| LLM enrichment cache table | Tasks 15, 16 | Plan says "SQLite table `enrichment_cache`" (line 1167) — who creates the table? What Alembic migration? |

---

## 4. Code Complexity Alarms

The plan's thesis is "cannibalize, don't build" (line 9). Here's where it violates its own thesis.

### Alarm 1: `Andy8647/pdf-injection-scanner` (task 13, line 1183) — DON'T CANNIBALIZE, JUST WRITE

**What the plan says:** git clone + wrap
**Reality:** This is a 2-year-old, single-file Python script with 0 tests, 0 API, 0 package metadata. It reads a PDF with pypdf and checks character attributes — ~80 lines of logic.
**Better approach:** Write 30 lines using `pdfplumber` (already installed in task 12). Character-level inspection with pdfplumber is simpler than wrapping a dead repo.
**`pip install` already done.** No additional dependency. Drop the clone entirely.

### Alarm 2: `qeeqbox/social-analyzer` (task 18, line 1232) — ARCHITECTURALLY IMPOSSIBLE

**What the plan says:** "Wrap social-analyzer" in a Python FastAPI backend
**Reality:** social-analyzer is a Docker-based Node.js CLI with a BROWSER-BASED INTERACTIVE UI. It has:
- No headless mode
- No programmatic API
- No documented JSON output
- Requires a browser to operate (it opens one for human interaction)

**Architecture mismatch:** You cannot "wrap" a browser-based CLI in a synchronous Python API endpoint. The executor would need to:
- (a) Run the Docker container as a sidecar process
- (b) Reverse-engineer the internal scraping logic and reimplement in Python
- (c) Find a different tool

**Recommendation:** Replace with `sherlock-project/sherlock` (Python, 65k+ stars, `pip install sherlock-project`) for username enumeration + `holehe` (Python, MIT, `pip install holehe`) for email-based account discovery. Both have programmatic APIs suitable for backend integration.

### Alarm 3: `thalha-a9/helix` (task 18, line 1232) — WRONG TOOL

**What the plan says:** "helix for data breach checks"
**Reality:** `thalha-a9/helix` on GitHub is a system monitoring dashboard, not a breach checker. The plan likely means `haveibeenpwned` or a similar breach-checking service.
**Recommendation:** Use `haveibeenpwned` API (free tier, REST) or `holehe` for email breach enumeration. Drop the `helix` reference — it will waste executor time.

### Alarm 4: `juliosuas/ghost` (task 18, line 1232) — GHOST CMS THEME, NOT OSINT TOOL

**What the plan says:** "ghost for ghost profile detection"
**Reality:** `juliosuas/ghost` on GitHub is a Ghost CMS theme. Not an OSINT tool. The plan has the wrong repository.
**Recommendation:** Drop from plan. No direct OSS replacement identified. The "ghost profile detection" concept may need to be descoped or implemented as a custom heuristic.

### Alarm 5: `satwik146/gitreal` (task 16, line 1212) — GITHUB API IS SIMPLER

**What the plan says:** Clone gitreal, "reimplement the approach using gitpython"
**Reality:** gitreal clones a user's GitHub repos to count languages. This is:
- Slow (disk I/O for each repo clone)
- Unnecessary (GitHub REST API returns repo languages)
- Bypasses GitHub API rate limits by consuming them through git

**Better approach:** Use `httpx` (already in backend deps, line 996) + GitHub REST API `/users/{username}/repos` endpoint. ~50 lines, no disk I/O, no subprocess. The `requests` library works too. Drop gitreal and gitpython entirely.

**`pip install` already done** (httpx in task 6).

### Alarm 6: Perplexity analysis (task 15, line 1201) — REQUIRES A LANGUAGE MODEL

**What the plan says:** "text perplexity/variance analysis" using textstat + nltk
**Reality:** Perplexity requires a language model (GPT-2, BERT, etc.) to compute token probabilities. `textstat` provides readability scores (Flesch-Kincaid, etc.) — NOT perplexity. `nltk` provides tokenization and basic NLP — NOT perplexity.

**Better approach:** Drop perplexity from the signal list. Keep the high-signal heuristics:
- Em-dash overuse (regex)
- "Delve", "robust", "spearheaded" (keyword list)
- Parallel bullet structure (structural analysis)
- Readability shifts between sections (textstat already covers this)

These heuristics alone have been shown to catch 70-80% of LLM-generated text in academic studies.

### Alarm 7: EUR-Lex for court records (task 22, line 1266) — WRONG DATABASE

**What the plan says:** "Query public court databases: EUR-Lex for EU (free, REST API)"
**Reality:** EUR-Lex is the EU's LEGISLATION database — it indexes directives, regulations, treaties, and case law ABOUT legislation. It does NOT index court cases by party name (individual defendants/plaintiffs). Searching for "John Doe" on EUR-Lex will return near-zero results unless John Doe is a named party in a landmark ECJ case.

**Better approach:** CourtListener (line 610, ALREADY in `use_cases.yaml`) supports party-name search for US courts via REST API. For EU, use the European e-Justice Portal's ECLI search or national databases (France: Légifrance Judilibre API, Germany: Bundesgerichtshof decisions, etc.).

**Line 610 of the plan has the RIGHT tool** (CourtListener) — task 22 ignores it and recommends the wrong one.

---

## 5. Error Paths

### Per-task error handling coverage

| Task | Happy path fails? | Specified? | What executor must guess |
|---|---|---|---|
| 1–2 | Template clone fails, npm install fails | ❌ | Retry? Fallback? |
| 3 | DB migration fails | ❌ | Line 1334 has rollback procedure but it's manual |
| 4 | Docker build fails | ❌ | What error to surface? |
| 5 | API calls fail during migration | ❌ | How to handle partial migration? |
| 6 | pip install conflicts | ❌ | Version pinning? Resolution strategy? |
| 7 | spaCy French NER returns garbage (30% instead of 70%) | ⚠️ Partial (line 995 — "fall back to LLM enrichment") | What if LLM also fails? |
| 7 | Password-protected PDF | ✅ (line 1097) | — |
| 7 | Image-only PDF → OCR fails | ⚠️ Partial (line 1098) | What if Tesseract produces gibberish? |
| 7 | Files > 10MB | ✅ (line 1101) | — |
| 7 | Corrupted files | ✅ (line 1100) | — |
| 8–11 | Frontend errors | ❌ | Generic "show error" but no pattern |
| 12 | OSS tool wrappers | ✅ (ToolResult pattern, line 1172) | — |
| 13–17 | Individual tool failures | ⚠️ (via task 12's ToolResult) | Tool-specific error messages? |
| 18–22 | External API failures | ❌ | OpenCorporates rate limit? OpenSanctions down? Fallbacks? |
| 23–27 | Various | ❌ | — |

### (a) OSS tool returns garbage
- **spaCy French NER:** Plan acknowledges 70-75% accuracy (line 995) and says "fall back to LLM enrichment." But what if LLM enrichment ALSO returns low confidence? The plan doesn't specify a "give up" threshold. Executor must define one.
- **social-analyzer:** Uncontrollable. If it returns 10,000 false positives, the backend endpoint times out. No filtering strategy specified.
- **GitHub API:** Rate-limited at 60 req/hour unauthenticated. Plan says "Use public API" (line 1211) — this will exhaust after checking 3-4 candidates.

### (b) External API is down
- **OpenCorporates:** No fallback specified. "200/month" rate limit (line 607) — but what about downtime?
- **OpenSanctions:** "100/hour" (line 608) — what if the API is down for maintenance?
- **EUR-Lex:** No fallback.
- **CourtListener:** No fallback.
- **Langfuse:** What if Langfuse is unreachable? Does the app fail or degrade gracefully?

Only LiteLLM has fallbacks configured (line 557). All non-LLM external APIs have zero resilience.

### (c) LLM returns malformed JSON
- **Plan says (line 477):** "Backend validates AI output against expected JSON schema; rejects outputs that deviate from the contract."
- **Plan does NOT say:** What happens after rejection. Retry? How many times? With what prompt modification? Fallback to mock data? Return error to user?
- **LiteLLM retries** (line 554) cover API failures, not validation failures. A malformed JSON response is a successful API call — LiteLLM won't retry it.

### (d) Database migration fails mid-phase
- **Plan says (line 1334):** "take a DB snapshot... If migration fails: stop backend, restore snapshot, fix migration, re-apply" — this is a MANUAL procedure.
- **No automated testing** of migrations before application.
- **SQLite DDL limitations:** Some ALTER TABLE operations are not transactional in SQLite. A multi-statement migration could leave the DB in an inconsistent state.
- **Alembic downgrade:** Plan says "Alembic migrations must include both `upgrade()` and `downgrade()`" (line 1334) — but auto-generated Alembic migrations DO include both. The warning is unnecessary if using autogenerate; it's a concern only for hand-written migrations.

---

## 6. Logging & Observability

### What IS traced/logged:
| What | Where | Specified at |
|---|---|---|
| AI calls (prompt, model, response, latency, tokens) | Langfuse | Line 799–800 |
| User actions (CRUD) | AuditLog DB table | Line 774 |
| HTTP requests | Request logging middleware | Line 803 |

### What is NOT traced/logged — gaps where bugs would be INVISIBLE:

| Gap | Impact |
|---|---|
| **Database writes** beyond AuditLog — no logging of INSERT/UPDATE/DELETE operations. A silent SQLite constraint violation caught by `except: pass` produces zero evidence. | Data corruption invisible |
| **External API calls** — OpenCorporates, OpenSanctions, EUR-Lex, CourtListener, GitHub API. If any returns unexpected data or fails silently, no trace exists. | Integration failures invisible |
| **spaCy pipeline** — NER accuracy, language detection results, parse confidence scores. If French NER drops to 30%, nobody knows unless a user reports it. | Quality degradation invisible |
| **File operations** — PDF reads, OCR runs, file deletions. If Tesseract.js silently fails on a scanned PDF, executor gets empty string with no error. | Silent data loss |
| **Cache hits/misses** — enrichment cache (line 1167), external API cache. No observability into cache effectiveness. | Performance blind spot |
| **SQLite query times** — plan sets <50ms target (line 722) but no measurement instrumentation. | Performance regression invisible |
| **AI call latency** — plan sets <30s need analysis, <45s matching (line 722) but no instrumentation beyond Langfuse (which may not be real-time). | Latency regression invisible |
| **Circuit breaker state** — task 12 specifies circuit breakers (line 1172) but no way to observe their state. | Degradation invisible |
| **Rate limit consumption** — LiteLLM tracks RPM but no dashboard or alerting. | Cost overruns invisible |

### What's missing from the `/health` endpoint (line 819):
- Langfuse connectivity status
- LiteLLM config load status
- External API reachability (OpenCorporates, OpenSanctions, etc.)
- spaCy model load status
- Cache hit ratio
- Pending migration status

### Log format, level, destination — all unspecified:
- **Where:** stdout? File? Syslog?
- **Format:** JSON structured? Plain text?
- **Levels:** What's ERROR vs WARNING vs INFO?
- **Correlation IDs:** No request tracing across frontend → backend → AI → DB

---

## 7. Configuration Drift

### Drift 1: `.env.example` DUPLICATED (lines 660–702 and 850–891)

The same `.env.example` content appears twice. The copies are nearly identical but not linked. If one is updated and the other isn't, the executor will follow the wrong one. The first copy (line 660) is under LiteLLM config section; the second (line 850) is under task 4. **Which is authoritative?**

### Drift 2: `MOCK_MODE` vs `VITE_MOCK_MODE` — CONTRADICTION

| Location | Variable name | Context |
|---|---|---|
| Line 702 | `MOCK_MODE=0` | `.env` — backend var? |
| Line 788 | `MOCK_MODE=1` | "Backend reads from `.env` (NOT prefixed with `VITE_` — this is a backend env var)" |
| Line 890 | `MOCK_MODE=0` | `.env.example` in task 4 — same variable? |
| Line 948 | `VITE_MOCK_MODE` | "VITE_MOCK_MODE still works" |
| Line 952 | `VITE_MOCK_MODE=1` | "allow guest access with VITE_MOCK_MODE=1" |

**Contradiction:** The plan says `MOCK_MODE` is a backend env var NOT prefixed with `VITE_` (line 788). But it also says `VITE_MOCK_MODE` controls guest access (line 952) and "still works" (line 948). Are these TWO separate variables or ONE? If separate, setting `VITE_MOCK_MODE=1` without `MOCK_MODE=1` would give guest access but the backend still calls OpenAI — breaking the mock guarantee.

**Executor must decide:** Use one variable for both, or document the two-variable split.

### Drift 3: Feature flag naming (lines 698–700, line 1332)

`VITE_ENABLE_INTEGRITY`, `VITE_ENABLE_VERIFICATION`, `VITE_ENABLE_PLATFORM` are `VITE_`-prefixed (client-side env vars, injected at build time). The FRONTEND reads them to conditionally render UI panels.

**But the BACKEND also needs to know** if these features are enabled — to disable API endpoints (should `/api/analyze/hidden-text` accept requests when integrity is disabled?).

**Gap:** No backend equivalent. If a user sends a direct curl to `/api/analyze/hidden-text` with `VITE_ENABLE_INTEGRITY=0`, does the backend reject it? The plan doesn't address this. Executor must decide.

### Drift 4: `llm_client.py` path breaks in Docker (line 627 vs line 841–844)

```python
# Line 627:
def __init__(self, config_path: str = "backend/config/use_cases.yaml"):
```

```dockerfile
# Lines 841–844:
WORKDIR /app
COPY backend/ .              # Copies CONTENTS of backend/ to /app/
# So /app/backend/config/ does NOT exist
# config lives at /app/config/use_cases.yaml
```

**BUG:** The default path in `llm_client.py` assumes `backend/` prefix, but Docker copies `backend/`'s contents directly to `/app/`. The config will NOT be found at runtime. Executor must fix the path or the Dockerfile.

### Drift 5: `DATABASE_URL` in `.env` vs `alembic.ini`

- `.env` (line 683): `DATABASE_URL=sqlite+aiosqlite:///data/talentift.db`
- `alembic.ini` (line 1036): Must also have `sqlalchemy.url`. Does it read `.env` via `alembic/env.py`? Or hardcoded?

If `alembic.ini` hardcodes a different URL than `.env`, migrations apply to the wrong database. Executor must wire them together — no plan guidance.

### Drift 6: `SECRET_KEY` validation absence (line 684)

Plan says "64 chars" but no validation code. If someone sets a 16-char key, JWT tokens are generated with a weak signing key. No startup check, no warning. Security gap.

### Drift 7: `ADMIN_PASSWORD` plaintext in `.env` (line 687)

Plan says "Must NOT hardcode admin credentials" (line 804) — but putting them in `.env` IS effectively hardcoding. `.env` is plaintext on disk with file permissions 644. The security posture is: "don't commit `.env`" (line 1336) but anyone with filesystem access reads the admin password.

**Suggestion:** Generate a random admin password on first seed, print it to stdout, and require change on first login. The `.env` values become "seed only, used once."

### Drift 8: Two `compose` files, no shared base (lines 814–828)

`compose.yml` and `compose.prod.yml` are separate files with no `compose.override.yml` pattern. Adding a new env var requires updating BOTH files. High maintenance drift risk.

### Drift 9: Backend URL configured in two places with two mechanisms

- Frontend dev: `base_url` defaults to `/api` (Vite proxy) or `http://localhost:8000/api` direct (line 930)
- Chrome extension: `BACKEND_URL` from extension storage, default `http://localhost:8000` (line 1286)

If the backend port changes, the executor must update BOTH. Extension storage is runtime-configurable but the frontend base_url is a hardcoded fallback. These will drift.

### Drift 10: `Provider routing summary` DUPLICATED (lines 648–657 and 704–714)

Two nearly identical tables describing the same providers appear at lines 648–657 and 704–714. The second copy adds a "How LiteLLM calls it" column in one but not the other. Which is the reference?

---

## Summary — Kill Chain (in order of execution risk)

1. **CRITICAL — Phase 3 false independence:** Tasks 18–20 say "Blocked by: Phase 2 complete" but need Phase 1 task 7's `ParsedResume`. Executor who follows the matrix will hit a wall. (§2 Seam F, §1 Task 19/20)

2. **CRITICAL — social-analyzer architectural impossibility:** You cannot wrap a browser-based Docker tool in a synchronous Python API endpoint. The plan's central dependency for task 18 doesn't work. (§4 Alarm 2)

3. **CRITICAL — `.env.example` duplicated with contradictions:** `MOCK_MODE` vs `VITE_MOCK_MODE` is not one variable. The executor must resolve the naming collision before any feature flag code is written. (§7 Drift 2)

4. **CRITICAL — `llm_client.py` path breaks in Docker:** The default config path assumes `backend/` prefix but Docker copies contents directly to `/app/`. Startup will fail. (§7 Drift 4)

5. **HIGH — Skills taxonomy CSV doesn't exist:** Task 7 needs it, no task creates it. The executor will spend 2-3 hours authoring a 200+ skill taxonomy from scratch. (§3)

6. **HIGH — PDF file lifecycle breaks deferred integrity checks:** Task 7 deletes files after 10 minutes. Tasks 13–14 are separate API endpoints that may be called later. (§2 Seam E)

7. **HIGH — Schema file merge conflicts:** 10+ tasks add Pydantic schemas. No file organization strategy. Guaranteed merge conflicts in `schemas/__init__.py`. (§2 Seam A)

8. **MEDIUM — EUR-Lex is a legislation DB, not a case-law search:** Task 22 won't return meaningful results. CourtListener IS in the config but the task ignores it. (§4 Alarm 7)

9. **MEDIUM — `juliosuas/ghost` is a Ghost CMS theme, not an OSINT tool:** Task 18 will waste time searching for a nonexistent tool. (§4 Alarm 4)

10. **MEDIUM — Perplexity analysis needs a language model:** `textstat` doesn't compute perplexity. Executor must either add a GPT-2 dependency or drop the signal. (§4 Alarm 6)
