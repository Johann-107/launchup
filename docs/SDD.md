# Software Design Description (SDD)

## 3.2 Mitigation design to reduce AI hallucinations

- Design Overview: Implement stricter prompt engineering, enforce JSON-only responses for structured outputs, and perform post-response validation.
- Components:
  - `AiService.callJson()` - wrapper that appends strict instructions and parses JSON safely.
  - Schema validators for each output type (RNA, tasks, initiatives, roadblocks).
  - Retry logic with escalating constraints when parsing fails.
  - Logging and telemetry for failed parses and low-confidence outputs.

## 3.3 Readiness scoring design (enhance differentiation)

- Design Overview: Compute sub-scores per readiness dimension (TRL, MRL, ARL, ORL, RRL, IRL), normalize and weight them, and derive a composite readiness tier.
- Components:
  - `ReadinessScorer` module that accepts criteria and outputs numeric scores and tier labels.
  - API endpoints for returning per-dimension breakdown and recommended initiatives prioritized by impact vs effort.
  - UI mappings to show progress bars, prioritized next steps, and confidence metrics.
