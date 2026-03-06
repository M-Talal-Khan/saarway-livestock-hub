

# Fix ERP Login & Station Flow

The core logic (AuthContext, FarmLogin routing, ERPLayout route guard) is already correct. Two issues remain:

## Issue 1: Top bar shows bell + profile when Admin has no station selected
**File:** `src/components/erp/ERPTopBar.tsx`
- Wrap the notification bell, "Change Station" button, and profile dropdown in a conditional: only render when `stationSelected === true`
- When `!stationSelected`, the top bar shows ONLY the farm name + "No station selected" text — nothing else

## Issue 2: Non-admin roles can navigate to `/erp/stations-overview`
**File:** `src/pages/erp/StationsOverview.tsx`
- Add a guard at the top: if `currentUser?.role !== 'Admin'`, redirect to `/erp/dashboard`

## Files Changed (2)

### `src/components/erp/ERPTopBar.tsx`
- Wrap the entire `ml-auto` right section (bell, change station, profile) inside `{stationSelected && (...)}` so it's completely hidden when no station is active

### `src/pages/erp/StationsOverview.tsx`  
- Import `Navigate` from react-router-dom
- Add early return: `if (currentUser?.role !== 'Admin') return <Navigate to="/erp/dashboard" replace />;`
- Destructure `currentUser` from `useAuth()`

No changes needed to AuthContext, FarmLogin, ERPLayout, or ERPSidebar — they already work correctly.

