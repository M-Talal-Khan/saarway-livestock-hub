

# Farm ERP Dashboard — Implementation Plan

This is a large build comprising 12 ERP pages, a sidebar layout, top bar, role-based access, and extensive dummy data. The ERP is a separate interface from the public site, accessed via `/erp/*` routes.

---

## Architecture

### Routing Strategy
- Public pages keep existing layout (Navbar + Footer)
- ERP pages (`/erp/*`) use a completely different layout: **ERPLayout** with sidebar + top bar, no public Navbar/Footer
- `App.tsx` will conditionally render layouts based on route prefix

### Auth Context Extension
Extend `AuthContext` with:
- `currentFarm: { id, name }` 
- `currentUser: { username, role, fullName, station }`
- `currentStation: { tag, name, location }`
- `farmLogin()` function that sets farm user state and navigates to `/erp/stations-overview`
- `setRole()` for the demo role switcher
- `setStation()` for station selection

### FarmLogin Update
Wire the existing `/farm-login` form to call `farmLogin()` and redirect to `/erp/stations-overview`.

---

## New Files to Create

### Data Files
- `src/data/erp/cattle.ts` — 15 cattle records
- `src/data/erp/treatments.ts` — 5 treatment records
- `src/data/erp/vaccinations.ts` — 9 vaccination records
- `src/data/erp/purchases.ts` — 4 purchase records
- `src/data/erp/sales.ts` — 4 sale records
- `src/data/erp/transactions.ts` — 10 finance records
- `src/data/erp/users.ts` — 6 user records
- `src/data/erp/notifications.ts` — 8 notification records
- `src/data/erp/erpStations.ts` — 3 station cards (tag A/B/C)

### Layout Components
- `src/components/erp/ERPLayout.tsx` — Sidebar + TopBar + `<Outlet />`
- `src/components/erp/ERPSidebar.tsx` — Collapsible sidebar with role-based module visibility, uses Shadcn Sidebar primitives
- `src/components/erp/ERPTopBar.tsx` — Farm name, station, notification bell, change station button, profile dropdown, demo role switcher
- `src/components/erp/NotificationPanel.tsx` — Dropdown from bell icon with severity-colored alerts

### ERP Pages (12 total)
- `src/pages/erp/StationsOverview.tsx` — Admin landing, station card grid
- `src/pages/erp/Dashboard.tsx` — Role-switched dashboard (Admin/Manager/Vet/Accounts/Worker variants)
- `src/pages/erp/CattleManagement.tsx` — Table with filters, bulk actions, add/view modals
- `src/pages/erp/FeedInventory.tsx` — Coming Soon placeholder
- `src/pages/erp/HealthVaccination.tsx` — Treatments + Vaccinations tabs
- `src/pages/erp/Buying.tsx` — Purchase list + multi-step add flow
- `src/pages/erp/Selling.tsx` — Sales list + single/bulk sale modes
- `src/pages/erp/FinanceRent.tsx` — 4 tabs (Expenses, Income, Rent, Salary) + summary widgets + charts
- `src/pages/erp/MarketplaceManagement.tsx` — Farm's listing cards + create listing form
- `src/pages/erp/Reports.tsx` — 5 report tabs with Recharts charts + tables
- `src/pages/erp/UserManagement.tsx` — User table + add/edit modal
- `src/pages/erp/Settings.tsx` — 5 tabs (Farm Profile, Station Details, Notifications, Security, Cattle Defaults)

---

## Key Implementation Details

### Role-Based Sidebar
A config map defines which modules each role can see. The sidebar reads `currentUser.role` from context and filters modules accordingly. "Feed & Inventory" is always visible but disabled with a "Coming Soon" badge.

### App.tsx Restructure
```text
<BrowserRouter>
  <Routes>
    {/* Public routes — wrapped in Navbar + Footer */}
    <Route element={<PublicLayout />}>
      <Route path="/" element={<Home />} />
      ... all public routes
    </Route>

    {/* ERP routes — wrapped in ERPLayout (sidebar + topbar) */}
    <Route path="/erp" element={<ERPLayout />}>
      <Route path="stations-overview" element={<StationsOverview />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="cattle" element={<CattleManagement />} />
      ... all ERP routes
    </Route>
  </Routes>
</BrowserRouter>
```

### Dashboard Variants
The Dashboard page checks `currentUser.role` and renders a different widget layout per role (Admin sees global stats + charts, Vet sees health-focused cards, Worker sees task list only, etc.).

### Charts
Use Recharts (already installed) for: weight growth trends, revenue vs expenses bar chart, P/L line charts, status breakdown pie charts. All with dummy data arrays.

### Modals & Forms
Use Shadcn Dialog for modals (add cattle, add treatment, add vaccination, add purchase, add sale, add user, create listing). Forms use standard controlled inputs.

### Status Badge Component
A shared `StatusBadge` component maps status strings to the specified colors (Active=blue, Fattening=orange, Ready for Sale=green, Listed=purple, Sold=gray, Slaughtered=dark red, Dead=black).

### Tables
Use the existing Shadcn Table components. Add horizontal scroll on mobile. Checkbox column for bulk select in Cattle Management.

### CSV Export
Simple client-side function that converts table data to CSV string and triggers download via Blob URL.

---

## Files Modified
- `src/context/AuthContext.tsx` — Extended with farm user state, role switcher, station selector
- `src/App.tsx` — Restructured with nested route layouts
- `src/pages/FarmLogin.tsx` — Wired to auth context, redirects to `/erp/stations-overview`

---

## Estimated Scope
~30 new files, ~3 modified files. This is a large build that will be implemented incrementally, starting with the layout shell and data, then each module page.

