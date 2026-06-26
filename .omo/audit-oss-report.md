# OSS Audit Report — feature-roadmap.md
**Auditor**: Sisyphus-Junior | **Date**: 2026-06-26 | **Plan**: `.omo/plans/feature-roadmap.md` (1345 lines)
**Thesis**: "Cannibalize, don't build" | **Verdict**: Thesis is stated but violated in at least 6 places; 2 OSS dependencies don't exist; critical version pinning is absent.

---

## 1. Build-From-Scratch Violations

### VIOLATION 1: Custom spaCy Resume Parser (Task 7, lines 1056–1125)
**What the plan proposes building** (line 1068–1080): A custom multi-layer NLP pipeline including: language auto-detection, custom NER using `en_core_web_sm` + `fr_core_news_sm`, regex patterns for email/phone/URLs, a curated skills taxonomy CSV with fuzzy matching via `thefuzz`, experience date parsing with surrounding text blocks, education institution matching via keyword lists, and per-field confidence scoring. Est. 20–30h of custom NLP work.

**The plan's own justification** (line 1069): _"Building a custom spaCy NER pipeline is a deliberate exception to the 'cannibalize, don't build' thesis. pyresparser is unmaintained (2019, Python 3.7, no French), and no satisfactory OSS alternative exists."_

**OSS alternative**: [`wespiper/pyresume`](https://github.com/wespiper/pyresume) — A maintained Python resume parser that extracts structured data from PDF, DOCX, and TXT resumes with built-in confidence scoring. Uses `pdfplumber` + `python-docx` for extraction. Architecture includes: `parser.py` (main ResumeParser class), `models/resume.py` (Resume, Experience, Education data models), `extractors/` (PDF/DOCX/text), `utils/patterns.py` (regex), `utils/dates.py`, `utils/phones.py`. **Not present on PyPI but functional from GitHub.**

**Time savings**: ~25h saved (custom 20–30h pipeline → ~5h integration + testing of pyresume). The plan's estimate of 20–30h for the custom pipeline (line 88) could be reduced to ~5h.

**Counter-point**: pyresume may not support French as well as a custom pipeline. However, the plan's own assessment of spaCy French NER accuracy is "~70–75% F1" (line 995). pyresume would at minimum handle English resumes with zero custom code. The plan could fork pyresume and add French support rather than starting from scratch.

**Lines**: 991, 995, 1068–1080, 1027 (references `resume_parser.py` still listing `pyresparser`)

---

### VIOLATION 2: AI-Generated CV Detection (Task 15, lines 1200–1207)
**What the plan proposes building**: A "multi-signal detection" system from scratch using `textstat` for readability metrics + `nltk` for basic NLP. Signals: text perplexity/variance analysis, section-level readability shifts, common AI-writing markers (em-dashes, "delve", "robust", "spearheaded"). All rule-based, all custom.

**OSS alternatives**:
| Tool | License | How | Time Saved |
|------|---------|-----|------------|
| [`eric-mitchell/detect-gpt`](https://github.com/eric-mitchell/detect-gpt) | MIT | Zero-shot ML detection using probability curvature. pip-installable (`pip install -r requirements.txt`). Academic paper-backed. | ~10h |
| `pangram-sdk` (PyPI) | Proprietary (free tier) | `pip install pangram-sdk` — dedicated AI detection API with Python SDK, batch operations, sliding window. | ~12h |
| GLTR (MIT) | MIT | Giant Language Model Test Room — visual AI detection tool, browser-based but with a programmable backend. | ~5h |
| GPTZero API | Commercial (free tier) | REST API for AI detection. | ~10h |

**The problem with `textstat`**: It measures Flesch-Kincaid readability, not AI-generation signals. Using it for AI detection is like using a thermometer to measure distance — wrong tool for the job. The plan would need ~200+ lines of custom signal engineering code.

**Lines**: 1200–1207

---

### VIOLATION 3: Hidden Text Detection Rebuild (Task 13, lines 1182–1189)
**What the plan proposes**: "Wrap `pdf-injection-scanner` logic" but then describes building from scratch: "open PDF with pdfplumber, iterate characters, flag any with font_size < 4pt, color matching background, or opacity < 0.1" (lines 1183–1184).

**The OSS tool EXISTS as a pip package**: `pip install pdf-injection-scanner` (MIT, Andy8647/pdf-injection-scanner). It already:
- Detects white/near-white fill color text (HIGH severity)
- Flags text smaller than 2pt (HIGH severity)
- Finds off-page text (HIGH severity)
- Has 30+ regex patterns for prompt injection phrases (EN + CN)
- Returns structured results (page, severity, type, content)

The plan says "git clone into backend/tools/" (line 1176) but it's a **pip-installable package**. `git clone` is the wrong approach. The plan also proposes duplicating its core logic manually with pdfplumber (lines 1183–1186), which is what the tool already does internally.

**Time savings**: ~4h saved (custom pdfplumber character iteration → `pip install pdf-injection-scanner` + thin wrapper).

**Lines**: 1176, 1182–1189

---

### VIOLATION 4: Keyword Stuffing Analysis (Task 17, lines 1218–1225)
**What the plan proposes building**: Custom frequency analysis using `nltk` for tokenization + custom section-level density computation + JD keyword overlap.

**This is marginally justified** — it's ~100 lines of code and most dedicated SEO/keyword stuffing tools are web-based (Yoast, etc.) not Python libraries. However, for the `nltk` dependency specifically: **nltk is a ~200MB install** (with corpora). The plan already has spaCy (line 992, 1071) which handles tokenization better and faster. Installing nltk JUST for tokenization is wasteful.

**Suggestion**: Use spaCy (already installed) for tokenization + frequency analysis. Drop nltk from dependencies entirely (lines 1203, 1221). Reduces the dependency surface by one library and ~200MB of disk.

**Lines**: 1203 (AI detection nltk), 1221 (keyword stuffing nltk)

---

### VIOLATION 5: GitHub Skill Cross-Reference from a Non-Existent Library (Task 16, lines 1209–1217)
**What the plan proposes**: Use `satwik146/gitreal` approach, "reimplement the approach using gitpython" (line 1212).

**Reality**: `satwik146/gitreal` has a GitHub repo that shows ONLY a pull requests page with zero content. No code, no README, no releases. It is effectively non-existent. The plan is not "cannibalizing" — it's building from scratch under the pretense of using an OSS library that doesn't exist.

**OSS alternative**: Use the GitHub Search API directly (`GET /search/users?q=fullname+skills`) + GitHub REST API for repo language analysis. This is a thin ~80-line wrapper — not a heavy dependency. No external library needed beyond `httpx` (already in plan, line 996).

**Lines**: 1174, 1176, 1212

---

### VIOLATION 6: Bias Reports (Task 26, lines 1304–1311)
**What the plan proposes building**: Custom statistical analysis: score distribution by group, rejection rate by group, average score delta, disparity flag computation. Plus `gender-guesser` for name inference.

**OSS alternatives**:
| Tool | License | What It Does |
|------|---------|-------------|
| [`AIF360`](https://github.com/Trusted-AI/AIF360) (IBM) | Apache 2.0 | Comprehensive fairness metrics (disparate impact, statistical parity, equalized odds) + bias mitigation algorithms. `pip install aif360`. |
| [`Fairlearn`](https://github.com/fairlearn/fairlearn) (Microsoft) | MIT | Fairness assessment + unfairness mitigation. `pip install fairlearn`. |
| [`LangFair`](https://github.com/cvs-health/langfair) (CVS Health) | MIT | LLM-specific bias/fairness evaluation with counterfactual generation. `pip install langfair`. |
| [`Dbias`](https://github.com/dreji18/dbias) | MIT | End-to-end bias detection, recognition, masking, and de-biasing pipeline. `pip install Dbias`. |

**The `gender-guesser` problem**: `gender-guesser` on PyPI (v0.4.0) was last released **December 2016** — 10 years unmaintained. GPLv3 license. Using this in a 2026 build is a liability. Any of the fairness toolkits above provide better name-inference or protected-attribute analysis.

**Time savings**: ~8h (custom → `pip install fairlearn` + thin integration layer).

**Lines**: 1307

---

## 2. Wrong-Library Alerts

### ALERT 1: `satwik146/gitreal` — NON-EXISTENT (lines 1176, 1212)
**Claim**: "`satwik146/gitreal` (git clone into backend/tools/)" — task 12, line 1176. "Use `gitreal`'s approach" — task 16, line 1210.
**Reality**: GitHub repo exists at `/satwik146/gitreal` but contains **no code**. Only a pull requests tab is visible. No commits, no README, no files. This library does not exist and cannot be used.
**Impact**: Task 16 (GitHub cross-ref) has no usable upstream. The plan's "cannibalize" claim is false for this dependency.

---

### ALERT 2: `juliosuas/ghost` — DOES NOT EXIST (line 1232)
**Claim**: "`juliosuas/ghost` (MIT)" for ghost profile detection — task 18, line 1232.
**Reality**: No repository found at `github.com/juliosuas/ghost`. No PyPI package. No trace of this author or tool in the OSINT ecosystem. The closest match is `elm1nst3r/GHOST-osint-crm` — which is a **CRM/investigation management platform**, not a profile detection tool.
**Impact**: One of three Phase 3 OSINT tools is entirely fictional. The plan's identity verification pipeline (line 1230–1236) would lose 33% of its tooling.

---

### ALERT 3: `thalha-a9/helix` — CLI-ONLY, WRONG USE CASE (line 1232)
**Claim**: "Wrap `helix` for data breach checks" — task 18, line 1230.
**Reality**: Helix IS real (MIT, ~500 stars, Python 3.9+, aiohttp-based). But:
- It is a **username enumeration tool** (like Sherlock/Maigret) — scans social platforms for profile existence.
- It does NOT do data breach checks. The plan assigns it a role (breach detection) it does not fulfill.
- It is CLI-only (`python helix.py -u targetusername`). No Python API, no importable module. Subprocess call required.
- The industry-standard breach checker is **holehe** (`megadose/holehe`, `pip install holehe`) which checks email addresses across 120+ services for account registration/breach exposure.

**Recommendation**: Replace helix with `holehe` (breach/presence check via email) or `h8mail` (breach data aggregator). Both are pip-installable with Python APIs.

---

### ALERT 4: `textstat` for AI Detection (line 1203)
**Claim**: "Use `textstat` for readability" in AI-generated CV detection.
**Reality**: textstat v0.7.4 (latest on PyPI) computes: Flesch Reading Ease, Flesch-Kincaid Grade, Fog Scale, SMOG Index, Automated Readability Index, Coleman-Liau, Linsear Write, Dale-Chall. These measure **text complexity** for education-level targeting. They have **zero signal** for AI-vs-human writing discrimination. A human-written CV and a ChatGPT CV will have nearly identical readability scores.
**Impact**: The AI detection feature (Task 15) has no functional signal from its primary OSS dependency.

---

### ALERT 5: `nltk` as a Dependency (lines 1203, 1221)
**Claim**: Use `nltk` for "basic NLP" (AI detection) and "tokenization + frequency analysis" (keyword stuffing).
**Reality**: nltk with corpora is a ~200MB install. The plan already has **spaCy** (lines 992, 1071) which:
- Has faster, more accurate tokenization than nltk
- Handles frequency analysis natively via `Doc.count_by()`
- Is already installed and loaded

Installing nltk for tokenization when spaCy is already present is like buying a second car because you need windshield wipers.

**Recommendation**: Drop nltk entirely. Use spaCy's built-in tokenization and frequency analysis. Remove from `requirements.txt`.

---

### ALERT 6: `gender-guesser` — 10 YEARS UNMAINTAINED (line 1307)
**Claim**: "`gender-guesser` (pip) for name inference" in bias reports.
**Reality**: PyPI package `gender-guesser` v0.4.0, last released **December 5, 2016**. Author: Israel Saeta Pérez. GPLv3 license. 10 years without updates means: no Python 3.12+ compatibility guarantees, no maintained name databases, no fixes for modern name patterns.
**Recommendation**: Replace with `genderize.io` API (free tier, 1000 names/day, maintained) or use Fairlearn/AIF360's built-in protected attribute handling.

---

## 3. Missing Glue

### MISSING GLUE 1: `social-analyzer` Integration Method (lines 1176, 1230, 1232)
**What the plan says**: "Wrap `social-analyzer` for social media presence" (line 1230).
**What's missing**:
- social-analyzer **can** be used as a Python object: `from social_analyzer import SocialAnalyzer; sa = SocialAnalyzer(); results = sa.run_as_object(username='johndoe')`
- But the plan doesn't specify WHICH integration path: Python object API? CLI subprocess? Docker container? Node.js web app?
- The Python package requires Firefox ESR + tesseract-ocr system dependencies (not in any Dockerfile)
- The tool has **3 surfaces**: Node.js web app, Node.js CLI, and Python CLI/package. Which one does the FastAPI backend call?
- **Subprocess safety**: If calling CLI via subprocess, need: timeout handling (scans can take minutes), error parsing (STDERR vs STDOUT), sanitized username input (no shell injection)

**Lines with the gap**: 1176, 1230, 1232

---

### MISSING GLUE 2: `helix` Programmatic Invocation (line 1230, 1232)
The plan says to use helix for "data breach checks" but:
- Helix is CLI-only: `python helix.py -u targetusername`
- No Python API, no importable module, no pip package
- Must be called via `subprocess.run()` — the plan says NOTHING about subprocess safety, timeout handling, or output parsing
- Helix uses aiohttp internally for async scanning — calling it synchronously from FastAPI will block the event loop

**Lines**: 1230, 1232

---

### MISSING GLUE 3: `gitreal` Approach Reimplementation (lines 1176, 1212)
**What the plan says**: "reimplement the approach using gitpython" (line 1212).
**What's missing**:
- What IS "the approach"? The upstream repo has no code. There's no design document.
- The plan says to install `gitpython` (line 1174) — but how does gitpython connect to GitHub's API? gitpython is for local git operations, not GitHub API calls.
- The task spec says "search GitHub for matching profiles" (line 1210) — this requires the GitHub REST API, not local git operations.

**Lines**: 1174, 1176, 1210–1213

---

### MISSING GLUE 4: `pdf-injection-scanner` Integration (lines 1176, 1183)
**What the plan says**: "git clone into backend/tools/" (line 1176); "wrap `pdf-injection-scanner` logic" (line 1183).
**What's missing**:
- The tool IS a pip package (`pip install pdf-injection-scanner`). The `git clone` approach is wrong.
- Can it be imported programmatically? The repo has `pdf_injection_scanner/` directory suggesting yes, but docs only show CLI use: `pdf-scan file.pdf`
- If CLI-only, subprocess safety concerns apply: file path injection, timeout handling, output parsing

**Lines**: 1176, 1182–1189

---

### MISSING GLUE 5: Langfuse + LiteLLM Integration Wiring (lines 498, 794)
**What the plan says**: "LiteLLM has native Langfuse callback" (line 794).
**What's missing**:
- The code sample (lines 616–644) shows `LLMClient` calling `litellm.acompletion()` but does NOT include the Langfuse callback configuration
- LiteLLM's Langfuse integration requires: `litellm.success_callback = ["langfuse"]` AND `litellm.failure_callback = ["langfuse"]` AND environment variables (`LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY`)
- The `.env.example` (lines 692–693) has the env vars but the `llm_client.py` code (lines 616–644) doesn't wire the callbacks. The executor must discover this gap and add 2 lines of code.

**Lines**: 616–644, 498, 794

---

## 4. Library Version Pinning

### Pinned (1 out of 20+):
| Library | Pin | Line |
|---------|-----|------|
| `tesseract.js` | `@5` (major version) | 978 |
| `fastapi-users` | `>=14` (loose minimum, not a pin) | 987 |

### UNPINNED — Critical Drift Risks:

| Library | Risk | Why It Matters |
|---------|------|---------------|
| **spaCy** + models | 🔴 HIGH | `en_core_web_sm` and `fr_core_news_sm` model versions **MUST** match the spaCy library version exactly. `spaCy 3.7.x` models are incompatible with `spaCy 3.8.x`. No version pin means `pip install` can pull incompatible versions. (lines 992, 1071) |
| **fastapi-users + SQLAlchemy adapter** | 🔴 HIGH | `fastapi-users>=14` with `fastapi-users-db-sqlalchemy` — the adapter package has its own versioning. If `fastapi-users` releases v15 with a breaking SQLAlchemy adapter change, the build breaks. The adapter must be pinned to a compatible version. (line 987) |
| **Pydantic** | 🟡 MEDIUM | `>=2` — Pydantic v2 had breaking changes from v1. While `>=2` is current, future v3 could break schemas. (line 988) |
| **SQLAlchemy** | 🟡 MEDIUM | `>=2.0` — SQLAlchemy 3.0, when released, may break async patterns. (line 984) |
| **shadcn-dashboard-landing-template** | 🟡 MEDIUM | Git-cloned without a commit hash. The template could change at any time. Should pin to a specific commit SHA. (line 749) |
| **magicui** | 🟡 MEDIUM | "Copy-paste, not npm install" (line 760) — no versioning at all. Manual updates required forever. |
| **React 19 + shadcn/ui** | 🟡 MEDIUM | The plan uses React 19 (confirmed in README badge). shadcn/ui compatibility with React 19 was not stable until late 2024/early 2025. Need to verify the cloned template works with React 19. |
| **framer-motion** | 🟢 LOW | React animation library, stable API. Minor version drift is cosmetic. |
| **pdfplumber** | 🟢 LOW | Stable API, widely used. |
| **thefuzz** | 🟢 LOW | Simple fuzzy matching, stable. |
| **httpx** | 🟢 LOW | Stable HTTP client. |
| **litellm** | 🟡 MEDIUM | 17k+ stars, active development. Provider API changes could break config YAML format. |
| **langfuse** | 🟡 MEDIUM | Actively developed. API breaking changes possible between major versions. |
| **slowapi** | 🟢 LOW | Rate limiting library, stable. |
| **gender-guesser** | 🔴 CRITICAL | Last updated 2016. Not just unpinned — should be removed entirely. |

### Specific Compatibility Matrix Risks:

1. **spaCy model compatibility**: `en_core_web_sm` and `fr_core_news_sm` must match spaCy library version. Example: spaCy 3.7 models are NOT compatible with spaCy 3.8. Without version pins, `pip install spacy` pulls latest, then `python -m spacy download en_core_web_sm` may pull a mismatched model.

2. **fastapi-users adapter**: The `fastapi-users-db-sqlalchemy` package version must match `fastapi-users`. The plan only specifies `fastapi-users>=14` but the SQLAlchemy adapter is a separate PyPI package with its own versioning.

3. **React 19 + shadcn/ui**: The plan references React 19 (README badge) but shadcn/ui's compatibility with React 19 was not stable until late 2024. The `shadcn-dashboard-landing-template` must be verified for React 19 compatibility.

**Recommendation**: Generate a `requirements.txt` with pinned versions for ALL Python dependencies. Generate a `package.json` with pinned versions for ALL Node dependencies. Commit both.

---

## 5. Duplicated Capabilities

### DUPLICATION 1: Three PDF Extraction Libraries (lines 976–978, 1099, 1194)
| Library | Location | Purpose |
|---------|----------|---------|
| `pdfjs-dist` | Client-side (browser) | PDF → raw text | 
| `pdfplumber` | Server-side (Python) | PDF metadata, character-level inspection, layout analysis |
| `tesseract.js` | Client-side (browser) | OCR for image-based PDFs |

**Analysis**: pdfjs-dist AND pdfplumber both extract text from PDFs. pdfplumber's layout analysis (line 1099) could be done by pdfjs-dist client-side, avoiding a server round-trip. The plan uses pdfplumber for: metadata forensics (task 14), hidden text detection (task 13), AND layout analysis for multi-column resumes (task 7).

**Consolidation**: Keep pdfjs-dist for client-side text extraction. Use pdfplumber ONLY for server-side integrity checks (metadata, hidden text). Move layout analysis to client-side via pdfjs-dist's text content API. Saves one tool from the pipeline.

---

### DUPLICATION 2: `pdf-injection-scanner` Uses `pdfplumber` Internally (line 1183)
The plan proposes:
- "Install pdfplumber" (line 1174)
- "git clone pdf-injection-scanner" (line 1176)
- Then manually iterate pdfplumber characters for hidden text (lines 1183–1184)

But `pdf-injection-scanner` IS a thin wrapper around pdfplumber. Using both means pdfplumber is installed twice (once directly, once as a transitive dependency of pdf-injection-scanner). The plan then proposes to **reimplement** pdf-injection-scanner's logic manually using pdfplumber (task 13).

**Fix**: Either use `pip install pdf-injection-scanner` and wrap it (NOT reimplement), OR use pdfplumber directly. Don't do both.

---

### DUPLICATION 3: `nltk` + `spaCy` — Two NLP Libraries (lines 992, 1203, 1221)
The plan installs both `nltk` (~200MB with corpora) and `spaCy` (with models). nltk is used only for:
- Basic tokenization (task 15, line 1203) — spaCy does this better
- Frequency analysis (task 17, line 1221) — spaCy's `Doc.count_by()` handles this

**Consolidation**: Drop nltk. Use spaCy for ALL NLP tasks. Reduces dependency count by 1 and Docker image size by ~200MB.

---

### DUPLICATION 4: `tesseract.js` (browser) + Potential Server OCR (lines 978, 1063)
For image-based PDFs (scanned resumes), the plan uses tesseract.js client-side. But the plan also mentions OCR for scanned PDFs (line 1098) in the backend context. If the backend needs OCR for scanned files uploaded via API (not browser), tesseract.js won't help — it's JavaScript-only. This means a potential SECOND OCR engine would be needed server-side (pytesseract + Tesseract system package).

**Gap**: The plan assumes all files go through the browser. For API-only uploads (Chrome extension, portal), the backend needs its own OCR or must reject image-only PDFs.

---

## 6. OSINT Tool Reality Check

### Tool-by-Tool Verification

| Tool | Plan Reference | Exists? | PyPI? | Python API? | CLI-only? | Stars | Matching Plan Use Case? |
|------|---------------|---------|-------|-------------|-----------|-------|------------------------|
| **social-analyzer** (`qeeqbox/social-analyzer`) | Lines 1230, 1232 | ✅ YES | ✅ `pip install social-analyzer` | ✅ `run_as_object()` method | Has CLI too | 11.8k+ | ✅ Yes — profile discovery across 1000+ sites |
| **helix** (`thalha-a9/helix`) | Lines 1230, 1232 | ✅ YES | ❌ No PyPI package | ❌ No importable module | ✅ CLI-only (`python helix.py -u user`) | ~500 | ❌ **NO** — It's a username mapper, NOT a breach checker |
| **ghost** (`juliosuas/ghost`) | Line 1232 | ❌ **NO** | ❌ No | ❌ No | N/A | N/A | ❌ **NO** — Repository does not exist |
| **pdf-injection-scanner** (`Andy8647/pdf-injection-scanner`) | Lines 1176, 1183 | ✅ YES | ✅ `pip install pdf-injection-scanner` | ⚠️ Has `pdf_injection_scanner/` package dir but docs show CLI only | Primarily CLI | ~30 | ✅ Yes — but plan uses `git clone` not `pip install` |
| **gitreal** (`satwik146/gitreal`) | Lines 1176, 1212 | ❌ **EMPTY** | ❌ No | ❌ No | N/A | N/A | ❌ **NO** — Repo exists but contains zero code |

### Detailed Analysis

#### social-analyzer — VERIFIED ✓
- **GitHub**: `qeeqbox/social-analyzer` — 11.8k+ stars, 897 commits, actively developed.
- **PyPI**: `pip install social-analyzer` — has Python object API via `SocialAnalyzer.run_as_object()`.
- **API surface**: `sa.run_as_object(username='johndoe', method='find', mode='fast', metadata=True, extract=True)` returns structured results.
- **Caveats**: Requires Firefox ESR + tesseract-ocr as system dependencies (not in any Dockerfile). Scans can be slow (minutes for full search). WAF/CAPTCHA detection is hit-or-miss.
- **Verdict**: ✓ Real, usable. The plan is correct about this one EXCEPT it says `Worldseekers/social-analyzer` (a zero-star fork) on line 1232 and correctly redirects to the original.

#### helix — MISASSIGNED ⚠
- **GitHub**: `thalha-a9/helix` — ~500 stars, MIT, Python 3.9+.
- **What it does**: Username enumeration across social platforms. Uses aiohttp for async scanning. D3.js for visual mapping.
- **What the plan says it does**: "data breach checks" (line 1230).
- **What it actually does**: Username presence detection (like Sherlock or Maigret).
- **API**: CLI-only (`python helix.py -u targetusername`). No Python import API. No pip package.
- **Subprocess safety**: The plan says NOTHING about how to call this from FastAPI. Calling via `subprocess.run()` blocks the async event loop. Must use `asyncio.create_subprocess_exec()`.
- **Verdict**: Real tool, wrong assignment. Replace with `holehe` (`pip install holehe`) for email breach checking.

#### ghost — FICTIONAL ❌ (CRITICAL)
- **Claimed location**: `juliosuas/ghost` (line 1232).
- **Verification**: No GitHub repository found. No PyPI package. No trace in OSINT tool lists. The closest match (`elm1nst3r/GHOST-osint-crm`) is a CRM platform, not a profile detection tool.
- **Impact**: The Phase 3 identity verification pipeline (task 18) loses one of its three tools. The plan says ghost handles "ghost profile detection" — no such tool exists under this name.
- **Recommendation**: Use `holehe` (120+ site email presence check) for breach detection, or `mosint` (email OSINT aggregator), or `h8mail` (breach data search). All are pip-installable.

#### pdf-injection-scanner — EXISTS BUT MISINTEGRATED ⚠
- **PyPI**: `pip install pdf-injection-scanner` — installable as a pip package.
- **GitHub**: `Andy8647/pdf-injection-scanner` — MIT, ~30 stars, 6 commits. Has `pyproject.toml` with package definition.
- **The plan's approach is wrong**: Line 1176 says "git clone into backend/tools/" but it's a pip package. `pip install pdf-injection-scanner` is the correct approach.
- **API question**: The repo has a `pdf_injection_scanner/` package directory, suggesting potential programmatic API. But docs show only CLI: `pdf-scan file.pdf`. The plan proposes reimplementing its logic manually (lines 1183–1186), which defeats the purpose.
- **Verdict**: Real, usable, but plan proposes wrong integration method AND manually reimplements the tool's logic.

#### gitreal — EMPTY SHELL ❌ (CRITICAL)
- **GitHub**: `satwik146/gitreal` — repo exists, shows pull requests tab, BUT contains **zero code**. No commits, no files, no README, no releases.
- **The plan's workaround**: "reimplement the approach using gitpython" (line 1212) — since there's no code, there's no "approach" to reimplement. This is effectively a build-from-scratch task disguised as OSS reuse.
- **Recommendation**: Drop gitreal entirely. Use GitHub REST API directly via `httpx` (already in deps, line 996). Write a thin ~80-line wrapper: search users by name/email, fetch repo languages, compare against claimed skills.

---

## Summary & Recommendations

### Critical Findings (Must Fix Before Execution)
1. **Ghost (juliosuas/ghost) does not exist** — replace with `holehe` or `h8mail` for breach detection
2. **Gitreal (satwik146/gitreal) has no code** — write a thin GitHub API wrapper instead
3. **Helix is a username mapper, not a breach checker** — reassign or replace with `holehe`
4. **No version pins on 19 out of 20+ dependencies** — docker build will drift and break within months

### High-Impact Savings
| Change | Time Saved | Lines |
|--------|-----------|-------|
| Use `pyresume` (or fork it) instead of custom spaCy pipeline | ~20h | 1068–1080 |
| Use `pdf-injection-scanner` via `pip install` instead of reimplementing | ~4h | 1183–1186 |
| Use `holehe` (pip) instead of unknown ghost + misfit helix | ~6h | 1230, 1232 |
| Drop `nltk` (spaCy already handles tokenization) | ~2h + 200MB | 1203, 1221 |
| Use `AIF360` or `Fairlearn` instead of custom bias analysis | ~8h | 1304–1311 |

### The Thesis Violation Count
The plan's thesis is "cannibalize, don't build." Of 27 tasks:
- **5 tasks** propose building from scratch where OSS exists (7, 13, 15, 17, 26)
- **2 tasks** reference non-existent OSS (16 references gitreal, 18 references ghost)
- **1 task** uses the wrong OSS for the job (18 uses helix for breach checking)
- **7 tasks** are properly cannibalizing existing OSS

**Score: 7/27 tasks follow the thesis. 8/27 violate it. 12/27 are neutral (no OSS component).**

The plan talks the "cannibalize" talk but the execution details walk a "build it ourselves" walk.
