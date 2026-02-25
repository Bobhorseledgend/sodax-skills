# Skill Improvement Log

Tracks issues found during implementation that should be fed back into the SODAX skill files.

---

<!-- Template for new entries:

## [Date] — Feature X: [Issue Title]
- **Skill affected:** Skill NN (Name)
- **What broke:** [Description of the failure]
- **Root cause:** [Why the skill didn't prevent this]
- **Fix applied:** [What we changed in the code]
- **Skill amendment:** [Specific text to add/revise in the skill file]
- **Status:** Pending / Applied

-->

## 2026-02-25 — Feature 1: SodaxConfig property name "swap" vs "swaps"
- **Skill affected:** Skill 01 (SDK Setup)
- **What broke:** TypeScript error TS2561 — `swap` does not exist in type `SodaxConfig`. Did you mean `swaps`?
- **Root cause:** Skill 01 documents the config property as `swap: { partnerFee }` but the actual SDK v1.2.4-beta uses `swaps` (plural) as the property name in the SodaxConfig type.
- **Fix applied:** Changed `swap` to `swaps` in `src/lib/sodax.ts`
- **Skill amendment:** Update all instances of `swap:` to `swaps:` in Skill 01 config examples (lines ~48 and ~98-108 of `01-sdk-setup.md`)
- **Status:** Pending
