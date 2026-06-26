# Adversarial Review Summary — `feature-roadmap.md`

**Plan file:** `.omo/plans/feature-roadmap.md`  
**Final commit:** `c88eee3`  
**Total review rounds:** 7  
**Total agents deployed:** 25+ (Momus ×4, Oracle ×4, Deep ×15+, Metis ×1, specialized fix-design ×5, contract review ×5)  
**Total findings:** ~300+ across all rounds  
**Total fixes applied:** All resolved

---

## Round 1 — Initial Adversarial Review (Momus + Metis)
**Date:** Session start  
**Agents:** 2 (Momus adversarial, Metis gap analysis)  
**Findings:** 25 (8 HIGH, 12 MEDIUM, 5 LOW)

**Key findings resolved:**
- Auth scope contradiction (TL;DR said "no auth", Phase 0 built full auth)
- PACER paid API violation (replaced with CourtListener + EUR-Lex)
- File-discard vs Phase 2 dependency (raw PDF now stored temporarily)
- Langfuse audit trail too late (moved to Phase 0)
- OpenAI API key exposure in browser (all calls route through backend proxy)
- TokenResponse schema mismatch (TS mirror fixed)
- "Cannibalize, don't build" vs custom NLP (replaced with OSS alternatives)
- Preference storage conflict (localStorage vs DB-backed)
- Prompt injection defense added
- CV PII plaintext storage noted
- GDPR/privacy strategy added

---

## Round 2 — Deep Review Follow-up
**Date:** Session start (continued)  
**Agents:** 2 (Momus, Metis continuation)  
**Findings:** 20 (HIGH, MEDIUM)

**Key findings resolved:**
- Rate limiting added to task 3
- CSRF protection added
- Structured logging + observability
- Performance targets defined
- Data deletion/export APIs added
- AuditLog retention policy
- DB backup strategy
- Graceful degradation for OSS tools
- Feature flags for rollback safety
- API key rotation procedure
- Accessibility targets (WCAG 2.1 AA)

---

## Round 3 — Centralized LLM Configuration
**Date:** Same session  
**Agents:** 1 (manual review)  
**Findings:** Centralized LLM/API config gap

**Key finding resolved:**
- All AI calls hardcoded to single OpenAI model
- Added `backend/config/llm.yaml` + `use_cases.yaml` + `llm_client.py` wrapper
- Later replaced with **LiteLLM** (MIT, 17k+ stars) — cannibalize, don't build
- Supports 6 providers: OpenAI, Codex, OpenRouter, Claude, Local, Z.AI

---

## Round 4 — Fourth Adversarial Review (Momus + Oracle + Deep)
**Date:** Mid-session  
**Agents:** 3 (Momus adversarial, Oracle risk audit, Deep complexity audit)  
**Findings:** 14 (7 CRITICAL, 4 HIGH, 3 MEDIUM)

**Key findings resolved:**
- Phase 3 dependency matrix wrong (tasks need ParsedResume from task 7)
- social-analyzer has no Python API (replaced with maigret + holehe)
- `juliosuas/ghost` doesn't exist (purged)
- `satwik146/gitreal` is empty repo (replaced with PyGithub + PyDriller)
- `helix` assigned wrong role (replaced with holehe)
- PDF 10-min TTL breaks Phase 2 (changed to synchronous processing)
- MOCK_MODE vs VITE_MOCK_MODE confusion (standardized)
- Skills taxonomy CSV doesn't exist (replaced with LLM-based extraction)
- Schema merge hell (added file-per-schema strategy)
- 19/20 deps have no version pins (all pinned)
- `textstat` wrong tool for AI detection (replaced with ZipPy + RoBERTa)
- EUR-Lex ≠ case-law (CourtListener added)
- Build-vs-cannibalize scorecard improved (7→13 tasks cannibalize)

---

## Round 5 — Deep Research + Integration Verification
**Date:** Mid-session  
**Agents:** 5 (Integration docs, I/O schema, parallel execution, Momus, Oracle)  
**Findings:** ~95 (across all agents)

**Key findings resolved:**
- 15 Phase 2-4 endpoints had no API path in master list (backfilled)
- No ErrorResponse schema (added + endpoint mapping table)
- GitHubAnalysisResult missing from contracts (added with 6 sub-models)
- Pydantic v1 `from_orm()` in v2 plan (replaced with `model_validate()`)
- No `.dockerignore` (added to task 4)
- YAML keys with hyphens unquoted (quoted)
- No file upload size limit (added MAX_UPLOAD_SIZE=10MB)
- Task 16/22 V1/V2 ambiguity (clarified)
- 4 endpoints orphaned (assigned or marked V2)
- Router auto-discovery for merge-conflict-free parallel dev
- Worktree execution strategy designed
- Critical path: 9 steps → identified
- Wave 2+3 merging saves ~3-4 days

---

## Round 6 — Fix Design + Contract Review
**Date:** Late session  
**Agents:** 9 (5 fix-design + 4 review)  
**Findings:** ~45

**Key findings resolved:**
- libSQL version corrected (0.2.0, connection string `sqlite+aiolibsql:///`)
- `llm_client.py` missing `import os` (fixed)
- mock_mode vs mock_status contradiction (standardized)
- Refresh token cookie mechanism designed
- Admin seed mechanism designed
- useOpHistory vs usePreferenceLibrary conflict resolved
- All stale spaCy/BERT references purged for V1
- holehe dropped from V1 (abandoned 2022, GPL-3.0)
- zippy API corrected (`Zippy().run_on_text_chunked()`)
- ai-detector model size fixed (1.35GB not 500MB)
- Version bumps: pdfjs-dist 4.9→6.0, mammoth 1.8→1.12, tesseract 5.1→7.0
- EUR-Lex URL fixed to SPARQL endpoint
- Docker RAM 1G→2G
- SQLite → libSQL migration (standalone embedded DB, async I/O)
- Worktree merge integrity (Rule 13.1) added

---

## Round 7 — Final Contract Audit (Schema + API + Seams + Best Practices + Edge Cases)
**Date:** Final session  
**Agents:** 5 (Schema audit, API contracts, Integration seams, Best practices, Edge cases)  
**Findings:** ~95

**Key findings resolved:**
- 27 schema findings (7 GAPs, 20 WARNINGS) — all fixed
- 32 API findings (23 GAPs, 9 WARNINGS) — all endpoints backfilled
- 57 integration seams audited — 12 MISSING resolved
- 36 best-practice findings (4 ANTI-PATTERNs) — all fixed
- 25 edge-case findings — all gaps closed
- ErrorResponse canonical schema added
- Endpoint→Schema mapping table (34 endpoints)
- Missing schemas: GitHubAnalysisResult, ToolResult, CvFileUploadResponse, AuditLogRead, BiasReport
- `from_orm()` → `model_validate()` (Pydantic v2)
- `.dockerignore` + upload size limit
- ORM relationship() back-populates requirement
- CORS allow_credentials=true
- models/__init__.py importlib auto-discovery

---

## Task Split Rounds (Applied Throughout)
**Tasks split for maximum parallelism:**
- Task 3 → 3a, 3b, 3c-1, 3c-2, 3c-3, 3d, 3e (7 subtasks, was 1)
- Task 4 → 4a, 4b (2 subtasks, was 1)
- Task 5 → 5a, 5b, 5c (3 subtasks, was 1)
- Task 6 → 6a, 6b, 6c (3 subtasks, was 1)
- Task 7 → 7a, 7b (2 subtasks, was 1)
- Task 12 → 12a, 12b (2 subtasks, was 1)
- Task 11 merged into 10 (1 less task)

**Final V1 count:** 34 subtasks (was 28)
**Worktree wall-clock:** ~1 day (34 parallel agents, bottleneck ~1h)

---

## Final Plan State
- **34 V1 subtasks** across 4 phases
- **5 V2 deferred** tasks (16, 22, 23, 25, 26)
- **All contracts explicitly defined:** 34 endpoints mapped, 50+ Pydantic models, 4 AI prompt templates
- **All OSS tools verified:** version pins, import paths, licenses confirmed
- **Worktree execution strategy:** merge order, conflict resolution, lockfile regeneration
- **0 remaining blockers** — plan is execution-ready

## Supporting Files
- `.omo/plans/feature-roadmap.md` — main plan (1757 lines)
- `.omo/drafts/feature-roadmap.md` — approval-gate draft
- `.omo/evidence/adversarial-executor-report.md` — execution fidelity audit (Round 4)
- `.omo/evidence/tool-verification-report.md` — OSS tool integration verification
- `.omo/audit-oss-report.md` — OSS cannibalization gap audit
- `.omo/audit-seams-feature-roadmap.md` — integration seam audit
- `.omo/plans/ARCHITECTURE-FIXES.md` — architecture fixes (router auto-discovery, Vite proxy, slot system)
- `.omo/plans/boundary-fixes.md` — V1/V2 boundary fixes
- `.omo/plans/worktree-conflict-audit.md` — worktree parallelism gap audit
