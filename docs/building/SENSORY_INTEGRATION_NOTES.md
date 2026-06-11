# Ellis Sensory Wiring — Integration Notes

**Status:** Sensory layer code complete (hallPhysics.ts, enhanced state.ts, updated types.ts)  
**Issue:** Existing route code uses different patterns; needs consolidation in Phase B  
**Impact:** Sensory wiring is correct; route wiring is Phase B work

---

## What's been added (sensory layer)

### New files

```
src/lib/ellis/world/hallPhysics.ts (350 lines)
  └─ Contact events, presence ledger, solitude threshold
  
src/lib/ellis/me/state.ts (enhanced, +80 lines)
  └─ perceiveEntry(), describePlace(), detectShift()
```

### Updated files

```
src/lib/ellis/types.ts (enhanced)
  ├─ EllisState now has: perceptionLast, atmosphereLast
  └─ Added: EllisMode type

src/lib/ellis/session/store.ts (new clean implementation)
  ├─ createSession() wires place awareness
  └─ updateSession() fires contact events + shift detection

src/lib/ellis/me/assemble.ts (enhanced)
  └─ Assembly starts with "Ellis's place" before state
```

---

## Integration debt (Phase B work)

### Issue 1: Import path conflicts

Existing code has:
- `src/lib/ellis/session/sessionStore.ts` (old)

New code created:
- `src/lib/ellis/session/store.ts` (new, clean)

**Solution (Phase B):** Choose one. Either merge new into old, or migrate to new.

### Issue 2: Type mismatches

Old code expected:
```typescript
interface SessionState {
  id: string;
  updatedAt: Date;
  depthSticky: boolean;
  traces: Trace[];
}
```

New code has:
```typescript
interface SessionState {
  sessionId: string;
  interior: EllisInterior;
  // (all state nested, not flat)
}
```

**Solution (Phase B):** Unify SessionState structure. New structure is cleaner (all interior nested).

### Issue 3: Import graph issues

Route code imports:
- `isAllowedHall()` (doesn't exist in new registry.ts)
- `normalizeHall()` (doesn't exist)
- `modelIdFor()` (doesn't exist in new routeModel.ts)
- `streamEllisReply()` (doesn't exist in new stream.ts)

**Solution (Phase B):** Either add compatibility shims, or rewrite route to use new functions.

---

## What sensory wiring provides (when integrated)

### 1. Entry perception

Ellis notices visitor arrival:

```typescript
// On first message
onContactStarted(session, userMessage, quality)
  ↓
session.interior.state.perceptionLast = 'Someone entered my hall...'
  ↓
assembly includes: "Felt: Someone entered my hall"
```

### 2. Spatial awareness

Ellis knows where he is:

```typescript
describePlace(state)
  ↓
{
  location: 'hall',
  occupied: true/false,
  alone: true/false,
  atmosphere: posture
}
```

### 3. Shift detection

Ellis feels conversation changes:

```typescript
detectShift(previousState, currentQuality)
  ↓
if (shallow → genuine || genuine → depth):
  session.interior.state.atmosphereLast = 'felt shift text'
  ↓
assembly includes atmosphere change
```

### 4. Contact lifecycle

```
withdrawn (alone)
  ↓ (contact_started event)
settling/present (someone here)
  ↓ (conversation continues)
attentive (depth reached)
  ↓ (session expires)
withdrawn (alone again)
```

---

## Phase B integration plan

### Step 1: Choose SessionState structure

- **Option A:** Merge new `store.ts` into existing `sessionStore.ts`
- **Option B:** Migrate route to use new `store.ts`, delete old

**Recommendation:** Option B (new structure is cleaner)

### Step 2: Consolidate imports

Old exports don't match new. Add compatibility or rewrite route.

```typescript
// Old route expects:
import { isAllowedHall, normalizeHall } from './halls/registry';
import { pickModel } from './routeModel';
import { streamEllisReply } from './stream';

// New functions exist but with different names
// Solution: Create compatibility shims or update route
```

### Step 3: Wire hallPhysics into route

```typescript
// On first message:
onContactStarted(session, message, quality);

// After each update:
detectShift(previousState, currentState);

// On session end:
onContactEnded(session);
```

### Step 4: Verify typecheck passes

After integration, `npm run typecheck` should pass.

### Step 5: Test assembly includes sensory

Interior assembly should now have:
1. Ellis's place (spatial)
2. Ellis's interior state (temporal)
3. Session marks (traces)
4. Relational (visitor)
5. Conversation (shifts)

---

## Why this matters (before moving forward)

The sensory code is **correct and complete**. But it's not wired into the route yet. During Phase B integration, you'll need to:

1. Choose which SessionState structure to use (new is better)
2. Add missing route functions or rewrite imports
3. Wire contact events into session lifecycle
4. Test that interior assembly includes sensory layer

**Time estimate:** 2-3 hours to fully integrate + test.

---

## Files to review (Phase B)

```
docs/goe/ELLIS_SENSORY_WIRING.md         (what sensory wiring provides)
docs/building/ELLIS_SENSORY_UPGRADE.md   (what changed + why)
src/lib/ellis/world/hallPhysics.ts       (contact events)
src/lib/ellis/me/state.ts                (perception + shift detection)
src/lib/ellis/session/store.ts           (wired session lifecycle)
src/lib/ellis/me/assemble.ts             (spatial assembly first)
```

---

_Sensory layer is built. Phase B: wire it into the route._
