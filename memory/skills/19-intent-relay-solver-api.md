# Skill 19: Intent Relay & Solver API

## Quick Reference

**Intent Relay:** `IntentRelayApiService` — cross-chain message passing
**Solver API:** `SolverApiService` — intent-based swap execution
**Docs:** `INTENT_RELAY_API.md`, `SOLVER_API_ENDPOINTS.md`, `RELAYER_API_ENDPOINTS.md`

---

## Solver API

### Endpoints

| Env | URL |
|-----|-----|
| **Production** | `https://api.sodax.com/v1/intent` |
| **Staging** | `https://staging-new-world.iconblockchain.xyz` |

### Key Operations (via SolverApiService)

```typescript
// Quote
const quote = await sodax.swaps.getQuote({
  token_src: '0x...',
  token_dst: '0x...',
  token_src_blockchain_id: chainId,
  token_dst_blockchain_id: chainId,
  amount: 1000000000000000000n,
  quote_type: 'exact_input',  // or 'exact_output'
  fee?: partnerFee,
});
// Returns: Result<{ quoted_amount: string; solver_address: string; ... }>

// Get intent status
const status = await sodax.swaps.getStatus(intentHash);
// Returns: Result<IntentStatus>

// Cancel intent
const result = await sodax.swaps.cancel(intentHash, spokeProvider);
```

### SolverApiService Methods

```typescript
import { SolverApiService } from '@sodax/sdk';

// The service is used internally by SwapService
// Direct access pattern:
const solverApi = new SolverApiService({
  solverApiEndpoint: 'https://api.sodax.com/v1/intent',
});

// Get quote
solverApi.getQuote(quoteRequest);

// Get order status
solverApi.getOrderStatus(intentHash);

// Get orderbook
solverApi.getOrderbook(offset, limit);
```

---

## Intent Relay API

Low-level cross-chain message relay. Most devs won't need this directly — the SDK wraps it.

### Actions

| Action | Purpose |
|--------|---------|
| `submit` | Submit a transaction to the relay |
| `get_transaction_packets` | Get relay packets for a tx |
| `get_packet` | Get a specific packet |

### Transaction Status Flow

```
pending → validating → executing → executed
(no sigs)  (not enough)  (enough sigs,   (confirmed
                          no confirmed tx)  tx hash)
```

### Submit Transaction

```typescript
const request = {
  action: 'submit',
  params: { chain_id: '1', tx_hash: '0x123...' },
};
const response = await submitTransaction(request, relayerEndpoint);
// Response: { success: true, message: "Transaction registered" }
```

### Get Transaction Packets

```typescript
const request = {
  action: 'get_transaction_packets',
  params: { chain_id: '1', tx_hash: '0x123...' },
};
const response = await getTransactionPackets(request, relayerEndpoint);
// Response: { success: true, data: PacketData[] }
```

### Packet Shape

```typescript
interface PacketData {
  src_chain_id: number;
  src_tx_hash: string;
  src_address: string;
  status: 'pending' | 'validating' | 'executing' | 'executed';
  dst_chain_id: number;
  dst_address: string;
  dst_tx_hash: string;  // populated when executed
  conn_sn: number;
  signatures: string[];
  payload: string;       // hex encoded
}
```

### Get Specific Packet

```typescript
const request = {
  action: 'get_packet',
  params: { chain_id: '1', tx_hash: '0x123...', conn_sn: '1' },
};
```

---

## Relayer API Endpoints

Separate from the solver — handles cross-chain message relaying:

| Env | URL |
|-----|-----|
| **Production** | (default in SDK constants) |
| **Custom** | Set via `relayerApiEndpoint` in SodaxConfig |

---

## Internal SDK Usage

The relay is used internally by all cross-chain operations:

```
User Tx (spoke chain)
    ↓ submit to relay
Intent Relay Service
    ↓ relay to hub
Hub Chain (Sonic)
    ↓ execute
    ↓ relay back
Destination Spoke Chain
    ↓ complete
Result
```

This flow is abstracted by `SwapService.swap()`, `BridgeService.bridge()`, `MoneyMarketService.supply()`, etc.

---

## When to Use Directly

- **Advanced intent monitoring** — Track relay packet status
- **Custom solver integration** — Build your own solver
- **Debugging failed transactions** — Check relay packet status
- **Backend systems** — Server-side intent management

---

## File Locations

| File | Path |
|------|------|
| SolverApiService | `packages/sdk/src/swap/SolverApiService.ts` |
| EvmSolverService | `packages/sdk/src/swap/EvmSolverService.ts` |
| IntentRelayApiService | `packages/sdk/src/shared/services/IntentRelayApiService.ts` |
| Solver API docs | `packages/sdk/docs/SOLVER_API_ENDPOINTS.md` |
| Relayer API docs | `packages/sdk/docs/RELAYER_API_ENDPOINTS.md` |
| Intent Relay docs | `packages/sdk/docs/INTENT_RELAY_API.md` |
| Swap docs | `packages/sdk/docs/HOW_TO_MAKE_A_SWAP.md`, `SWAPS.md` |
