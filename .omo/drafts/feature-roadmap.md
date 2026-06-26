---
slug: feature-roadmap
status: awaiting-approval
intent: clear
pending-action: execute .omo/plans/feature-roadmap.md
approach: 5-phase OSS-cannibalization plan — 27 tasks, 20+ verified open-source integrations, dual-engine resume parser (BERT model primary + LLM fallback), deterministic AI detection (ZipPy + RoBERTa), deep GitHub analysis (PyDriller + lizard + radon), OSINT via clean Python imports (maigret + holehe), SQLite with JWT auth, Docker Compose zero-config, LiteLLM multi-provider LLM routing, Langfuse from Phase 0. Each phase independently shippable.
review-status: PASSED (4 adversarial reviews + deep OSS research — all findings resolved)
cannibalization-score: 15 cannibalize / 2 build-from-scratch / 10 glue-configuration
---

# Draft: feature-roadmap

## Cannibalization Scorecard (final)
| Category | Count | Tasks |
|----------|-------|-------|
| **Cannibalize** | 15 | 1 (shadcn dashboard), 2 (magicui), 3 (fastapi-users + Alembic + LiteLLM + Langfuse), 4 (Docker template), 6 (pdfjs-dist, mammoth, tesseract.js), 7 (yashpwr BERT model + LLM fallback), 13 (pdf-injection-scanner, pdfplumber), 14 (pdfplumber metadata), 15 (ZipPy + RoBERTa), 16 (PyDriller + PyGithub + lizard + radon), 18 (maigret + holehe), 20 (OpenCorporates), 21 (OpenSanctions), 26 (Fairlearn) |
| **Build-from-scratch** | 2 | 5 (auth context UI), llm_client.py (30-line LiteLLM wrapper) |
| **Glue/Config** | 10 | 8-11, 12, 17, 19, 22-25, 27 |

## Key decisions
- **Resume parser**: BERT model (90.87% F1, offline) as primary. LLM fallback for French + low-confidence.
- **AI detection**: ZipPy (compression) + RoBERTa (classifier). Not an LLM. Deterministic. No circular problem.
- **GitHub analysis**: PyDriller (extracts actual diffs) + lizard (code quality). Not just "username exists."
- **OSINT**: maigret (3000+ sites, `import maigret`) + holehe (`import holehe`). 2 imports, 0 subprocesses.
- **LLM routing**: LiteLLM — 100+ providers, YAML config, auto retries/fallbacks/cost tracking

## Approval gate
status: awaiting-approval
