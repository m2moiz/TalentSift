# Architecture Fixes for feature-roadmap.md

> **Status:** APPROVED | **Date:** 2026-06-26
> These 6 fixes unblock parallel execution by resolving merge-conflict hotspots,
> missing I/O contracts, and overly-conservative dependency chains.

---

## Fix 1: CV File Upload Endpoint — Bridging Phase 1 → Phase 2

**Problem:** Phase 1 extracts text *client-side* (task 7: pdfjs-dist, mammoth, tesseract.js).
Phase 2 integrity tasks (13–15) need **raw PDF bytes** on the backend for:
- Metadata extraction (task 14: pdfplumber needs the binary PDF, not extracted text)
- Hidden text detection (task 13: character-level analysis needs the PDF stream)
- AI-generated CV detection (task 15: ZipPy compression analysis)

Without a file upload endpoint, Phase 2 tasks have no way to access the file.

### Fix

#### 1a. Add endpoint to task 3's API list

**Location:** Line 818, after `GET /api/user/export`

**OLD (line 818):**
```
      - `GET /api/user/export` — returns JSON bundle of all user data for GDPR portability (Article 20)
      - **Mock mode**: Backend reads `MOCK_MODE=1`...
```

**NEW:**
```
      - `GET /api/user/export` — returns JSON bundle of all user data for GDPR portability (Article 20)
      - `POST /api/cv-files/upload` — accept multipart PDF/DOCX file. Store to `/tmp/talentift-uploads/{uuid}.pdf` with metadata record in `cv_files` table (id, user_id, filename, stored_path, file_size, sha256_hash, expires_at=now+1h). Returns `{ cv_file_id, filename, file_size }`. Used by Phase 2 integrity scanners (tasks 13–15).
      - `GET /api/cv-files/{id}` — download the raw file by cv_file_id. Phase 2 services read this.
      - **Mock mode**: Backend reads `MOCK_MODE=1`...
```

#### 1b. Add `cv_files` model to task 3's DB models list

**Location:** Line 806, after AuditLog entry

**OLD (line 806):**
```
     - **AuditLog**: id, user_id (FK), action (string), model_name, model_id, timestamp, ip_address, changes_json. Auto-purge rows older than 90 days on app startup (retention policy).
```

**NEW:**
```
     - **AuditLog**: id, user_id (FK), action (string), model_name, model_id, timestamp, ip_address, changes_json. Auto-purge rows older than 90 days on app startup (retention policy).
     - **CvFile**: id (UUID), user_id (FK), original_filename, stored_path (absolute path on server fs), file_size_bytes (int), sha256_hash (str, unique index for dedup), mimetype ("application/pdf" | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"), expires_at (datetime, default now+1h), created_at. Auto-deleted by background cron on expiry. Phase 2 integrity scanners reference `cv_file_id` to read the raw file.
```

#### 1c. Add `cv_files.py` to directory structure list

**Location:** Line 1060, after `preference.py`

**OLD (line 1060):**
```
   │   └── preference.py
   ├── schemas/              # ⚠️ ONE FILE PER SCHEMA — no shared schema files
```

**NEW:**
```
   │   ├── preference.py
   │   └── cv_file.py
   ├── schemas/              # ⚠️ ONE FILE PER SCHEMA — no shared schema files
```

#### 1d. Add `cv_files.py` to API directory list

**Location:** Line 1078, after `preferences.py`

**OLD (line 1078):**
```
   │   ├── preferences.py
   │   └── dependencies.py   # get_current_user, get_db
```

**NEW:**
```
   │   ├── preferences.py
   │   ├── cv_files.py       # POST /api/cv-files/upload, GET /api/cv-files/{id}
   │   └── dependencies.py   # get_current_user, get_db
```

#### 1e. Add `cv_files.py` to schemas directory list

**Location:** Line 1070, after `verification.py`

**OLD (line 1070):**
```
   │   └── bias.py           # Phase 4 schemas
   ├── api/
```

**NEW:**
```
   │   ├── bias.py           # Phase 4 schemas
   │   └── cv_files.py       # CvFileUploadResponse, CvFileMetadata
   ├── api/
```

#### 1f. Add cleanup to task 4 Docker compose (named volume for uploads)

**Location:** Line 849 (inside compose.yml description)

**OLD (line 849):**
```
    - libSQL database: stored in a named volume `libsql_data` mounted at `/app/data/` inside the backend container. The `.db` file lives there. Volume persists across container restarts.
```

**NEW:**
```
    - libSQL database: stored in a named volume `libsql_data` mounted at `/app/data/` inside the backend container. The `.db` file lives there. Volume persists across container restarts.
    - Upload tmpfs: `/tmp/talentift-uploads` in backend container is a `tmpfs` mount (in-memory, auto-cleared on container stop). No volume needed — files are ephemeral and auto-purged after 1h expiry or on analysis completion.
```

#### 1g. Update task 12 and task 13–15 to use cv_file_id

**Location:** Line 1229 (task 12), line 1238 (task 13), line 1245 (task 14), line 1275 (task 15)

Each Phase 2 integrity task's `Blocked by:` line says "needs raw PDF file". Replace with `Blocked by: task 12 (backend scaffold) + cv_file_id from POST /api/cv-files/upload`

Specifically:

**OLD (line 1239 — task 13, "Blocked by: task 12…"):**
```
   Parallelization: Wave 2 parallel | Blocked by: task 12 (backend scaffold — only needs PDF file, not structured parser)
```

**NEW (all Phase 2 tasks 13–15):**
```
   Parallelization: Wave 2 parallel | Blocked by: task 12 (backend scaffold) + cv_file_id from POST /api/cv-files/upload (Phase 1 task 6 frontend sends file → backend stores → Phase 2 reads via cv_file_id)
```

---

## Fix 2: Router Auto-Discovery in main.py

**Problem:** 6+ tasks add routes to `main.py`. Without auto-discovery, every parallel agent editing `main.py` produces merge conflicts. The plan mentions auto-import for schemas/services (line 1102) but never defines the mechanism for routers.

### Fix

#### 2a. Add to task 6 (scaffold) — exact main.py code

**Location:** Line 1123 (before acceptance criteria of task 6)

**Insert after "QA:" line 1120:**

````markdown
   **✅ Router auto-discovery — the #1 unblocker for parallel API development:**

   All API route files live in `backend/api/*.py`. `main.py` uses `importlib` to auto-discover and include them. **No developer ever edits `main.py` to add a route.** Create a new `.py` file in `backend/api/` → it's automatically included on next restart.

   ```python
   # backend/main.py
   import importlib
   import pkgutil
   from pathlib import Path
   from contextlib import asynccontextmanager

   from fastapi import FastAPI
   from fastapi.middleware.cors import CORSMiddleware

   from backend import api as api_pkg
   from backend.config import settings
   from backend.database import engine, Base


   @asynccontextmanager
   async def lifespan(app: FastAPI):
       """Startup: auto-discover routers, create tables. Shutdown: cleanup."""
       # ── Startup ──
       async with engine.begin() as conn:
           await conn.run_sync(Base.metadata.create_all)

       # ── Auto-discover and include ALL routers from backend/api/*.py ──
       # To add a new endpoint, create a file in backend/api/ with a
       # `router = APIRouter(prefix="/api/...", tags=["..."])` at module level.
       # It's automatically included — zero changes to this file.
       api_dir = Path(__file__).parent / "api"
       for _, module_name, _ in pkgutil.iter_modules([str(api_dir)]):
           if module_name.startswith("_"):
               continue
           mod = importlib.import_module(f"backend.api.{module_name}")
           if hasattr(mod, "router"):
               app.include_router(mod.router)
               print(f"  ✓ router: {module_name}")

       yield  # app runs here

       # ── Shutdown ──
       await engine.dispose()


   app = FastAPI(
       title=settings.APP_NAME,
       version=settings.APP_VERSION,
       lifespan=lifespan,
   )

   # CORS for Vite dev server
   app.add_middleware(
       CORSMiddleware,
       allow_origins=[settings.FRONTEND_ORIGIN],  # "http://localhost:5173"
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )


   @app.get("/health")
   async def health():
       return {"status": "ok", "mock_mode": settings.MOCK_MODE}
   ```

   **Router contract — every `backend/api/*.py` file must follow this pattern:**
   ```python
   # backend/api/need_analysis.py
   from fastapi import APIRouter, Depends

   router = APIRouter(prefix="/api/need-analysis", tags=["need-analysis"])

   @router.get("/")
   async def list_analyses(user=Depends(get_current_user), db=Depends(get_db)):
       ...

   @router.post("/")
   async def create_analysis(body: NeedAnalysisCreate, ...):
       ...
   ```

   **Why this works for parallelism:**
   - Each task creates one file: `backend/api/<feature>.py` with its own `router`
   - Zero merge conflicts on `main.py` (it's never edited after initial scaffold)
   - New endpoints are auto-discovered on restart
   - Removing a feature = delete one file, not surgery on main.py
   - Same pattern applies to `models/__init__.py` and `schemas/__init__.py` (auto-import via `importlib`)

   Must NOT do: Hand-edit `main.py` to include routers. Use `pprint` or manual dict in `main.py`.
   OSS cannibalized: `importlib` + `pkgutil` (Python stdlib — zero dependencies)
````

#### 2b. Remove the existing schema/service auto-import note (it was underspecified)

**Location:** Line 1102

**OLD (line 1102):**
```
> **⚠️ SCHEMA STRATEGY: One file per schema module.** Tasks 7-26 each add their Pydantic models to `schemas/<module>.py` and their service code to `services/<service>.py`. `schemas/__init__.py` and `services/__init__.py` are NEVER hand-edited — they auto-import via `importlib`. This prevents merge conflicts when 10+ parallel agents add schemas and services in the same phase.
```

**NEW:**
```
> **⚠️ SCHEMA + API STRATEGY: One file per module. Zero shared-file edits.** Tasks 7-27 each add their Pydantic models to `schemas/<module>.py`, their service code to `services/<service>.py`, and their API routes to `api/<module>.py`. `schemas/__init__.py`, `services/__init__.py`, AND `main.py` are NEVER hand-edited — they auto-discover via `importlib`. This prevents merge conflicts when 10+ parallel agents add schemas, services, and routes in the same phase. See task 6 for the `main.py` auto-discovery implementation.
```

---

## Fix 3: Vite Proxy Configuration

**Problem:** The plan says "in dev, Vite proxies `/api` to backend" (line 930) and "Vite proxies `/api` to backend container" (task 4), but no `vite.config.ts` proxy config exists. The current `vite.config.ts` is a default shell (7 lines).

### Fix

**Location:** The entire existing `vite.config.ts` file must be replaced.

**OLD (vite.config.ts — lines 1–7):**
```typescript
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react(), tailwindcss()],
});
```

**NEW (full replacement):**
```typescript
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react(), tailwindcss()],

	server: {
		port: 5173,
		strictPort: true, // fail loudly if port is taken, don't silently pick 5174
		proxy: {
			"/api": {
				target: process.env.VITE_API_TARGET ?? "http://localhost:8000",
				changeOrigin: true,
				// No rewrite — backend expects /api/* paths as-is
			},
			"/auth": {
				target: process.env.VITE_API_TARGET ?? "http://localhost:8000",
				changeOrigin: true,
				// Auth endpoints live at /auth/* on the backend (fastapi-users convention)
			},
		},
	},
});
```

**Why this addresses the Momus warning:**
- `VITE_API_TARGET` env var controls the backend URL. Default: `http://localhost:8000`.
- In Docker dev: `VITE_API_TARGET=http://backend:8000` (Docker service name).
- In Docker prod: proxy not used — FastAPI serves static files directly (task 4).
- `strictPort: true` prevents silent port conflicts.
- No CORS needed in dev because the browser sees same-origin (Vite proxy → backend).

**Add to `.env.example` (line 920, after VITE_ENABLE_PLATFORM):**

**OLD (line 920–923):**
```bash
VITE_ENABLE_INTEGRITY=1            # Phase 2 — hidden text, metadata, AI detection
VITE_ENABLE_VERIFICATION=1         # Phase 3 — OSINT, sanctions, timeline
VITE_ENABLE_PLATFORM=1             # Phase 4 — audit viewer, bias reports, portal
 MOCK_MODE=0                        # 1 = backend returns mock data from fixtures/. Frontend detects via GET /api/health mock_status field.
```

**NEW:**
```bash
VITE_ENABLE_INTEGRITY=1            # Phase 2 — hidden text, metadata, AI detection
VITE_ENABLE_VERIFICATION=1         # Phase 3 — OSINT, sanctions, timeline
VITE_ENABLE_PLATFORM=1             # Phase 4 — audit viewer, bias reports, portal
VITE_API_TARGET=http://localhost:8000  # Vite dev proxy target (Docker: http://backend:8000)
MOCK_MODE=0                        # 1 = backend returns mock data from fixtures/. Frontend detects via GET /api/health mock_mode field.
```

---

## Fix 4: scoreBreakdown Schema — Closing the I/O Gap

**Problem:** Task 9 says "add scoreBreakdown to the Pydantic CandidateMatch model FIRST (line 256)" but `CandidateMatch` (line 281–289) has no `scoreBreakdown` field and it's never defined anywhere. The TypeScript `CandidateMatch` interface (src/lib/types.ts line 66–75) also lacks it. This is an I/O contract gap — 7 tasks that modify CandidateCard (tasks 2, 5, 9, 13, 14, 15, 17) need a stable contract.

### Fix

#### 4a. Add scoreBreakdown to Pydantic CandidateMatch

**Location:** Line 289, after `op_history_alignment`

**OLD (line 289):**
```python
    op_history_alignment: str    # how op history influenced this match

class CvMatchOutput(BaseModel):
```

**NEW:**
```python
    op_history_alignment: str    # how op history influenced this match
    score_breakdown: ScoreBreakdown | None = None  # task 9 — explainable scores

class ScoreBreakdown(BaseModel):
    """Evidence breakdown for a single candidate match score."""
    matched_skills: list[MatchedSkill]    # skills found in both CV and JD
    missing_skills: list[str]             # JD skills NOT found in CV
    strength_evidence: list[str]          # specific CV excerpts supporting strengths
    watch_evidence: list[str]             # specific CV excerpts supporting watch points
    score_components: list[ScoreComponent]  # weighted sub-scores

class MatchedSkill(BaseModel):
    name: str                     # "Apache Kafka"
    years: float | None           # years of experience claimed
    evidence: str                 # "Listed in experience at Société Générale (2020-2023)"
    weight: float                 # 0.0–1.0, how important this skill is to the JD

class ScoreComponent(BaseModel):
    category: str                 # "skills_match" | "experience_fit" | "education" | "seniority"
    score: float                  # 0-100
    weight: float                 # 0.0–1.0
    explanation: str

class CvMatchOutput(BaseModel):
```

#### 4b. Add scoreBreakdown to TypeScript mirror

**Location:** src/lib/types.ts line 74, after `opHistoryAlignment`

**OLD (src/lib/types.ts line 74):**
```typescript
	readonly opHistoryAlignment: string;
}

export interface CvMatchOutput {
```

**NEW:**
```typescript
	readonly opHistoryAlignment: string;
	readonly scoreBreakdown: ScoreBreakdown | null;
}

export interface ScoreBreakdown {
	readonly matchedSkills: readonly MatchedSkill[];
	readonly missingSkills: readonly string[];
	readonly strengthEvidence: readonly string[];
	readonly watchEvidence: readonly string[];
	readonly scoreComponents: readonly ScoreComponent[];
}

export interface MatchedSkill {
	readonly name: string;
	readonly years: number | null;
	readonly evidence: string;
	readonly weight: number;
}

export interface ScoreComponent {
	readonly category: "skills_match" | "experience_fit" | "education" | "seniority";
	readonly score: number;
	readonly weight: number;
	readonly explanation: string;
}

export interface CvMatchOutput {
```

#### 4c. Update task 9 wording to reference the canonical model

**Location:** Line 1190

**OLD (line 1190):**
```
   What to do: Modify the ranking prompt (`src/lib/prompts.ts`) to request per-candidate evidence from the AI. Add `scoreBreakdown` to the Pydantic `CandidateMatch` model FIRST (line 256 — Pydantic is canonical per line 462), then propagate to TypeScript mirror. Update `CandidateCard` to show an expandable "Why this score?" section with the breakdown. Show which JD skills were matched vs missing.
```

**NEW:**
```
   What to do: Modify the ranking prompt (`src/lib/prompts.ts`) to request per-candidate evidence from the AI. The `ScoreBreakdown` Pydantic model is already defined in the Data Contracts section (line 292–320) with `MatchedSkill`, `ScoreComponent`, and `CandidateMatch.score_breakdown`. Task: (1) update the AI prompt to return this structure, (2) add a `ScoreBreakdownPanel` component that reads `score_breakdown` from CandidateMatch, (3) add a `<Slot name="score-breakdown">` in CandidateCard (see Fix 6). Show which JD skills were matched vs missing with evidence excerpts.
```

---

## Fix 5: Wave 2+3 Dependency Merging — Phase 3 Unblocked from Phase 2

**Problem:** The dependency matrix (line 769) says Phase 3 is blocked by "Phase 2 complete". But:
- Tasks 18–20 (OSINT, timeline, company check) only need `ParsedResume.name`, `.email`, `.primary_skills` from Phase 1 task 7 + backend scaffold from Phase 0.
- Tasks 21–22 (sanctions, court records) only need a name string.
- Task 19 (timeline) references `GitHubAnalysisResult` from task 16, but that's an import dependency, not a runtime prerequisite — it can be implemented as a conditional call (if GitHub data available, enrich timeline; otherwise skip).

Phase 3 can start after task 7 + task 12 (backend scaffold), running **in parallel with Phase 2 feature tasks** (13–17), cutting ~3–4 days from the total timeline.

### Fix

#### 5a. Update dependency matrix

**Location:** Lines 768–769 (entire Phase 2 and Phase 3 rows)

**OLD (lines 768–769):**
```
| Phase 2 | Phase 1 | All 5 features parallel after Python backend setup (tasks 13-15 need raw PDF file from upload; tasks 16-17 need raw CV text — NOT full structured parser) |
| Phase 3 | Phase 2 (backend must exist) + Phase 1 task 7 (needs `ParsedResume` for name/email/skills to feed OSINT tools) | All 5 features parallel after both prerequisites met |
```

**NEW:**
```
| Phase 2 | Phase 1 + task 12 (backend scaffold) | All 5 features parallel after backend scaffold (tasks 13–15: raw PDF via cv_file_id; tasks 16–17: raw CV text) |
| Phase 3 | Phase 1 task 7 (ParsedResume) + task 12 (backend scaffold) — does NOT require Phase 2 complete | All 5 features parallel. Tasks 18–20 consume ParsedResume.name/email/skills. Tasks 21–22 consume name string. Task 19 optionally imports GitHubAnalysisResult from task 16 (conditional enrichment — skip if unavailable). **Phase 3 runs in parallel with Phase 2 feature tasks (13–17).** |
```

#### 5b. Update execution strategy

**Location:** Lines 746–747

**OLD (lines 746–747):**
```
> Wave 2: Phase 2 scaffold + parallel feature tasks
> Wave 3: Phase 3 scaffold + parallel feature tasks (BLOCKED by Phase 1 task 7 for ParsedResume data)
```

**NEW:**
```
> Wave 2: Phase 2 scaffold + parallel feature tasks
> Wave 3: Phase 3 features — starts after Phase 1 task 7 (ParsedResume) + Phase 0 backend, runs IN PARALLEL with Wave 2. Tasks 18–20 consume ParsedResume; tasks 21–22 consume name string. Task 19 optionally consumes GitHubAnalysisResult from task 16 (conditional import).
> Wave 4: Phase 4 scaffold + parallel feature tasks (requires Phase 2 + Phase 3 complete for full data)
```

#### 5c. Update Phase 3 task blocked-by lines

**Location:** Each Phase 3 task's `Parallelization:` line (tasks 18–22)

For tasks 18, 20, 21, 22 — replace "Blocked by: Phase 2 complete" with the task-specific dependency:

**Task 18 (line 1357) — OLD:**
```
   Parallelization: Wave 3 parallel | Blocked by: Phase 2 complete AND task 7 (needs ParsedResume name/email)
```
**NEW:**
```
   Parallelization: Wave 3 parallel (runs alongside Phase 2) | Blocked by: task 7 (needs ParsedResume.name, .email, .primary_skills) + task 12 (backend scaffold). Does NOT require Phase 2 complete.
```

**Task 19 (line 1366) — OLD:**
```
   Parallelization: Wave 3 parallel | Blocked by: Phase 2 complete
```
**NEW:**
```
   Parallelization: Wave 3 parallel (runs alongside Phase 2) | Blocked by: task 7 (ParsedResume dates) + task 12 (backend scaffold). Optionally enriches with GitHubAnalysisResult from task 16 — conditional import, skips if task 16 not yet done.
```

**Task 20 (line 1375) — OLD:**
```
   Parallelization: Wave 3 parallel | Blocked by: Phase 2 complete
```
**NEW:**
```
   Parallelization: Wave 3 parallel (runs alongside Phase 2) | Blocked by: task 7 (ParsedResume employer names) + task 12 (backend scaffold). Does NOT require Phase 2 complete.
```

**Task 21 (line 1384) — OLD:**
```
   Parallelization: Wave 3 parallel | Blocked by: Phase 2 complete
```
**NEW:**
```
   Parallelization: Wave 3 parallel (runs alongside Phase 2) | Blocked by: task 7 (ParsedResume.full_name) + task 12 (backend scaffold). Does NOT require Phase 2 complete.
```

**Task 22 (line 1393) — OLD:**
```
   Parallelization: Wave 3 parallel | Blocked by: Phase 2 complete
```
**NEW:**
```
   Parallelization: Wave 3 parallel (runs alongside Phase 2) | Blocked by: task 7 (ParsedResume.full_name) + task 12 (backend scaffold). Does NOT require Phase 2 complete.
```

#### 5d. Update critical note

**Location:** Line 772

**OLD (line 772):**
```
> **CRITICAL:** Phase 3 tasks 18-20 consume `ParsedResume.name`, `.email`, `.primary_skills` from Phase 1 task 7. The dependency matrix previously said "Blocked by: Phase 2 complete" which would leave OSINT tools with no candidate data. Tasks 21-22 (sanctions, court records) only need a name string and can run on raw text.
```

**NEW:**
```
> **CRITICAL:** Phase 3 runs in PARALLEL with Phase 2 feature tasks (13–17). Only prerequisites: Phase 1 task 7 (ParsedResume) + task 12 (backend scaffold). Task 19 optionally imports from task 16 (GitHubAnalysisResult) via conditional import — skips enrichment if task 16 not yet complete. This cuts ~3–4 days from the total timeline by eliminating the Phase 2→Phase 3 sequential dependency.
```

---

## Fix 6: CandidateCard Plugin/Slot Pattern — Preventing Merge Conflicts Across 7 Tasks

**Problem:** Tasks 2, 5, 9, 13, 14, 15, 17 all modify `CandidateCard.tsx`. Each task wants to add a new panel (animations, score breakdown, hidden text badge, metadata panel, AI detection badge, keyword density). Without a plugin architecture, every parallel agent edits the same file → guaranteed merge conflicts.

### Fix

Replace the monolithic `CandidateCard.tsx` with a slot-based architecture. The card becomes a **shell** that renders named `<slot>` regions. Each feature task creates a **plugin** file that registers into a slot. `CandidateCard.tsx` itself is edited ONCE (task 2 adds the slot system), then never touched again.

#### 6a. New architecture

```
src/components/tab-cvs/
├── CandidateCard.tsx          # Shell — edited ONCE (task 2). Renders <Slot> regions.
├── slots/                     # Plugin directory — each task creates ONE file here
│   ├── ScoreBadge.tsx         # task 2: animation layer (score count-up, badge entrance)
│   ├── ScoreBreakdown.tsx     # task 9: expandable "Why this score?" panel
│   ├── HiddenTextBadge.tsx    # task 13: "⚠️ Hidden text" badge
│   ├── MetadataPanel.tsx      # task 14: PDF metadata + timestamps
│   ├── AiDetectionBadge.tsx   # task 15: "🤖 AI-generated" badge
│   ├── KeywordDensityBar.tsx  # task 17: "Keyword density: X%" indicator
│   └── IntegritySummary.tsx   # task 5: aggregates badges into a summary row
```

#### 6b. CandidateCard shell (final form — written by task 2, never edited again)

```tsx
// src/components/tab-cvs/CandidateCard.tsx
import type { ReactElement, ReactNode } from "react";
import type { CandidateMatch } from "../../lib/types";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

// ── Slot system ──────────────────────────────────────────────────────────────

/**
 * Plugins are React components in `slots/` that receive the candidate data
 * and return a ReactNode. They render into named regions of the card.
 *
 * To add a new panel/badge to CandidateCard:
 *   1. Create src/components/tab-cvs/slots/YourFeature.tsx
 *   2. Export a default component with signature:
 *      (props: { candidate: CandidateMatch; locale: string }) => ReactNode
 *   3. Import it below and add to the appropriate slot array.
 *
 * ZERO edits to this file after initial setup. No merge conflicts.
 */
import { AnimatedScore } from "./slots/AnimatedScore";
import { ScoreBreakdownPanel } from "./slots/ScoreBreakdownPanel";
import { IntegrityBadgeRow } from "./slots/IntegrityBadgeRow";

// ── Slot registry — edit this object to add/remove plugin slots ──────────────

interface SlotPlugin {
	/** Component to render. Receives candidate data + locale. */
	readonly component: (props: {
		readonly candidate: CandidateMatch;
		readonly locale: string;
	}) => ReactNode;
	/** Which slot region this plugin renders into */
	readonly slot:
		| "score-area"       // next to the numeric score
		| "badge-row"        // below the score/match badges
		| "below-strengths"  // after strengths list
		| "below-watchpoints" // after watch points list
		| "footer";          // bottom of card
}

const SLOT_REGISTRY: readonly SlotPlugin[] = [
	// task 2 — animated score entrance
	{ component: AnimatedScore, slot: "score-area" },
	// task 9 — explainable score breakdown
	{ component: ScoreBreakdownPanel, slot: "below-watchpoints" },
	// tasks 13–17 — integrity badges (hidden text, AI detection, keyword density)
	{ component: IntegrityBadgeRow, slot: "badge-row" },
];

// ── Props ────────────────────────────────────────────────────────────────────

export interface CandidateCardProps {
	readonly candidate: CandidateMatch | null;
	readonly index?: number;
	readonly locale?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function scoreToBadgeVariant(
	score: string,
): "fort" | "moyen" | "faible" | "info" {
	switch (score) {
		case "Fort": return "fort";
		case "Moyen": return "moyen";
		case "Faible": return "faible";
		default: return "info";
	}
}

function scoreColor(score: number): string {
	if (score >= 75) return "text-[var(--status-success)]";
	if (score >= 50) return "text-[var(--status-warning)]";
	return "text-[var(--status-error)]";
}

function recommendationBadgeVariant(
	recommendation: string,
): "fort" | "moyen" | "faible" | "info" {
	switch (recommendation) {
		case "Call First": return "fort";
		case "Backup": return "moyen";
		case "Reject": return "faible";
		default: return "info";
	}
}

// ── Slot renderer ────────────────────────────────────────────────────────────

function renderSlot(
	slot: SlotPlugin["slot"],
	candidate: CandidateMatch,
	locale: string,
): ReactNode[] {
	return SLOT_REGISTRY.filter((p) => p.slot === slot).map((p, i) => (
		<div key={`${slot}-${i}`}>{p.component({ candidate, locale })}</div>
	));
}

// ── Component ────────────────────────────────────────────────────────────────

export function CandidateCard({
	candidate,
	index,
	locale = "fr",
}: CandidateCardProps): ReactElement {
	if (candidate === null) {
		return <CandidateCardSkeleton />;
	}

	const badgeVariant = scoreToBadgeVariant(candidate.matchScore);
	const recBadgeVariant = recommendationBadgeVariant(candidate.recommendation);

	return (
		<Card>
			<CardHeader>
				<div className="flex items-start justify-between">
					<div className="space-y-1">
						<CardTitle>
							{index !== undefined ? `#${index} ` : ""}
							{candidate.name}
						</CardTitle>
					</div>
					<div className="flex items-center gap-2">
						{/* ══ SLOT: score-area ══ */}
						{renderSlot("score-area", candidate, locale)}
						<span
							className={`text-2xl font-bold tabular-nums ${scoreColor(candidate.numericScore)}`}
						>
							{candidate.numericScore}
						</span>
						<span className="text-xs text-[var(--text-tertiary)]">/100</span>
					</div>
				</div>
				<div className="mt-2 flex flex-wrap gap-2">
					<Badge variant={badgeVariant}>{candidate.matchScore}</Badge>
					<Badge variant={recBadgeVariant}>{candidate.recommendation}</Badge>
				</div>
				{/* ══ SLOT: badge-row ══ */}
				<div className="mt-2 flex flex-wrap gap-2">
					{renderSlot("badge-row", candidate, locale)}
				</div>
			</CardHeader>

			<CardContent className="space-y-4">
				{/* Strengths */}
				{candidate.strengths.length > 0 && (
					<Section label="Forces">
						<ul className="list-inside list-disc space-y-1">
							{candidate.strengths.map((s) => (
								<li key={s} className="text-sm leading-5 text-[var(--text-secondary)]">
									{s}
								</li>
							))}
						</ul>
					</Section>
				)}
				{/* ══ SLOT: below-strengths ══ */}
				{renderSlot("below-strengths", candidate, locale)}

				{/* Watch points */}
				{candidate.watchPoints.length > 0 && (
					<Section label="Points de vigilance">
						<ul className="list-inside list-disc space-y-1">
							{candidate.watchPoints.map((w) => (
								<li key={w} className="text-sm leading-5 text-[var(--text-secondary)]">
									{w}
								</li>
							))}
						</ul>
					</Section>
				)}
				{/* ══ SLOT: below-watchpoints ══ */}
				{renderSlot("below-watchpoints", candidate, locale)}

				{/* Call questions */}
				{candidate.callQuestions.length > 0 && (
					<Section label="Questions d'entretien">
						<ul className="list-inside list-disc space-y-1">
							{candidate.callQuestions.map((q) => (
								<li key={q} className="text-sm leading-5 text-[var(--text-secondary)]">
									{q}
								</li>
							))}
						</ul>
					</Section>
				)}

				{/* Operational history alignment */}
				{candidate.opHistoryAlignment.length > 0 && (
					<div className="rounded-[8px] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 py-2">
						<p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-[0.08em]">
							Alignement historique
						</p>
						<p className="mt-1 text-sm leading-5 text-[var(--text-secondary)]">
							{candidate.opHistoryAlignment}
						</p>
					</div>
				)}

				{/* ══ SLOT: footer ══ */}
				{renderSlot("footer", candidate, locale)}
			</CardContent>
		</Card>
	);
}

// ── Section sub-component ────────────────────────────────────────────────────

interface SectionProps {
	readonly label: string;
	readonly children: ReactElement | ReactElement[];
}

function Section({ label, children }: SectionProps): ReactElement {
	return (
		<div>
			<p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-[0.08em] mb-1.5">
				{label}
			</p>
			{children}
		</div>
	);
}

// ── Skeleton state ────────────────────────────────────────────────────────────

function CandidateCardSkeleton(): ReactElement {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-start justify-between">
					<div className="space-y-2">
						<Skeleton className="h-5 w-28" />
					</div>
					<Skeleton className="h-8 w-12" />
				</div>
				<div className="mt-3 flex gap-2">
					<Skeleton className="h-5 w-16" />
					<Skeleton className="h-5 w-20" />
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-1.5">
					<Skeleton className="h-3 w-16" />
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-3/4" />
				</div>
				<div className="space-y-1.5">
					<Skeleton className="h-3 w-24" />
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-2/3" />
				</div>
				<div className="space-y-1.5">
					<Skeleton className="h-3 w-20" />
					<Skeleton className="h-4 w-full" />
				</div>
			</CardContent>
		</Card>
	);
}
```

#### 6c. Plugin implementation guide (stub file per slot)

Each slot plugin follows this contract:

```tsx
// src/components/tab-cvs/slots/ScoreBreakdownPanel.tsx
import type { ReactNode } from "react";
import type { CandidateMatch } from "../../../lib/types";

/**
 * Renders into the "below-watchpoints" slot of CandidateCard.
 * Shows per-skill match evidence and weighted sub-scores.
 */
export function ScoreBreakdownPanel({
	candidate,
	locale,
}: {
	readonly candidate: CandidateMatch;
	readonly locale: string;
}): ReactNode {
	const breakdown = candidate.scoreBreakdown;
	if (!breakdown) return null;

	return (
		<div className="rounded-[8px] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-3">
			{/* ... breakdown UI ... */}
		</div>
	);
}
```

#### 6d. IntegrityBadgeRow — aggregates tasks 13–17 into one slot file (no conflicts)

Since tasks 13 (hidden text), 14 (metadata), 15 (AI detection), and 17 (keyword density) all want to add badges to the same row, they share a single aggregation component:

```tsx
// src/components/tab-cvs/slots/IntegrityBadgeRow.tsx
import type { ReactNode } from "react";
import type { CandidateMatch } from "../../../lib/types";

// Each integrity feature exports a hook or function that the badge row calls.
// Tasks 13–17 add their hook here. No merge conflicts — they're separate import lines.

import { useHiddenTextBadge } from "./HiddenTextBadge";
import { useMetadataBadge } from "./MetadataBadge";
import { useAiDetectionBadge } from "./AiDetectionBadge";
import { useKeywordDensityBadge } from "./KeywordDensityBadge";

export function IntegrityBadgeRow({
	candidate,
	locale,
}: {
	readonly candidate: CandidateMatch;
	readonly locale: string;
}): ReactNode {
	const badges = [
		useHiddenTextBadge(candidate),
		useMetadataBadge(candidate),
		useAiDetectionBadge(candidate),
		useKeywordDensityBadge(candidate),
	].filter(Boolean);

	if (badges.length === 0) return null;

	return <div className="flex flex-wrap gap-1.5">{badges}</div>;
}
```

**Merge-conflict analysis:**
- `CandidateCard.tsx` — edited ONCE (task 2), never again.
- `slots/ScoreBreakdownPanel.tsx` — task 9 only.
- `slots/HiddenTextBadge.tsx` — task 13 only.
- `slots/MetadataBadge.tsx` — task 14 only.
- `slots/AiDetectionBadge.tsx` — task 15 only.
- `slots/KeywordDensityBadge.tsx` — task 17 only.
- `slots/IntegrityBadgeRow.tsx` — edited by tasks 13–17, but each edit is a **single import line addition**. Low-conflict.
- `slots/AnimatedScore.tsx` — task 2 only.

**Result:** Zero shared-file edits across 7 tasks. Each task owns its file. The `IntegrityBadgeRow` import list is the only shared line, and it's a simple append (git can auto-merge adjacent additions).

#### 6e. Update task 9 wording to use slot system

**Location:** Line 1190 (updated in Fix 4c already)

#### 6f. Add slots/ directory to task 6 scaffold

**Location:** Line 1043 (directory structure)

Add after `src/components/` listing:

```markdown
   src/components/tab-cvs/
   ├── CandidateCard.tsx      # Shell with slot system — edited ONCE, never again
   ├── CVInputs.tsx
   └── slots/                 # Plugin directory — one file per feature task
       ├── AnimatedScore.tsx           # task 2
       ├── ScoreBreakdownPanel.tsx     # task 9
       ├── IntegrityBadgeRow.tsx       # task 5 (aggregator)
       ├── HiddenTextBadge.tsx         # task 13
       ├── MetadataBadge.tsx           # task 14
       ├── AiDetectionBadge.tsx        # task 15
       └── KeywordDensityBadge.tsx     # task 17
```

---

## Summary: Files Touched by These Fixes

| File | Fixes | Change type |
|------|-------|------------|
| `.omo/plans/feature-roadmap.md` | 1a–1f, 2b, 3, 4a, 4c, 5a–5d, 6e–6f | Inline edits |
| `vite.config.ts` | 3 | Full replacement |
| `src/lib/types.ts` | 4b | Inline addition |
| `src/components/tab-cvs/CandidateCard.tsx` | 6b | Full replacement (once) |
| `src/components/tab-cvs/slots/*.tsx` | 6c–6d | New files |
| `.env.example` | 3 | Inline addition |

---

## Timeline Impact

| Change | Before | After |
|--------|--------|-------|
| Phase 2→Phase 3 dependency | Sequential (Phase 3 waits for Phase 2) | Parallel (Phase 3 starts after task 7 + task 12) |
| Merge conflicts on `main.py` | 6+ agents editing same file | 0 — auto-discovery |
| Merge conflicts on `CandidateCard.tsx` | 7 agents editing same file | 0 — slot system, one file per task |
| Missing file upload | Phase 2 has no file access | `POST /api/cv-files/upload` bridges the gap |
| Missing scoreBreakdown | Undefined contract | Fully specified Pydantic + TypeScript |
| Missing Vite proxy | Dev mode broken | `VITE_API_TARGET` + proxy config |
| **Total wall-clock savings** | N/A | **~3–4 days** from Phase 2/3 parallelization + zero merge-conflict resolution time |
