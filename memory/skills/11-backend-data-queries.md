# Skill 11: Backend Data Queries

## Quick Reference

**SDK:** `sodax.backendApi` (BackendApiService)
**Hooks:** `@sodax/dapp-kit` — `useBackend*` hooks (12 hooks)
**Docs:** `packages/sdk/docs/BACKEND_API.md`
**Base URL:** `https://api.sodax.com/v1/be`

---

## SDK Direct Access

```typescript
const sodax = new Sodax();
const api = sodax.backendApi;

// Optional: custom config
const sodax = new Sodax({
  backendApiConfig: {
    baseURL: 'https://api.sodax.com/v1/be',
    timeout: 60000,
    headers: { 'Authorization': 'Bearer token' },
  },
});
```

---

## Intent Endpoints

```typescript
// Get intent by transaction hash
const intent = await api.getIntentByTxHash('0x123...');
// Returns: IntentResponse { intentHash, txHash, logIndex, chainId, blockNumber, open, intent, events }

// Get intent by intent hash
const intent = await api.getIntentByHash('0x456...');
// Returns: same shape
```

### Intent Response Shape
```typescript
interface IntentResponse {
  intentHash: string;
  txHash: string;
  logIndex: number;
  chainId: number;
  blockNumber: number;
  open: boolean;
  intent: {
    intentId: string;
    creator: string;
    inputToken: string;
    outputToken: string;
    inputAmount: string;        // wei string
    minOutputAmount: string;    // wei string
    deadline: string;
    allowPartialFill: boolean;
    srcChain: number;
    dstChain: number;
    srcAddress: string;
    dstAddress: string;
    solver: string;
    data: string;
  };
  events: unknown[];
}
```

---

## Solver Endpoints

```typescript
// Get orderbook (paginated)
const orderbook = await api.getOrderbook({ offset: '0', limit: '10' });
// Returns: { total: number; data: OrderbookEntry[] }

// Get user's intents
const intents = await api.getUserIntents(userAddress, { offset: '0', limit: '10' });
```

### Orderbook Entry Shape
```typescript
interface OrderbookEntry {
  intentState: { exists: boolean; remainingInput: string; receivedOutput: string; pendingPayment: boolean };
  intentData: { intentId, creator, inputToken, outputToken, inputAmount, minOutputAmount, deadline, allowPartialFill, srcChain, dstChain, srcAddress, dstAddress, solver, data, intentHash, txHash, blockNumber };
}
```

---

## Money Market Endpoints

```typescript
// All MM assets (rates, TVL, supplier/borrower counts)
const assets = await api.getAllMoneyMarketAssets();
// Returns: MoneyMarketAsset[]

// Single asset
const asset = await api.getMoneyMarketAsset('0xreserve...');
// Returns: MoneyMarketAsset

// User position
const position = await api.getMoneyMarketPosition('0xuser...');
// Returns: { userAddress, positions: [{ reserveAddress, aTokenAddress, variableDebtTokenAddress, aTokenBalance, variableDebtTokenBalance, blockNumber }] }

// Asset borrowers (paginated)
const borrowers = await api.getMoneyMarketAssetBorrowers('0xreserve...', { offset: '0', limit: '10' });
// Returns: { borrowers: string[], total, offset, limit }

// Asset suppliers (paginated)
const suppliers = await api.getMoneyMarketAssetSuppliers('0xreserve...', { offset: '0', limit: '10' });

// All borrowers (paginated)
const allBorrowers = await api.getAllMoneyMarketBorrowers({ offset: '0', limit: '10' });
```

### MoneyMarketAsset Shape
```typescript
interface MoneyMarketAsset {
  reserveAddress: string;
  aTokenAddress: string;
  totalATokenBalance: string;           // wei string
  variableDebtTokenAddress: string;
  totalVariableDebtTokenBalance: string; // wei string
  liquidityRate: string;                 // ray (27 decimals)
  symbol: string;
  totalSuppliers: number;
  totalBorrowers: number;
  variableBorrowRate: string;            // ray
  stableBorrowRate: string;              // ray
  liquidityIndex: string;               // ray
  variableBorrowIndex: string;           // ray
  blockNumber: number;
}
```

---

## React Hooks (@sodax/dapp-kit)

```typescript
import {
  useBackendOrderbook,
  useBackendUserIntents,
  useBackendIntentByHash,
  useBackendIntentByTxHash,
  useBackendAllMoneyMarketAssets,
  useBackendMoneyMarketAsset,
  useBackendMoneyMarketPosition,
  useBackendMoneyMarketAssetBorrowers,
  useBackendMoneyMarketAssetSuppliers,
  useBackendAllMoneyMarketBorrowers,
} from '@sodax/dapp-kit';

// All hooks return React Query results: { data, isLoading, error, refetch }
const { data: orderbook } = useBackendOrderbook({ offset: '0', limit: '10' });
const { data: intents } = useBackendUserIntents(userAddress, { offset: '0', limit: '10' });
const { data: assets } = useBackendAllMoneyMarketAssets();
const { data: position } = useBackendMoneyMarketPosition(userAddress);
```

---

## Error Handling

```typescript
try {
  const result = await api.getIntentByTxHash('invalid');
} catch (error) {
  // error.message includes: 'timeout', 'HTTP 404', 'HTTP 500', network errors
}
```

**Notes:**
- All string amounts are in wei (18 decimals) or ray (27 decimals) format
- Pagination params (`offset`, `limit`) are **strings**, not numbers
- Dynamic headers: `api.setHeaders({ 'Authorization': 'Bearer new-token' })`
- Get current base URL: `api.getBaseURL()`

---

## File Locations

| File | Path |
|------|------|
| BackendApiService | `packages/sdk/src/backendApi/BackendApiService.ts` |
| Backend hooks (12) | `packages/dapp-kit/src/hooks/backend/` |
| Backend types | `packages/dapp-kit/src/hooks/backend/types.ts` |
| Docs | `packages/sdk/docs/BACKEND_API.md` |
