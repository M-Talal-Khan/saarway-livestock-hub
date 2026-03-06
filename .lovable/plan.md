

# Fix ERP Login & Station Flow

## Changes Required

### 1. AuthContext (`src/context/AuthContext.tsx`)
- Add `stationSelected: boolean` to `AuthState` (defaults `false`)
- Remove `setRole()` from context entirely
- Update `farmLogin()`: for non-Admin roles, auto-assign a station and set `stationSelected: true`; for Admin, keep `stationSelected: false` and `currentStation: null`
- Update `setStation()`: also sets `stationSelected: true`
- Add `clearStation()`: sets `currentStation: null` and `stationSelected: false` (used by "Change Station" button)

### 2. FarmLogin (`src/pages/FarmLogin.tsx`)
- Change navigation after login: Admin → `/erp/stations-overview`, non-Admin → `/erp/dashboard`
- Non-admin roles get a pre-assigned station based on role (Manager → Station 1, Vet → All Stations, Accounts → All Stations, Worker → Station 1)

### 3. ERPTopBar (`src/components/erp/ERPTopBar.tsx`)
- Remove the demo role switcher `<Select>` completely
- Remove `setRole` from useAuth destructuring
- Show "No station selected" when `currentStation` is null
- "Change Station" button: only for Admin, calls `clearStation()` then navigates to `/erp/stations-overview`

### 4. ERPLayout (`src/components/erp/ERPLayout.tsx`)
- Add route guard: if `currentUser?.role === 'Admin'` and `stationSelected === false` and current path is NOT `/erp/stations-overview`, redirect to `/erp/stations-overview`
- Hide sidebar when `stationSelected === false` (Admin on stations overview)

### 5. ERPSidebar (`src/components/erp/ERPSidebar.tsx`)
- No structural changes needed — it already filters by role. It will simply be hidden by ERPLayout when no station is selected.

### 6. StationsOverview (`src/pages/erp/StationsOverview.tsx`)
- Already works correctly — selects station and navigates to dashboard. No changes needed.

