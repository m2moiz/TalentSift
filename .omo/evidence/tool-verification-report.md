# OSS Tool Integration Verification Report

**Generated**: June 26, 2026
**Source Plan**: `.omo/plans/feature-roadmap.md` (V1)
**Methodology**: 9 parallel agents verified each tool against PyPI, npm, GitHub, and official docs

---

## EXECUTIVE SUMMARY

| Severity | Count | Tools Affected |
|----------|-------|----------------|
| 🚨 **CRITICAL** — integration BLOCKED | 4 | sqlalchemy-libsql/libSQL, holehe, thinkst-zippy API, EUR-Lex API |
| ⚠️ **HIGH** — wrong version/API/size | 6 | pdfjs-dist, tesseract.js, transformers ai-detector, mammoth, radon, maigret import |
| ⚡ **MEDIUM** — license/version drift | 4 | fastapi-users (pyjwt), fastapi-template (Python 3.14), magicui CLI, pdfplumber opacity |
| ✅ **PASS** — verified correct | 7 | LiteLLM, Alembic, PyGithub, Langfuse, CourtListener API, WXT, Fairlearn |

---

## 🚨 CRITICAL DEVIATIONS (Integration Blocked)

### 1. sqlalchemy-libsql / libSQL — VERSION AND CONNECTION STRING WRONG

| Claim in Plan | Reality |
|---------------|---------|
| `sqlalchemy-libsql>=0.3` | Latest is **0.2.0** (May 2025) — no `>=0.3` exists |
| `libsql>=0.6` (package `libsql`) | Actual package is `libsql-experimental` at **0.1.11** |
| Connection string: `libsql:///data/talentift.db` | Correct: `sqlite+libsql:///` (sync) or `sqlite+aiolibsql:///` (async) |
| "Write queue for production concurrency" | **FALSE** — libSQL does NOT support concurrent writes (per Turso official docs). Only Turso Database (`pyturso`) has MVCC. |
| "Standalone embedded DB" | Partially true — works locally but primary use case is Turso Cloud client |

**Fix**: Pin `sqlalchemy-libsql>=0.2.0`, use `sqlite+aiolibsql:///data/talentift.db`, remove concurrency claims.

### 2. holehe — ABANDONED, WRONG API, WRONG LICENSE

| Claim in Plan | Reality |
|---------------|---------|
| `pip install holehe>=1.7` | Latest is **1.61** (July 2022) — **no releases in 4 years** |
| `from holehe import core; results = await core.launch(email, list(core.get_functions()))` | No `launch()` function exists. Uses **trio**, not asyncio. Not designed as a library — CLI-only. |
| "MIT license" | Actually **GPL-3.0** — significant compliance risk for commercial use |

**Fix**: Replace holehe entirely. Options: (a) subprocess call to holehe CLI, (b) use maigret for email profiling too, (c) find alternative email breach checker.

### 3. thinkst-zippy (ZipPy) — API DOES NOT EXIST

| Claim in Plan | Reality |
|---------------|---------|
| `import zippy; result = zippy.classify(cv_text)` | **No `classify()` function exists**. Correct API: `Zippy().run_on_text_chunked(text)` returns `("AI"/"Human", confidence_float)` |

**Fix**: Replace all `zippy.classify()` with `Zippy().run_on_text_chunked()` or `EnsembledZippy().run_on_text_chunked()`.

### 4. EUR-Lex API — URL DOES NOT EXIST

| Claim in Plan | Reality |
|---------------|---------|
| `https://eur-lex.europa.eu/api` | **404**. EUR-Lex uses SOAP webservice (WSDL) + Cellar SPARQL endpoint. Not a REST API at that URL. |

**Fix**: Use Cellar SPARQL REST API: `http://publications.europa.eu/webapi/rdf/sparql` or register for SOAP webservice.

---

## ⚠️ HIGH DEVIATIONS (Wrong Versions / APIs / Sizes)

### 5. pdfjs-dist — TWO MAJOR VERSIONS BEHIND

| Plan | Reality |
|------|---------|
| `pdfjs-dist@4.9` | **6.0.227** — v4→v6 has breaking changes (ESM-only, worker path changes) |

**Fix**: Pin `pdfjs-dist@^6.0.0`. Configure `GlobalWorkerOptions.workerSrc` with Vite's `?url` import.

### 6. tesseract.js — TWO MAJOR VERSIONS BEHIND

| Plan | Reality |
|------|---------|
| `tesseract.js@5.1` | **7.0.0** — v5→v7 has breaking changes (LSTM-only core, new `createWorker()` API) |

**Fix**: Pin `tesseract.js@^7.0.0`. Update `createWorker()` API usage.

### 7. transformers ai-detector model — SIZE 2.7× WRONG, WRONG LICENSE

| Claim in Plan | Reality |
|---------------|---------|
| "500MB model" | Actual F32 weights: **1.35 GB** (354M params). HF repo total: 2.7 GB |
| "Actively maintained (2025)" | Last modified **Dec 17, 2024** — stale 18 months |
| Assumed standard open-source license | **SAIPL** (SuperAnnotate AI Public License) — AGPL-like copyleft |
| "Fine-tuned on balanced RAID dataset" | Only **50%** RAID data; half is custom-generated |

**Fix**: Update size estimate, flag SAIPL for legal review, consider alternatives (`roberta-large-openai-detector`).

### 8. mammoth — VERSION OUTDATED

| Plan | Reality |
|------|---------|
| `mammoth@1.8` | **1.12.0** — no breaking changes but 4 minor releases behind |

**Fix**: Pin `mammoth@^1.12.0`.

### 9. radon — PYTHON 3.12 COMPAT UNKNOWN

| Claim in Plan | Reality |
|---------------|---------|
| `radon>=6.0` | 6.0.1 (March **2023**). Official classifiers only to Python **3.9**. May not work on 3.12. |

**Fix**: Test on Python 3.12 before committing. lizard covers cyclomatic complexity and is actively maintained.

### 10. maigret — WRONG IMPORT PATH AND MISSING REQUIRED ARGS

| Plan Claim | Reality |
|------------|---------|
| `from maigret.maigret import search` | Correct: `from maigret import search as maigret_search` |
| `await search(username="target")` | Missing required args: `site_dict` and `logger` |

**Fix**: Use correct import, pass `MaigretDatabase().ranked_sites_dict()` and logger.

---

## ⚡ MEDIUM DEVIATIONS

### 11. fastapi-users — WRONG JWT DEPENDENCY
Plan references `python-jose[cryptography]>=3.3`. Reality: fastapi-users v15 uses `pyjwt[crypto]>=2.12.0`. Remove `python-jose` from deps.

### 12. fastapi/full-stack-fastapi-template — PYTHON 3.14 NOT 3.12
Template now targets **Python 3.14** (`.python-version`, Dockerfile, pyproject.toml). If you need 3.12, pin an older release tag (v0.8.x).

### 13. magicui CLI — BROKEN
`npx magicui-cli add` crashes with PostHog API key error. Copy-paste from GitHub is the correct approach (plan already says this).

### 14. pdfplumber — NO PER-CHAR OPACITY
Plan assumes opacity detection on chars. pdfplumber does NOT provide opacity per character. Use color/size heuristics instead.

### 15. Langfuse callback — PREFER OTEL PATH
Plan uses `litellm.success_callback = ["langfuse"]` (old). Current recommended: `litellm.callbacks = ["langfuse_otel"]` (OpenTelemetry). Both work.

---

## VERSION PIN CORRECTIONS

```toml
# Python deps — PLAN → CORRECTED
litellm>=1.89.4                        # was: unpinned
fastapi-users[sqlalchemy]>=15.0        # was: >=14.0
sqlalchemy[asyncio]>=2.0.51            # was: >=2.0
alembic>=1.16.3                        # was: >=1.14 (bump for async template)
sqlalchemy-libsql>=0.2.0               # was: >=0.3 (doesn't exist!)
# Remove: libsql>=0.6                  # does not exist as described
pdfplumber>=0.11.10                    # was: >=0.11
thinkst-zippy>=0.1.3                   # was: >=0.1.3 (correct, but dormant 16 months)
transformers>=4.45                     # was: >=4.40
torch>=2.12                            # was: >=2.0
PyGithub>=2.9                          # was: >=2.3
maigret>=0.6                           # was: >=0.5
# Remove: holehe>=1.7                  # abandoned 2022, GPL-3.0, can't use as library
# Remove: python-jose[cryptography]    # replaced by pyjwt[crypto] in fastapi-users v15
langfuse>=4.12                         # was: unpinned with LiteLLM callback

# npm deps — PLAN → CORRECTED
pdfjs-dist@^6.0.0                      # was: @4.9
mammoth@^1.12.0                        # was: @1.8
tesseract.js@^7.0.0                    # was: @5.1
```

---

## TOOLS VERIFIED CORRECT (NO CHANGES NEEDED)

| Tool | Version | Verified |
|------|---------|----------|
| **LiteLLM** | 1.89.4 | ✅ `litellm.acompletion()` confirmed, YAML config confirmed, Python 3.12 ✅ |
| **Alembic** | 1.18.5 | ✅ async migrations supported, no breaking changes affecting SQLite |
| **PyGithub** | 2.9.1 | ✅ `from github import Github` confirmed, LGPL, 3.12 compatible |
| **Langfuse** | 4.12.0 | ✅ Installable, OTEL callback confirmed, self-hosted Docker stack doc confirmed |
| **CourtListener API** | v4 REST | ✅ `https://www.courtlistener.com/api/rest/v4/` returns 200, active |
| **WXT** | 0.20.27 | ✅ `pnpm create wxt` confirmed, MIT, 874k weekly downloads |
| **Fairlearn** | 0.14.0 | ✅ Python 3.12 classifiers, `MetricFrame` confirmed, MIT |
| **shadcn-dashboard-landing-template** | GitHub repo | ✅ MIT, React 19 + Tailwind 4 + Vite 7, git clone confirmed |
| **SQLAlchemy 2.0** | 2.0.51 | ✅ `create_async_engine` confirmed, 3.12 compatible |
| **framer-motion** (for magicui) | 12.42.0 | ✅ `motion/react` imports confirmed in magicui components |

---

## RISK REGISTER (for plan update)

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| holehe unusable as library | High | Phase 3 blocked | Replace with maigret-based email checks or CLI subprocess |
| sqlalchemy-libsql experimental status | Medium | Phase 0 data layer | Accept risk for V1; migrate to pyturso for V2 |
| ai-detector SAIPL license | Medium | Legal review needed | Swap to `roberta-large-openai-detector` or get SAIPL legal clearance |
| radon Python 3.12 incompatibility | Medium | Phase 2 code metrics | Fall back to lizard (covers cyclomatic complexity; actively maintained) |
| thinkst-zippy dormant 16 months | Low | Phase 2 AI detection | Accept for V1; supplemental to RoBERTa classifier |
| EUR-Lex SOAP API complexity | Medium | Phase 3 court records | Use Cellar SPARQL REST API as simpler alternative |

---

## V2-DEFERRED TOOLS STATUS CHECK

| Tool | Status | Notes |
|------|--------|-------|
| PyDriller 2.9 | ✅ Installable | Latest 2.9, plan `>=2.6` fine |
| lizard 1.23.0 | ✅ Installable | Released Jun 2, 2026 — actively maintained |
| radon 6.0.1 | ⚠️ At-risk | Last release 2023, Python 3.12 unknown |
| Fairlearn 0.14.0 | ✅ Installable | Released Jun 7, 2026, Python 3.12 classifiers |
| WXT 0.20.27 | ✅ Installable | MIT, framework agnostic, 874k weekly downloads |
| CourtListener API | ✅ Active | REST v4 returns 200, documented |
| EUR-Lex API | 🚨 Wrong URL | Plan's REST URL 404s; real API is SOAP + Cellar SPARQL |

---

*Generated by 9 parallel verification agents against live PyPI, npm, GitHub, and official docs — June 26, 2026*
