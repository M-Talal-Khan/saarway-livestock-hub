

# ERP Styling Overhaul — Implementation Plan

This is a comprehensive styling pass across the entire ERP. The approach is to make most changes via **global CSS** and **shared UI component** edits to avoid touching every single page file. Page-specific changes are limited to Dashboard (welcome banner, stat card categories) and a few component tweaks.

---

## Strategy: Global-first, then targeted

### Layer 1 — Global CSS (`src/index.css`)
Add ERP-specific utility classes that apply universally:

- `.erp-card` — base card style with border, radius-12, shadow, hover lift
- `.erp-table` styles via CSS targeting table elements within ERP context
- `.erp-stat-card` variants with colored left borders (green, gold, blue, red, dark-green)
- Bell badge pulse animation keyframe
- Button scale hover effect

### Layer 2 — Shared UI Components (5 files)
These changes cascade across ALL ERP pages automatically:

1. **`table.tsx`** — Green header bg, striped rows, green hover
2. **`dialog.tsx`** — Glassmorphism overlay + modal card styling
3. **`tabs.tsx`** — Green active state, green-50 bg, bottom border
4. **`input.tsx`** — Green focus ring
5. **`card.tsx`** — Add hover transition + shadow by default

### Layer 3 — ERP Components (4 files)
6. **`StatusBadge.tsx`** — Update colors to exact hex specs, add pulse for Overdue/Critical
7. **`ERPSidebar.tsx`** — Green-500 active bg, green-100 hover, white active text
8. **`ERPTopBar.tsx`** — Bottom shadow, bell pulse animation
9. **`NotificationPanel.tsx`** — Glassmorphism bg, severity left borders, unread dot

### Layer 4 — Page-specific (2 files)
10. **`Dashboard.tsx`** — Welcome banner (green gradient), stat cards with category-colored left borders and Lucide icons in colored circles
11. **`StationsOverview.tsx`** — Card hover styling (already close, minor tweak)

---

## Detailed Changes

### 1. `src/index.css` — Add ERP utility classes
Add after existing utilities:
- `@keyframes sw-bell-bounce` for notification bell
- `@keyframes sw-pulse-subtle` for critical badges
- `.erp-stat-border-animals { border-left: 3px solid hsl(120 50% 48%); }`
- `.erp-stat-border-finance { border-left: 3px solid hsl(44 76% 60%); }`
- `.erp-stat-border-health { border-left: 3px solid hsl(192 72% 60%); }`
- `.erp-stat-border-alert { border-left: 3px solid hsl(0 76% 63%); }`
- `.erp-stat-border-rent { border-left: 3px solid hsl(120 67% 37%); }`

### 2. `src/components/ui/table.tsx`
- `TableHeader`: add `bg-[hsl(120,50%,96%)]` (sw-green-50), `text-[hsl(120,75%,21%)]` (sw-green-900), `font-semibold`, `border-b-2 border-[hsl(120,46%,62%)]`
- `TableRow`: change hover to `hover:bg-[hsl(120,50%,90%)]` (sw-green-100), add `even:bg-[hsl(120,14%,97%)]` (sw-surface), transition 150ms
- `TableRow` selected state: `data-[state=selected]:bg-[hsl(120,50%,90%)]`

### 3. `src/components/ui/dialog.tsx`
- `DialogOverlay`: change `bg-black/80` to `bg-black/40 backdrop-blur-[8px]`
- `DialogContent`: add `bg-white/[0.92] backdrop-blur-[16px] border border-white/35 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15),0_0_40px_rgba(61,184,61,0.08)]`
- Close button: add `hover:text-destructive`

### 4. `src/components/ui/tabs.tsx`
- `TabsList`: change from `bg-muted` to `bg-transparent border-b border-border`
- `TabsTrigger`: change active state to `data-[state=active]:text-[hsl(120,50%,48%)] data-[state=active]:border-b-2 data-[state=active]:border-[hsl(120,50%,48%)] data-[state=active]:bg-[hsl(120,50%,96%)]`, hover `hover:bg-[hsl(120,50%,90%)]`, remove rounded/shadow

### 5. `src/components/ui/input.tsx`
- Focus: change ring to `focus-visible:border-[hsl(120,50%,48%)] focus-visible:ring-[hsl(120,50%,48%)]/12 focus-visible:ring-[3px]`

### 6. `src/components/ui/card.tsx`
- Add to Card: `rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[0_8px_24px_rgba(61,184,61,0.12)] hover:border-[hsl(120,46%,62%)]`

### 7. `src/components/erp/StatusBadge.tsx`
- Update color map to exact hex values from spec (e.g., Active: `bg-[#DBEAFE] text-[#1E40AF]`, Fattening: `bg-[#FED7AA] text-[#C2410C]`, etc.)
- Remove border classes, use only bg + text
- Add pulse class for Overdue and Critical statuses

### 8. `src/components/erp/ERPSidebar.tsx`
- Active item: `bg-[hsl(120,50%,48%)] text-white hover:bg-[hsl(120,50%,48%)]/90`
- Non-active hover: `hover:bg-[hsl(120,50%,90%)]`
- Sidebar border: already has `border-r`, keep as-is

### 9. `src/components/erp/ERPTopBar.tsx`
- Add `shadow-[0_1px_3px_rgba(0,0,0,0.05)]` to header
- Bell badge: add `animate-bounce` class when count > 0 (subtle)
- Change Station button: outline style with green border

### 10. `src/components/erp/NotificationPanel.tsx`
- Panel: `bg-white/95 backdrop-blur-[12px] rounded-xl shadow-xl`
- Each notification: add left border by severity (`border-l-[3px]` with critical=red, warning=gold, info=blue)
- Unread: add small colored dot + bold text
- Hover: `hover:bg-[hsl(120,50%,96%)]`

### 11. `src/pages/erp/Dashboard.tsx`
- Add welcome banner card at top with `sw-gradient-hero` (green gradient), white text, username + farm + station + date
- Refactor `StatCard` to accept `category` prop for left border color + icon with colored circle
- Update stat card usage with category assignments

### 12. `src/pages/erp/StationsOverview.tsx`
- Minor: ensure cards use the updated Card component hover (automatic from card.tsx change)

---

## Files Modified (12)

| File | Type of Change |
|------|---------------|
| `src/index.css` | Add ERP utility classes + animations |
| `src/components/ui/table.tsx` | Green headers, striped rows, hover |
| `src/components/ui/dialog.tsx` | Glassmorphism overlay + modal |
| `src/components/ui/tabs.tsx` | Green active tabs |
| `src/components/ui/input.tsx` | Green focus ring |
| `src/components/ui/card.tsx` | Hover lift + shadow |
| `src/components/erp/StatusBadge.tsx` | Exact hex colors, pulse |
| `src/components/erp/ERPSidebar.tsx` | Green active/hover states |
| `src/components/erp/ERPTopBar.tsx` | Shadow, bell animation |
| `src/components/erp/NotificationPanel.tsx` | Glass bg, severity borders |
| `src/pages/erp/Dashboard.tsx` | Welcome banner, categorized stat cards |
| `src/pages/erp/StationsOverview.tsx` | Minor card hover (mostly automatic) |

No structural or routing changes. Pure visual overhaul.

