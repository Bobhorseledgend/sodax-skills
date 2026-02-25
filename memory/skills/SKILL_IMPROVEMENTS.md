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

## 2026-02-25 — Feature 5: Skill 04 CreateIntentParams type is outdated
- **Skill affected:** Skill 04 (Cross-Chain Swap)
- **What broke:** Skill 04 documents `CreateIntentParams` as `{ quote, spokeProvider, toAddress, slippageTolerance, deadline: number }` but the actual SDK v1.2.4-beta type is `{ inputToken, outputToken, inputAmount: bigint, minOutputAmount: bigint, deadline: bigint, allowPartialFill: boolean, srcChain: SpokeChainId, dstChain: SpokeChainId, srcAddress, dstAddress, solver: Address, data: Hex }`.
- **Root cause:** Skill 04 appears to describe a higher-level convenience API or an older SDK version. The actual `CreateIntentParams` requires manually constructing all intent fields including computing `minOutputAmount` from the quote's `quoted_amount` with slippage.
- **Fix applied:** Built `CreateIntentParams` directly in SwapCard.tsx from quote response, slippage, and user address.
- **Skill amendment:** Replace the `CreateIntentParams` type definition in Skill 04 with the actual SDK type. Add example showing how to compute `minOutputAmount` from `quoted_amount` and slippage basis points. Note that `deadline` is `bigint` (seconds), not `number`. Document that `solver` should be zero address for "any solver" and `data` should be `"0x"`.
- **Status:** Pending

## 2026-02-25 — Feature 5: SolverExecutionResponse uses snake_case intent_hash
- **Skill affected:** Skill 04 (Cross-Chain Swap)
- **What broke:** Code initially used `intentHash` (camelCase) but the actual `SolverExecutionResponse` type uses `intent_hash` (snake_case).
- **Root cause:** Skill 04 doesn't document the exact result tuple shape `[SolverExecutionResponse, Intent, IntentDeliveryInfo]` or the field names in `SolverExecutionResponse`.
- **Fix applied:** Used `r.value[0]?.intent_hash` and captured `r.value[2]?.srcTxHash` from `IntentDeliveryInfo` for the block explorer link.
- **Skill amendment:** Add documentation for the `CreateIntentResult` type showing it's `Result<[SolverExecutionResponse, Intent, IntentDeliveryInfo], IntentError>` with `SolverExecutionResponse = { answer: 'OK', intent_hash: Hex }` and `IntentDeliveryInfo = { srcTxHash, srcChainId, dstTxHash, dstChainId, ... }`.
- **Status:** Pending
