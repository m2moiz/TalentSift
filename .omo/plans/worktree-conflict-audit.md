# Worktree Parallel Execution Conflict Audit

> **Audited:** `feature-roadmap.md` (1754 lines, 28 V1 tasks across 4 phases)
> **Date:** 2026-06-26
> **Question:** With 28 V1 tasks running simultaneously in isolated worktrees, where do they collide?

---

## Executive Summary

**15 distinct files are modified by 2+ tasks.** Five of these are lockfile conflicts (solved by post-merge regeneration). Three are structural (solved by importlib auto-discovery). Seven are genuine merge conflicts that need mitigation. **The CandidateCard slot system — relied upon by 9 tasks — does NOT exist in the plan.** This is the single biggest risk: without it, `CandidateCard.tsx` faces a 9-way merge conflict.

### Conflict Scorecard

| Severity | Count | Files |
|----------|-------|-------|
| **CRITICAL** — missing infrastructure | 1 | `CandidateCard.tsx` slot system (not built by any task) |
| **HIGH** — 3+ tasks modify same file | 5 | `backend/main.py`, `src/App.tsx`, `pnpm-lock.yaml`, `backend/requirements.txt`, `src/lib/prompts.ts` |
| **MEDIUM** — 2 tasks modify same file | 4 | `AppShell.tsx`, `useCvMatching.ts`, `useOpHistory.tsx`, `vite.config.ts` |
| **LOW** — lockfile/duplicate-create | 4 | `pnpm-lock.yaml`, `requirements.txt`, `alembic.ini`, `package.json` |
| **SAFE** — one-file-per-module pattern | 30+ | All `backend/models/*.py`, `backend/schemas/*.py`, `backend/services/*.py`, `backend/api/*.py` (when each task creates distinct files) |

---

## §1: Complete File × Task Matrix

### Legend
- **C** = Creates (new file — SAFE)
- **M** = Modifies existing file (CONFLICT if ≥2 tasks touch it)
- **D** = Deletes file
- **⚠️** = CONFLICT (2+ tasks)
- **✅** = SAFE (single task or importlib)

### §1a: Backend Files

| File | 3a | 3b | 3c | 3d | 3e | 4 | 6 | 7 | 12 | 13 | 14 | 15 | 17 | 18 | 19 | 20 | 21 | Verdict |
|------|:--:|:--:|:--:|:--:|:--:|:-:|:-:|:-:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|--------|
| `backend/main.py` | C* | M | - | M | - | - | - | - | - | - | - | - | - | - | - | - | - | **⚠️ HIGH — 3 tasks** |
| `backend/database.py` | C | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | ✅ 3a only |
| `backend/config.py` | C | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | ✅ 3a only |
| `backend/models/__init__.py` | C | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | ✅ importlib |
| `backend/models/user.py` | C | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | ✅ 3a only |
| `backend/models/need_analysis.py` | C | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | ✅ 3a only |
| `backend/models/cv_match.py` | C | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | ✅ 3a only |
| `backend/models/ranking.py` | C | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | ✅ 3a only |
| `backend/models/client_brief.py` | C | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | ✅ 3a only |
| `backend/models/preference.py` | C | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | ✅ 3a only |
| `backend/models/audit_log.py` | C | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | ✅ 3a only |
| `backend/models/cv_file.py` | C | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | ✅ 3a only |
| `backend/models/enrichment_cache.py` | C | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | ✅ 3a only |
| `backend/schemas/auth.py` | - | C | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | ✅ 3b only |
| `backend/schemas/need_analysis.py` | - | - | C | - | - | - | - | - | - | - | - | - | - | - | - | - | - | ✅ 3c only |
| `backend/schemas/cv_matching.py` | - | - | C | - | - | - | - | - | - | - | - | - | - | - | - | - | - | ✅ 3c only |
| `backend/schemas/ranking.py` | - | - | C | - | - | - | - | - | - | - | - | - | - | - | - | - | - | ✅ 3c only |
| `backend/schemas/preferences.py` | - | - | C | - | - | - | - | - | - | - | - | - | - | - | - | - | - | ✅ 3c only |
| `backend/schemas/cv_files.py` | - | - | - | - | C | - | - | - | - | - | - | - | - | - | - | - | - | ✅ 3e only |
| `backend/schemas/integrity.py` | - | - | - | - | - | - | - | - | C | M? | M? | M? | M? | - | - | - | - | ⚠️ See §2d |
| `backend/schemas/verification.py` | - | - | - | - | - | - | - | - | - | - | - | - | - | C | C | C | C | ⚠️ See §2d |
| `backend/api/auth.py` | - | C | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | ✅ 3b only |
| `backend/api/need_analysis.py` | - | - | C | - | - | - | - | - | - | - | - | - | - | - | - | - | - | ✅ 3c only |
| `backend/api/cv_matches.py` | - | - | C | - | - | - | - | - | - | - | - | - | - | - | - | - | - | ✅ 3c only |
| `backend/api/rankings.py` | - | - | C | - | - | - | - | - | - | - | - | - | - | - | - | - | - | ✅ 3c only |
| `backend/api/briefs.py` | - | - | C | - | - | - | - | - | - | - | - | - | - | - | - | - | - | ✅ 3c only |
| `backend/api/preferences.py` | - | - | C | - | - | - | - | - | - | - | - | - | - | - | - | - | - | ✅ 3c only |
| `backend/api/dependencies.py` | - | - | C | - | - | - | - | - | - | - | - | - | - | - | - | - | - | ✅ 3c only |
| `backend/api/cv_files.py` | - | - | - | - | C | - | - | - | - | - | - | - | - | - | - | - | - | ✅ 3e only |
| `backend/api/hidden_text.py` | - | - | - | - | - | - | - | - | - | C | - | - | - | - | - | - | - | ✅ |
| `backend/api/metadata.py` | - | - | - | - | - | - | - | - | - | - | C | - | - | - | - | - | - | ✅ |
| `backend/api/ai_detection.py` | - | - | - | - | - | - | - | - | - | - | - | C | - | - | - | - | - | ✅ |
| `backend/api/keyword_stuffing.py` | - | - | - | - | - | - | - | - | - | - | - | - | C | - | - | - | - | ✅ |
| `backend/api/osint.py` | - | - | - | - | - | - | - | - | - | - | - | - | - | C | - | - | - | ✅ |
| `backend/api/timeline.py` | - | - | - | - | - | - | - | - | - | - | - | - | - | - | C | - | - | ✅ |
| `backend/api/company_check.py` | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | C | - | ✅ |
| `backend/api/sanctions.py` | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | C | ✅ |
| `backend/services/llm_client.py` | - | - | - | C | - | - | - | - | - | - | - | - | - | - | - | - | - | ✅ 3d only |
| `backend/services/resume_parser.py` | - | - | - | - | - | - | - | C | - | - | - | - | - | - | - | - | - | ✅ 7 only |
| `backend/services/hidden_text.py` | - | - | - | - | - | - | - | - | C* | C | - | - | - | - | - | - | - | **⚠️ LOW** — 12 creates skeleton, 13 fills it |
| `backend/services/metadata.py` | - | - | - | - | - | - | - | - | C* | - | C | - | - | - | - | - | - | **⚠️ LOW** — 12 creates skeleton, 14 fills it |
| `backend/services/ai_detection.py` | - | - | - | - | - | - | - | - | C* | - | - | C | - | - | - | - | - | **⚠️ LOW** — 12 creates skeleton, 15 fills it |
| `backend/services/github_crossref.py` | - | - | - | - | - | - | - | - | C | - | - | - | - | - | - | - | - | ✅ 12 only (16 is V2) |
| `backend/services/keyword_stuffing.py` | - | - | - | - | - | - | - | - | C* | - | - | - | C | - | - | - | - | **⚠️ LOW** — 12 creates skeleton, 17 fills it |
| `backend/services/osint.py` | - | - | - | - | - | - | - | - | - | - | - | - | - | C | - | - | - | ✅ 18 only |
| `backend/services/timeline.py` | - | - | - | - | - | - | - | - | - | - | - | - | - | - | C | - | - | ✅ 19 only |
| `backend/services/company_check.py` | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | C | - | ✅ 20 only |
| `backend/services/sanctions.py` | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | C | ✅ 21 only |
| `backend/config/llm.yaml` | - | - | - | C | - | - | - | - | - | - | - | - | - | - | - | - | - | ✅ 3d only |
| `backend/config/use_cases.yaml` | - | - | - | C | - | - | - | - | - | - | - | - | - | - | - | - | - | ✅ 3d only |
| `backend/requirements.txt` | - | - | - | - | - | - | C | M? | M | - | - | - | - | - | - | - | - | **⚠️ LOW — lockfile** |
| `backend/alembic.ini` | C | - | - | - | - | - | C | - | - | - | - | - | - | - | - | - | - | **⚠️ MED — duplicate create** |
| `compose.yml` | - | - | - | - | - | C | - | - | - | - | - | - | - | - | - | - | - | ✅ 4 only |
| `compose.prod.yml` | - | - | - | - | - | C | - | - | - | - | - | - | - | - | - | - | - | ✅ 4 only |
| `Dockerfile` | - | - | - | - | - | C | - | - | - | - | - | - | - | - | - | - | - | ✅ 4 only |
| `.dockerignore` | - | - | - | - | - | C | - | - | - | - | - | - | - | - | - | - | - | ✅ 4 only |
| `.env.example` (root) | - | - | - | - | - | C | - | - | - | - | - | - | - | - | - | - | - | ✅ 4 only (canonical) |
| `backend/.env.example` | - | - | - | - | - | - | C | - | - | - | - | - | - | - | - | - | - | ✅ 6 only |

\* Task 3a creates `main.py` as skeleton; task 3b adds lifespan handler; task 3d completes it. Merge order (3a→3b→3d) mitigates but doesn't eliminate conflict risk.
\** Tasks 12 creates service file stubs; 13-17 create full implementations. Merge order (12 first, then 13-17) resolves this.

### §1b: Frontend Files

| File | 1 | 2 | 5a | 5b | 5c | 6 | 8 | 9 | 10 | 11 | 13 | 14 | 15 | 17 | 18 | 19 | 20 | 21 | 24 | 27 | Verdict |
|------|:-:|:-:|:--:|:--:|:--:|:-:|:-:|:-:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|--------|
| `src/App.tsx` | M | - | M | - | M | - | M | - | - | - | - | - | - | - | - | - | - | - | - | M | **⚠️ HIGH — 5 tasks** |
| `src/main.tsx` | M? | - | M? | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | ⚠️ possible (1, 5a) |
| `src/components/layout/AppShell.tsx` | M | - | - | - | M | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | **⚠️ MED — 2 tasks** |
| `src/components/layout/TabBar.tsx` | - | - | - | - | - | - | - | - | - | M | - | - | - | - | - | - | - | - | - | - | ✅ 11 only |
| `src/components/layout/OpHistoryBar.tsx` | - | - | - | - | - | - | M | - | - | M | - | - | - | - | - | - | - | - | - | - | **⚠️ MED — 2 tasks** |
| `**src/components/tab-cvs/CandidateCard.tsx**` | - | M | - | - | - | - | - | M | - | M | M | M | M | M | M | M | M | M | - | - | **⚠️🔥 CRITICAL — 10 tasks** |
| `src/components/tab-cvs/CVInputs.tsx` | - | - | - | - | - | - | - | - | M | M | - | - | - | - | - | - | - | - | - | - | **⚠️ MED — 2 tasks** |
| `src/components/tab-cvs/slots/ScoreBreakdownPanel.tsx` | - | - | - | - | - | - | - | C | - | - | - | - | - | - | - | - | - | - | - | - | ✅ 9 only (slot) |
| `src/hooks/useOpHistory.tsx` | - | - | - | M | - | - | D | - | - | - | - | - | - | - | - | - | - | - | - | - | **⚠️ HIGH — 5b modifies, 8 deletes** |
| `src/hooks/useCvMatching.ts` | - | - | - | C | - | - | - | - | M | - | - | - | - | - | - | - | - | - | - | - | **⚠️ MED — 2 tasks** |
| `src/hooks/useNeedAnalysis.ts` | - | - | - | C | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | ✅ 5b only |
| `src/hooks/useRanking.ts` | - | - | - | C | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | ✅ 5b only |
| `src/hooks/useDashboard.ts` | - | - | - | C | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | ✅ 5b only |
| `src/hooks/usePreferenceLibrary.ts` | - | - | - | - | - | - | C | - | - | - | - | - | - | - | - | - | - | - | - | - | ✅ 8 only |
| `src/contexts/AuthContext.tsx` | - | - | C | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | ✅ 5a only |
| `src/lib/api-client.ts` | - | - | C | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | ✅ 5a only |
| `src/lib/animations.ts` | - | C | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | ✅ 2 only |
| `src/lib/cv-reader.ts` | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | ✅ 7 only |
| `src/lib/prompts.ts` | - | - | - | - | - | - | - | M | M | - | - | - | - | - | - | - | - | - | - | - | **⚠️ HIGH — 2 tasks** |
| `src/pages/Login.tsx` | - | - | C | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | ✅ 5a only |
| `src/pages/Register.tsx` | - | - | C | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | ✅ 5a only |
| `src/pages/History.tsx` | - | - | - | - | C | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | ✅ 5c only |
| `src/pages/Portal.tsx` | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | C | ✅ 27 only |
| `src/components/ProtectedRoute.tsx` | - | - | C | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | ✅ 5a only |
| `src/components/magicui/*` | - | C | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | ✅ 2 only |
| `package.json` | M? | M | - | - | - | M | - | - | - | - | - | - | - | - | - | - | - | - | - | - | **⚠️ MED — 3 tasks** |
| `pnpm-lock.yaml` | M | M | - | - | - | M | - | - | - | - | - | - | - | - | - | - | - | - | M | - | **⚠️ LOW — lockfile** |
| `vite.config.ts` | - | - | - | - | - | M | - | - | - | - | - | - | - | - | - | - | - | - | - | - | **⚠️ LOW — task 4 also touches** |
| `extension/*` | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | C | - | ✅ 24 only (separate dir) |

### §1c: Config & Dependency Files

| File | 3d | 4 | 6 | 7 | 12 | 15 | 18 | 24 | Verdict |
|------|:--:|:-:|:-:|:-:|:--:|:--:|:--:|:--:|--------|
| `backend/requirements.txt` | - | - | C | M | M | - | - | - | ⚠️ lockfile |
| `backend/config/llm.yaml` | C | - | - | - | - | - | - | - | ✅ 3d only |
| `backend/config/use_cases.yaml` | C | - | - | - | - | - | - | - | ✅ 3d only |
| `.env.example` (root) | - | C | - | - | - | - | - | - | ✅ 4 canonical (contains ALL vars) |
| `backend/.env.example` | - | - | C | - | - | - | - | - | ✅ 6 only |
| `package.json` | - | - | M | - | - | - | - | M | ⚠️ 2 tasks add deps |
| `pnpm-lock.yaml` | - | - | M | - | - | - | - | M | ⚠️ lockfile |
| `vite.config.ts` | - | M | M | - | - | - | - | - | ⚠️ 2 tasks |

---

## §2: Detailed Conflict Analysis

### §2a: `backend/main.py` — HIGH (3 tasks)

| Task | What it writes | Can it be a separate line? |
|------|---------------|---------------------------|
| 3a | Empty skeleton: `app = FastAPI()` + importlib router auto-discovery loop | Core scaffold |
| 3b | Lifespan handler (admin seed) + `app.include_router(auth_router)` | Could be in auth.py's own `__init__` |
| 3d | CORS middleware, health endpoints, final importlib loop, Langfuse init | Lifespan handler combined with 3b's |

**Root cause:** `main.py` doesn't use importlib for its own sections. The lifespan handler, CORS config, and health endpoints are all inline code.

**Mitigation options:**
1. **Sequenced merge** (current plan): orchestrator merges 3a → 3b → 3d in order. `git merge` will attempt 3-way merge on `main.py`. If sections are non-overlapping (imports block, lifespan block, CORS block), git can merge cleanly. **Risk: medium** — depends on clean separation.
2. **Plugin pattern**: Have `main.py` load lifespan handlers and middleware from a registry (like `backend/middleware.py` + decorators). Task 3b adds `@lifespan_handler`, task 3d adds `@middleware`. **Recommended fix.**
3. **Orchestrator script**: Write a merge script that concatenates the unique sections from each branch's `main.py`. **Heavy.**

**Recommendation:** Option 2 — extend importlib discovery to lifespan handlers and middleware. Each task drops a file in `backend/lifespan/` or decorates, and `main.py` discovers them.

---

### §2b: `src/App.tsx` — HIGH (5 tasks)

| Task | What it does | Overlap |
|------|-------------|---------|
| 1 | Wraps content in new AppShell layout, may restructure JSX | High — structural rewrite |
| 5a | Wraps app in `<AuthProvider>`, adds route-based auth gating | High — wraps root |
| 5c | Adds history route `<Route path="/history">` | Medium |
| 8 | Switches from `useOpHistory` to `usePreferenceLibrary` + PreferencePicker | Low |
| 27 | Adds portal route `<Route path="/portal">` | Low |

**Root cause:** `App.tsx` is the integration point for layout, routing, auth, and state. Five tasks need to touch it for different reasons.

**Mitigation options:**
1. **Sequenced merge**: 1 first (layout) → 5a (auth) → 5c/8/27 (routes + hooks). Non-overlapping sections might merge clean, but the auth wrapper in 5a changes the root structure significantly.
2. **Route-based split**: Define routes in a separate `src/routes.tsx` that App imports. Each task adds a route to the routes file. **Only helps with routing conflicts, not auth/layout.**
3. **Component registry**: `App.tsx` becomes a thin shell that renders registered components. Each task registers its component via a separate file. **Heavy abstraction for 5 tasks.**

**Recommendation:** Route extraction (create `src/routes.tsx`) + sequenced merge (1, then 5a, then 5c/8/27 in parallel). Accept that manual conflict resolution in App.tsx is the cost of parallelization. Expected resolution time: ~15 min for an experienced developer.

---

### §2c: `src/components/tab-cvs/CandidateCard.tsx` — 🔥 CRITICAL (10 tasks)

**This is the single biggest gap in the plan's worktree strategy.**

10 tasks add content to CandidateCard:

| Task | What it adds | Slot name |
|------|-------------|-----------|
| 2 | Animation variants (stagger children, fade-in) | N/A (wrapper) |
| 9 | ScoreBreakdownPanel — "Why this score?" | `score-breakdown` |
| 11 | French/English text localization | N/A (i18n) |
| 13 | "⚠️ Hidden text detected" badge | `hidden-text-badge` |
| 14 | Metadata panel with flags | `metadata-panel` |
| 15 | "🤖 AI-generated" badge | `ai-detection-badge` |
| 17 | "Keyword density: X%" indicator | `keyword-density` |
| 18 | OSINT results panel | `osint-results` |
| 19 | Timeline verification slot | `timeline` |
| 20 | "✅ Company verified" / "⚠️ Ghost employer" badge | `company-badge` |
| 21 | "🚫 Sanctioned" / "⚠️ PEP" badge | `sanctions-badge` |

**The plan references a "CandidateCard slot registry" in task 9:**
> "register it in the CandidateCard slot registry"

**But NO task builds this slot system.** The current `CandidateCard.tsx` (222 lines) has hardcoded sections: Strengths, Watch Points, Call Questions, Op History Alignment. There is no slot system.

**Gap impact:** Without a slot system, every task that adds a badge or panel must directly edit `CandidateCard.tsx`. With 10 parallel edits, the merge is nearly certain to produce conflicts that git cannot resolve automatically.

**Required fix — build the slot system in task 6 (scaffold):**

```typescript
// src/components/tab-cvs/slots/registry.ts
import type { FC, ReactElement } from "react";
import type { CandidateMatch } from "../../../lib/types";

export interface CandidateCardSlot {
  id: string;
  component: FC<{ candidate: CandidateMatch; locale: string }>;
  priority: number; // sort order within the card
  badge?: FC<{ candidate: CandidateMatch }>; // compact version for card header
}

const slotRegistry: Map<string, CandidateCardSlot> = new Map();

export function registerSlot(slot: CandidateCardSlot): void {
  slotRegistry.set(slot.id, slot);
}

export function getRegisteredSlots(): CandidateCardSlot[] {
  return [...slotRegistry.values()].sort((a, b) => a.priority - b.priority);
}

export function getRegisteredBadges(): FC<{ candidate: CandidateMatch }>[] {
  return [...slotRegistry.values()]
    .filter(s => s.badge)
    .sort((a, b) => a.priority - b.priority)
    .map(s => s.badge!);
}
```

Then `CandidateCard.tsx` renders:
```tsx
{getRegisteredSlots().map(slot => <slot.component candidate={candidate} locale={locale} />)}
```

Each task 9, 13-21 creates a single file under `src/components/tab-cvs/slots/` that exports a component AND registers it. **Zero modifications to CandidateCard.tsx needed.**

**Verdict: If slot system is built (by task 6 or equivalent), 10-way conflict becomes SAFE. Without it: guaranteed merge conflict.**

---

### §2d: Schema Files — `integrity.py` and `verification.py`

The plan creates two monolithic schema files: `integrity.py` (all Phase 2 schemas) and `verification.py` (all Phase 3 schemas). Tasks 13-17 all add to `integrity.py`; tasks 18-21 all add to `verification.py`.

| File | Tasks that write to it | Conflict? |
|------|----------------------|-----------|
| `schemas/integrity.py` | 12 (skeleton), 13 (HiddenTextResult), 14 (MetadataResult), 15 (AiDetectionResult), 17 (KeywordStuffingResult) | **⚠️ 5 tasks** |
| `schemas/verification.py` | 18 (OsintResult), 19 (TimelineResult), 20 (CompanyValidationResult), 21 (SanctionsResult) | **⚠️ 4 tasks** |

**Root cause:** The plan says "ONE FILE PER SCHEMA" but groups multiple schemas into `integrity.py` and `verification.py`.

**Mitigation:** Further split — one file per schema:
- `schemas/hidden_text.py` → only task 13
- `schemas/metadata.py` → only task 14
- `schemas/ai_detection.py` → only task 15
- `schemas/keyword_stuffing.py` → only task 17
- `schemas/osint.py` → only task 18
- `schemas/timeline.py` → only task 19
- `schemas/company_check.py` → only task 20
- `schemas/sanctions.py` → only task 21

Combined with `schemas/__init__.py` importlib auto-discovery (which the plan already specifies), this eliminates ALL schema conflicts.

**Recommendation:** Split `integrity.py` and `verification.py` into individual files per schema. Update task 6's directory structure to reflect this.

---

### §2e: `src/lib/prompts.ts` — HIGH (2 tasks)

Tasks 9 and 10 both modify the AI prompt templates. Task 9 adds ScoreBreakdown structure; task 10 makes prompt CV-count dynamic.

**Conflict type:** Text-level merge — both modify the same function bodies. `git merge` will likely produce conflicts since the changed regions overlap.

**Mitigation:** Split prompts into separate files per use-case:
- `src/lib/prompts/need-analysis.ts`
- `src/lib/prompts/cv-matching.ts`
- `src/lib/prompts/ranking.ts`

Then tasks modify only their relevant prompt file. Task 6 should do this split as part of scaffold.

---

### §2f: `src/hooks/useOpHistory.tsx` — DELETE vs MODIFY

Task 5b modifies it (migrates localStorage → API). Task 8 deletes it (replaced by `usePreferenceLibrary.ts`).

**Conflict type:** If task 5b creates `useOpHistory.tsx` with new API-based logic, and task 8 deletes the file, the merge depends on which branch is merged first. If 5b merged first (creates file), then 8 (deletes file) → deletion wins. But if 8 merged first, the file doesn't exist, and 5b can't "modify" a non-existent file.

**Mitigation:** Task 8 should NOT delete `useOpHistory.tsx`. Instead:
1. Task 8 creates `usePreferenceLibrary.ts` that wraps the backend API.
2. The orchestrator, after merging all tasks, replaces `useOpHistory` imports with `usePreferenceLibrary` in `App.tsx` and `OpHistoryBar.tsx`.
3. The orchestrator then deletes `useOpHistory.tsx`.

Task 8's description should change from "delete useOpHistory.tsx" to "create usePreferenceLibrary.ts as the canonical hook — orchestrator will migrate callers."

---

### §2g: `backend/requirements.txt` — Lockfile conflict

Tasks 6, 7, 12, 15, and 18 all add dependencies. Task 6 installs the bulk (19 packages). Task 7 adds `langdetect`. Task 12 adds `gitpython`. Task 15 adds `thinkst-zippy`. Task 18 adds `maigret`.

**Conflict type:** Standard dependency conflict. Any `pip freeze > requirements.txt` or manual line addition will conflict.

**Mitigation in plan:** The orchestrator regenerates `requirements.txt` after ALL merges (line 1006): `pip install -r backend/requirements.txt`. But that's a READ, not a WRITE. Should be: `pip freeze > backend/requirements.txt` or `uv pip compile pyproject.toml -o backend/requirements.txt`.

**Recommendation:** Task 6 creates `backend/pyproject.toml` with ALL deps. Other tasks add to `pyproject.toml` (NOT `requirements.txt`). Orchestrator runs `uv pip compile` or `pip freeze` to regenerate `requirements.txt` after all merges. Or better: tasks commit individual requirement additions to `backend/requirements.in` and orchestrator compiles.

**Actually, simplest fix:** Each task adds its dependency to a SEPARATE file: `backend/requirements-task-N.txt`. The orchestrator concatenates all files and deduplicates. Zero merge conflicts.

---

### §2h: `.env.example` — SAFE (canonical, single-task)

Task 4 creates the root `.env.example` with ALL environment variables for all phases. No other task modifies this file. Task 6 creates a separate `backend/.env.example`.

**Verdict: SAFE.** The canonical `.env.example` is complete — includes LLM providers, external APIs, backend config, Langfuse, and feature flags for ALL phases. No task needs to add to it.

**Verification:** Checked every Phase 2-4 task for env vars not in task 4's `.env.example`:
- Task 15 (ZipPy): No env vars needed (offline)
- Task 16 (GitHub): Deferred V2
- Task 18 (maigret): No env vars (offline + free APIs)
- Task 20 (OpenCorporates): Already in `.env.example` (`OPENCORPORATES_API_TOKEN`)
- Task 21 (OpenSanctions): Already in `.env.example` (`OPENSANCTIONS_API_KEY`)
- Task 22 (CourtListener): Deferred V2
- Task 23 (ATS): Deferred V2

**All env vars covered. SAFE.**

---

### §2i: `package.json` + `pnpm-lock.yaml` — Lockfile conflicts

| Task | Adds to `package.json` |
|------|----------------------|
| 1 | Potentially shadcn-related deps |
| 2 | `framer-motion` (explicitly: `pnpm add framer-motion`) |
| 6 | `pdfjs-dist`, `mammoth`, `tesseract.js`, `framer-motion` (duplicate with task 2!) |
| 24 | WXT framework deps |

**Task 2 and task 6 both add `framer-motion`.** This is a CONFLICT even if the lockfile is regenerated — the `package.json` `dependencies` section will have duplicate entries.

**Mitigation:** Task 6 should explicitly list ALL frontend deps. Task 2 should NOT run `pnpm add framer-motion` — it should document the dependency and let task 6 handle it. Or use `pnpm add --no-lockfile` and not commit `pnpm-lock.yaml`.

**Recommendation:** All frontend deps are installed by task 6 ONLY. Other tasks document their dependencies but don't run `pnpm add`. Orchestrator runs `pnpm install` after all merges to regenerate lockfile.

---

### §2j: `pnpm-lock.yaml` — Regeneration required

**Touched by:** Tasks 1, 2, 6, 24 (every `pnpm add`).

**Mitigation:** Orchestrator runs `pnpm install` after all merges (plan line 1006 already specifies this).

**Verdict: SAFE if regenerated.** The orchestrator step handles this.

---

### §2k: `vite.config.ts` — 2 tasks (LOW)

Task 4 adds Docker proxy config. Task 6 also adds/updates proxy config.

**Conflict type:** Both add to the `server.proxy` section. If they add different proxy entries (e.g., `/api` and `/auth`), git can merge cleanly. If they both add `/api`, conflict.

**Mitigation:** Task 6 creates the FULL `vite.config.ts` including proxy. Task 4 does NOT modify it — just documents the proxy requirement for Docker.

---

### §2l: `backend/alembic.ini` + migrations — Duplicate create (MEDIUM)

Task 3a: `alembic init migrations` (creates `alembic.ini` + `migrations/` directory).  
Task 6: `alembic init migrations` + `alembic revision --autogenerate -m "initial"`.

Both create the same directory and ini file. Task 6 additionally creates a migration script that task 3a doesn't.

**Conflict type:** Identical file creation → git merge of two identical `alembic.ini` files is clean. But the migration script created by task 6 (in `migrations/versions/`) will conflict with task 3a's empty versions directory.

**Mitigation:** Task 3a should NOT run `alembic init`. Task 6 does it once. The plan says task 3a creates `alembic.ini` and `migrations/` directory — but this should be task 6's responsibility.

**Recommendation:** Remove `alembic init` from task 3a. Task 3a ONLY creates models and `database.py`. Task 6 handles ALL scaffolding including `alembic init` + initial revision.

---

## §3: Importlib Auto-Discovery Coverage Audit

The plan claims importlib auto-discovery for: `models/`, `schemas/`, `services/`, `api/`.

### §3a: `models/__init__.py` — importlib auto-discovery
```
✅ COVERED. Plan line 1388: "models/__init__.py also uses importlib"
```
All 9 models are created by task 3a only. The auto-discovery pattern ensures Alembic's `target_metadata` can collect from all models without a hand-maintained import list. **SAFE.**

### §3b: `schemas/__init__.py` — importlib auto-discovery
```
✅ COVERED. But compromised by monolithic integrity.py and verification.py (see §2d).
```
Fix: Split monolithic files into per-schema files → auto-discovery works perfectly.

### §3c: `services/__init__.py` — importlib auto-discovery
```
✅ COVERED. Each task 3d, 7, 13-21 creates a distinct file.
```
Only issue: task 12 creates skeleton files that tasks 13-17 fill in (see §1a notes). This is resolvable with merge ordering.

### §3d: `api/` — Router auto-discovery in `main.py`
```
✅ COVERED. Plan line 1395: "Every new route = new file in api/ → auto-included."
```
Combined with `api/__init__.py` importlib pattern. Each task creates a distinct endpoint file. **SAFE** as long as no task creates a monolithic `analyze.py`.

### §3e: What's NOT covered by importlib?
```
❌ main.py — CORS, lifespan, health endpoints (inline code, not importlib)
❌ App.tsx — routing, auth wrapping, state management (React component, not importlib)
❌ CandidateCard.tsx — slots/badges (no slot system exists)
❌ prompts.ts — AI prompt templates (single file, multiple modifiers)
❌ useOpHistory.tsx — delete vs modify race
```

---

## §4: CandidateCard Slot System — DESIGN REQUIRED

### Current state
`CandidateCard.tsx` (222 lines) renders 4 hardcoded sections: Strengths, Watch Points, Call Questions, Op History Alignment. There is no extension point.

### Plan reference
Task 9 mentions "CandidateCard slot registry" but no task builds it.

### Required: Slot system built by task 6 (scaffold)

**Files to create in task 6:**

1. **`src/components/tab-cvs/slots/registry.ts`** — Registration + aggregation. Exports `registerSlot()`, `getRegisteredSlots()`, `getRegisteredBadges()`.

2. **Refactor `CandidateCard.tsx`** — After the hardcoded sections, render registered slots:
   ```tsx
   {getRegisteredSlots().map(slot => (
     <div key={slot.id} className="candidate-card-slot">
       <slot.component candidate={candidate} locale={locale} />
     </div>
   ))}
   ```
   And in the card header, render registered badges:
   ```tsx
   {getRegisteredBadges().map((Badge, i) => <Badge key={i} candidate={candidate} />)}
   ```

3. **Slot priority conventions:**
   - 10-19: Core UX slots (score breakdown)
   - 20-29: Integrity badges (hidden text, metadata, AI detection, keyword density)
   - 30-39: Verification results (OSINT, timeline, company, sanctions)
   - 40+: Platform (bias report)

### Post-fix conflict matrix for CandidateCard

| Task | File it touches | Conflict? |
|------|----------------|-----------|
| 2 | `CandidateCard.tsx` (animation variants) | ⚠️ STILL conflicts — requires slot system to support animation wrappers |
| 9 | `slots/ScoreBreakdownPanel.tsx` (NEW) | ✅ SAFE |
| 11 | `CandidateCard.tsx` (i18n strings) | ⚠️ STILL conflicts — locale strings are in-card |
| 13 | `slots/HiddenTextBadge.tsx` (NEW) | ✅ SAFE |
| 14 | `slots/MetadataPanel.tsx` (NEW) | ✅ SAFE |
| 15 | `slots/AiDetectionBadge.tsx` (NEW) | ✅ SAFE |
| 17 | `slots/KeywordDensityBadge.tsx` (NEW) | ✅ SAFE |
| 18 | `slots/OsintPanel.tsx` (NEW) | ✅ SAFE |
| 19 | `slots/TimelinePanel.tsx` (NEW) | ✅ SAFE |
| 20 | `slots/CompanyBadge.tsx` (NEW) | ✅ SAFE |
| 21 | `slots/SanctionsBadge.tsx` (NEW) | ✅ SAFE |

8 of 11 tasks become SAFE. Tasks 2 (animations) and 11 (i18n) still touch `CandidateCard.tsx` directly, but those can be sequenced.

**For task 2 (animations):** A slot system can't abstract animation wrappers (they wrap the entire card). Solution: task 2 creates animation utilities in `src/lib/animations.ts` WITHOUT modifying `CandidateCard.tsx`. The orchestrator applies animations as a post-merge pass.

**For task 11 (i18n):** Use a centralized `src/lib/i18n.ts` lookup system. CandidateCard reads strings from the i18n module instead of having hardcoded French/English strings. Task 11 adds translations to the i18n module, not to CandidateCard.

**Verdict with slot system + animation deferral + i18n centralization: ALL 10 tasks become SAFE (no CandidateCard.tsx modifications).**

---

## §5: DB Model Conflicts — NONE (all models by single task)

Task 3a creates ALL 9 SQLAlchemy models in separate files. No other task creates or modifies models.

| Model file | Created by | Modified by | Conflict? |
|-----------|-----------|------------|-----------|
| `user.py` | 3a | — | ✅ |
| `need_analysis.py` | 3a | — | ✅ |
| `cv_match.py` | 3a | — | ✅ |
| `ranking.py` | 3a | — | ✅ |
| `client_brief.py` | 3a | — | ✅ |
| `preference.py` | 3a | — | ✅ |
| `audit_log.py` | 3a | — | ✅ |
| `cv_file.py` | 3a | — | ✅ |
| `enrichment_cache.py` | 3a | — | ✅ |

**Alembic migration:** Orchestrator generates migration AFTER all merges (plan line 1003). No task generates a migration independently (task 3a explicitly says "Do NOT run alembic revision"). Task 6 DOES generate one, but the orchestrator's `alembic revision --autogenerate -m "v1-merged"` supercedes it.

**Verdict: SAFE.** No DB model merge conflicts.

---

## §6: Dependency Conflicts

### §6a: `framer-motion` — added by BOTH task 2 and task 6

```
CONFLICT. Task 2: "pnpm add framer-motion". Task 6: "pnpm add framer-motion".
```

**Fix:** Task 6 is the canonical dependency installer. Task 2 should NOT run `pnpm add` — it should document `framer-motion` as a dependency and import it. Task 6 handles the actual `pnpm add`.

### §6b: `thinkst-zippy` — added by BOTH task 6 and task 15

```
CONFLICT. Task 6 installs it. Task 15 also installs it.
```

**Fix:** Same pattern — task 6 handles ALL pip installations. Tasks 7, 12, 15, 18 document their dependencies; task 6 includes them.

### §6c: `maigret` — added by BOTH task 6 and task 18

```
CONFLICT. Task 6 installs it. Task 18 also says "pip install maigret".
```

**Fix:** Same — task 6 handles it.

### §6d: `langdetect` — added by task 7 only

```
SAFE. Only task 7 adds this. Task 6 should pre-install it as part of the scaffold.
```

**Recommendation:** Task 6 should pre-install ALL dependencies for ALL V1 phases. Individual tasks document their deps but don't run `pip install` or `pnpm add`. This is the existing pattern for `radon` (task 6 pre-installs it). Apply uniformly.

---

## §7: Route Conflicts in App.tsx

5 tasks add/modify routes in `App.tsx`:

| Task | Route | Type |
|------|-------|------|
| 1 | N/A (layout restructuring) | Structural |
| 5a | Auth gate wrapping | Structural |
| 5c | `/history` | New route |
| 8 | N/A (hook swap) | State change |
| 27 | `/portal` | New route |

**Mitigation:** Extract routes to `src/routes.tsx` (created by task 6 scaffold):

```typescript
// src/routes.tsx — touched by tasks 5c and 27 only
import { History } from "./pages/History";
import { Portal } from "./pages/Portal";

export const routes = [
  { path: "/history", component: History },
  { path: "/portal", component: Portal },
];
```

App.tsx iterates over routes. Tasks 5c and 27 add entries to `routes.tsx` (non-overlapping additions → git merges cleanly).

Tasks 1 and 5a still touch App.tsx for structural changes, but they operate on different sections (1 = layout JSX, 5a = context provider wrapping). **2-task conflict instead of 5-task conflict.**

---

## §8: Complete Risk Matrix

| Risk | Tasks | Type | Mitigation | Residual Risk |
|------|-------|------|-----------|---------------|
| CandidateCard slot system MISSING | 2,9,11,13-21 (10 tasks) | Missing infrastructure | Build slot system in task 6 scaffold | **CRITICAL** → **LOW** after fix |
| `main.py` — 3 tasks write inline code | 3a,3b,3d | Same-file conflict | Plugin pattern (lifespan/middleware registry) | **HIGH** → **LOW** after fix |
| `App.tsx` — 5 tasks modify | 1,5a,5c,8,27 | Same-file conflict | Route extraction + sequenced merge | **HIGH** → **MEDIUM** after fix |
| `prompts.ts` — 2 tasks modify same functions | 9,10 | Same-file conflict | Split into per-use-case files | **HIGH** → **SAFE** after fix |
| `useOpHistory.tsx` — delete vs modify | 5b,8 | Delete/modify race | Task 8 creates new hook, orchestrator migrates callers | **HIGH** → **SAFE** after fix |
| `integrity.py` — 5 tasks add schemas | 12,13,14,15,17 | Same-file conflict | Split into per-schema files | **MEDIUM** → **SAFE** after fix |
| `verification.py` — 4 tasks add schemas | 18,19,20,21 | Same-file conflict | Split into per-schema files | **MEDIUM** → **SAFE** after fix |
| `package.json` — 3 tasks add deps | 1,2,6 | Same-file conflict | Task 6 is canonical installer | **MEDIUM** → **SAFE** after fix |
| `AppShell.tsx` — 2 tasks modify | 1,5c | Same-file conflict | Sequenced merge (1 first, 5c after) | **MEDIUM** → **LOW** |
| `CVInputs.tsx` — 2 tasks modify | 10,11 | Same-file conflict | Sequenced merge | **LOW** |
| `OpHistoryBar.tsx` — 2 tasks modify | 8,11 | Same-file conflict | Mutation in separate hooks | **LOW** |
| `backend/services/*` — 12 creates stubs, 13-17 fill | 12,13,14,15,17 | Stub vs full impl | Merge order: accept tasks 13-17 over task 12 | **LOW** |
| `backend/alembic.ini` — duplicate create | 3a,6 | Duplicate create | Task 6 only; remove from task 3a | **LOW** |
| `backend/requirements.txt` — multiple additions | 6,7,12,15,18 | Lockfile | Regenerate from pyproject.toml after merge | **LOW** (regenerated) |
| `pnpm-lock.yaml` — multiple pnpm adds | 1,2,6,24 | Lockfile | Regenerate after merge | **SAFE** (regenerated) |
| `vite.config.ts` — 2 tasks add proxy | 4,6 | Same-file | Task 6 creates final version | **LOW** |
| `.env.example` — all vars in task 4 | 4 only | N/A | Single canonical source | **SAFE** ✅ |
| DB models — all in task 3a | 3a only | N/A | One task creates all models | **SAFE** ✅ |
| Chrome extension — separate directory | 24 only | N/A | Isolated directory | **SAFE** ✅ |

---

## §9: Required Plan Corrections

### CRITICAL (must fix before execution)

1. **Build CandidateCard slot system in task 6.** Create `src/components/tab-cvs/slots/registry.ts` with `registerSlot()` / `getRegisteredSlots()` / `getRegisteredBadges()`. Refactor CandidateCard to render from registry. Task 6 is the right place — it's the scaffold task that must run before any feature task.

2. **Split `integrity.py` and `verification.py`.** Replace with individual schema files:
   - `schemas/hidden_text.py`, `schemas/metadata.py`, `schemas/ai_detection.py`, `schemas/keyword_stuffing.py`
   - `schemas/osint.py`, `schemas/timeline.py`, `schemas/company_check.py`, `schemas/sanctions.py`
   
   Update task 6's directory structure diagram.

3. **Fix task 8 — don't delete `useOpHistory.tsx`.** Task 8 creates `usePreferenceLibrary.ts`. The orchestrator replaces `useOpHistory` imports and deletes the old file after merge.

### HIGH (fix before or during execution)

4. **Move `alembic init` from task 3a to task 6.** Task 3a creates models + database.py only. Task 6 runs alembic init + creates the initial migration. Single source of truth for alembic scaffolding.

5. **Extract routes from App.tsx.** Create `src/routes.tsx` in task 6 scaffold. App.tsx becomes a thin shell: `<AuthProvider><AppShell>{renderRoutes()}</AppShell></AuthProvider>`. Add routes via non-overlapping additions to `routes.tsx`.

6. **Split `prompts.ts` into per-use-case files.** `src/lib/prompts/need-analysis.ts`, `cv-matching.ts`, `ranking.ts`. Task 6 scaffold creates these. Tasks 9 and 10 modify only their respective file.

7. **Task 6 is the canonical dependency installer.** All `pnpm add` and `pip install` commands happen in task 6 ONLY. Other tasks document dependencies in their task description; task 6 pre-installs them. Remove `pnpm add framer-motion` from task 2.

### MEDIUM (improve robustness)

8. **Plugin pattern for `main.py` extensibility.** Extend importlib discovery to lifespan handlers and middleware:
   - `backend/lifespan/` directory — each file exports an `async def register(app)` function
   - `backend/middleware/` directory — each file exports a list of middleware tuples
   - `main.py` discovers and applies all

9. **Centralize i18n in `src/lib/i18n.ts`.** CandidateCard reads strings from i18n module. Task 11 adds translations to i18n, not to CandidateCard.

10. **Defer animation application to post-merge.** Task 2 creates `src/lib/animations.ts` with variants. The orchestrator applies animation wrappers to CandidateCard as a post-merge pass, rather than task 2 modifying CandidateCard directly.

---

## §10: Final Verdict

**With all recommended fixes applied, 28 V1 tasks can run in parallel across isolated worktrees with the following residual conflict points:**

| Residual | Tasks | Reason | Resolution |
|----------|-------|--------|-----------|
| `main.py` | 3a,3b,3d | CORS/lifespan/health inline code | Plugin pattern (fix #8) reduces to SAFE. Without it: sequenced merge, manual resolution. |
| `App.tsx` | 1,5a | Layout + auth wrapping | Route extraction (fix #5) reduces from 5 tasks to 2. Remaining 2 modify different sections → git merges cleanly. |
| `AppShell.tsx` | 1,5c | Layout rewrite + header addition | Sequenced merge (1 first, 5c second). Non-overlapping sections. |

**Expected orchestrator merge time with all fixes: ~1-2 hours** (down from ~4-6 hours without fixes).

**Without fixes: CATASTROPHIC.** CandidateCard.tsx alone would require manual resolution of a 10-way conflict, which is essentially a rewrite. The slot system is non-negotiable.

**The plan's worktree claim of "2-3 days" is achievable ONLY with these fixes.** Without them, the merge phase alone could take 2-3 days.

---

## Appendix A: Task Dependency Map for Merge Order

```
MERGE ORDER (the only sequential constraint):

Batch 0 — Foundation (merge in order):
  3a (DB models + database.py) 
  → 3b (auth system, adds lifespan to main.py)  
  → 3d (infrastructure, finalizes main.py + config)
  → 6  (dependencies + scaffolds + slot system + routes.tsx)

Batch 1 — All remaining V1 tasks (merge in any order, different files):
  1, 2, 3c, 3e, 4, 5a, 5b, 5c,
  7, 8, 9, 10, 11,
  12, 13, 14, 15, 17,
  18, 19, 20, 21,
  24, 27

Post-merge:
  1. Resolve useOpHistory → usePreferenceLibrary migration (orchestrator script)
  2. Apply animation wrappers to CandidateCard (orchestrator script, using task 2's variants)
  3. alembic revision --autogenerate -m "v1-merged"
  4. alembic upgrade head
  5. pnpm install (regenerates lockfile)
  6. pip install -r backend/requirements.txt (or uv pip compile)
  7. pnpm run build && cd backend && pytest
```
