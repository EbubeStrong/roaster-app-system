# Roaster System Dashboard

This represents a dashboard where a staff can scheduling and manage roster duties. This is built using **Next.js 16**, **TypeScript**, and **Chakra UI**. The app provides a planner calendar with day and month views, drag-and-drop staff assignment, live/planner mode switching, and a fully responsive layout following a Figma design spec.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 16** (App Router) | Framework & routing |
| **React 19** | UI library |
| **TypeScript 5** | Type safety |
| **Chakra UI 3** | Component library & theming |
| **react-icons** | Icon set (Feather icons) |
| **iconsax-reactjs** | Additional icon set (sidebar & header) |
| **Framer Motion** | Animations |
| **HTML5 Drag & Drop API** | Native drag-and-drop for scheduling |
| **next-themes** | Theme management |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint
npm run lint
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with Chakra UI Provider
│   ├── page.tsx                # Entry point → DashboardLayout
│   └── globals.css
├── assets/icons/
│   └── iconsItems.tsx          # Custom SVG icon components
├── components/
│   ├── layouts/
│   │   ├── header.tsx          # Sticky top header with user menu
│   │   └── sidebar.tsx         # Collapsible navigation sidebar
│   ├── roaster-content/
│   │   ├── index.tsx           # Content wrapper
│   │   └── planner/
│   │       ├── PlannerContent.tsx    # Main planner with toolbar & view switching
│   │       ├── PlannerCalendar.tsx   # Day view — time grid with drag-drop zones
│   │       ├── MonthView.tsx         # Month view — calendar grid
│   │       ├── RosterList.tsx        # Staff roster side panel (draggable cards)
│   │       ├── EventDetails.tsx      # Event details popup modal
│   │       ├── NewRosterModal.tsx    # Create new roster entry form
│   │       ├── DemoAuthProvider.tsx  # Mock auth context provider
│   │       ├── mockEvents.ts        # Sample planner & live event data
│   │       └── types.ts             # PlannerEvent & StaffMember types
│   ├── sidebar/
│   │   └── sideBarItem.tsx     # Individual sidebar nav item
│   └── ui/                     # Chakra UI utility components
└── page/
    └── dashboard.tsx           # Dashboard layout (sidebar + header + content)
```

---

## Features Implemented

### Core Requirements

#### Calendar Day View
- 24-hour time grid (0:00–24:00) with 30-minute slot resolution 
- 4 schedulable columns: **Behandelingkamer1**, **Management**, **Bijzonderheden-Verlof-Cursus-BZV**, **Financien**
- Events positioned absolutely based on start/end time calculations
- Event cards display user initials avatar, title, time range, and assigned user name
- Overlap detection — a "See all" button appears when events overlap in a column
- Color-coded columns with matching event accent borders

#### Clicking a Schedule Shows Details
- Clicking an event opens a fixed-position details popup
- Shows all events from that column, grouped by start hour
- Each event displays initials badge, title, time range, and user name with color theming

#### Day/Month View Switching
- Toggle between **Day** and **Month** views from the toolbar
- Prev/Next navigation adapts per view (day-by-day or month-by-month)
- "Current day" quick-jump button to return to today

---

### Bonus Features (All Implemented)

#### Drag-and-Drop Staff Assignment
- Staff cards in the roster panel are draggable
- Drop a user onto any 30-minute calendar slot to create a 1-hour event
- Events are automatically color-coded based on the target column
- Visual drop zone highlighting (blue background) on hover during drag

#### Month View
- Full 6-week grid (42 cells) with previous/next month padding, Monday-start weeks
- Up to 3 event pills per day with "+N more" overflow indicator
- Today highlighting (hydration-safe with client-only rendering)
- Clicking any day switches to the Day view for that date

#### Live / Planner Mode Toggle
- **Planner mode**: Shows future scheduled events with a purple theme
- **Live mode**: Shows today's real-time roster with a red live indicator
- Separate event datasets per mode — changes in one don't affect the other
- Loading spinner transition between modes

---

### Additional Features

#### New Roster Modal
- Form to create new roster entries: title, user, column/location, date, start time, duration (0.5h–8h)
- Color preview for the selected column
- Live preview summary before submission

#### Roster Side Panel
- 340px side panel with filterable staff list
- **Tabs**: All / Available / On Leave (with counts)
- **Search**: Text filter by name
- Staff cards show: initials, name, status indicator (green = Active, red = On leave), total/weekly hours, date range, and weekday indicators
- Staff availability is derived from actual event data

#### Responsive Layout
- **Desktop**: Persistent collapsible sidebar (260px ↔ 70px) with smooth width transition
- **Mobile**: Hamburger menu opens a slide-in drawer sidebar with backdrop overlay
- Toolbar row wraps gracefully on smaller screens
- Calendar body stacks vertically (roster above calendar) on narrow viewports
- Live/Planner description text hidden on mobile to save space

#### Sidebar Navigation
- Expandable "Rooster" group with animated blue active indicator bar
- Sub-items: Mijn Rooster, Planner (default active), Instellingen
- Additional nav: Startpagina, My to do Protocols, Document Management, Department News, Knowledge Base, General News

#### Header
- Sticky top bar with icon buttons: Apps, Settings, Notifications (with red badge)
- User avatar dropdown menu: Profile, Account settings, Sign out

#### Loading & Empty States
- Spinner overlay during view/date/mode transitions
- Empty state message when no events exist for a selected day


---

## Design Decisions

| Decision | Rationale |
|---|---|
| **Dutch (NL) localization** | UI labels, day names, and button text match the Figma spec |
| **DemoAuthProvider** | Mock auth context with hardcoded users; easily swappable with a real auth provider |
| **Derived staff data** | Roster panel merges event-based user info with static staff data to infer availability |
| **Column color system** | Consistent `COLUMN_COLORS` mapping across all components for automatic event theming |
| **Hydration-safe rendering** | `new Date()` deferred to `useEffect` to prevent server/client HTML mismatches |
| **Client components** | All components use `"use client"` for full interactivity with the App Router |

