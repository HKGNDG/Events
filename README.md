# Nashville Event Pulse (Base44 App)

A comprehensive, hotel-focused event intelligence dashboard for Nashville, built with Vite + React, Tailwind CSS, and a modular, extensible architecture. This app provides analytics, event discovery, venue management, and seamless integration with external APIs (e.g., Ticketmaster) to help hotels optimize operations and revenue.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Setup & Installation](#setup--installation)
4. [Project Structure](#project-structure)
    - [Root Files](#root-files)
    - [src/ Directory](#src-directory)
        - [api/](#srcapi)
        - [components/](#srccomponents)
        - [hooks/](#srchooks)
        - [lib/](#srclib)
        - [pages/](#srcpages)
        - [utils/](#srcutils)
5. [UI Components Reference](#ui-components-reference)
6. [API & Integrations](#api--integrations)
7. [Architecture & Extensibility](#architecture--extensibility)
8. [Contribution Guidelines](#contribution-guidelines)
9. [Deployment](#deployment)
10. [Support & Contact](#support--contact)

---

## Project Overview

**Nashville Event Pulse** is a modern dashboard for hotels to monitor, analyze, and act on local event data. It provides:
- Real-time event discovery and analytics
- Venue management and search
- System health and integration status
- Customizable settings for hotel operations

Built with:
- **React 18** (Vite for fast builds)
- **Tailwind CSS** (custom theming)
- **Radix UI** (accessible primitives)
- **Recharts** (data visualization)
- **Base44 SDK** (API client)

---

## Features

- **Dashboard:** KPIs, quick actions, and recent activity
- **Events:** Discovery, filtering, and analysis of local events
- **Venues:** Searchable, filterable venue management
- **Analytics:** Impact timeline, venue utilization, category breakdowns
- **Integration:** API connection management, pricing system integration
- **Settings:** Hotel info, thresholds, sync, and notification preferences
- **Responsive UI:** Sidebar navigation, mobile support, and modern design

---

## Setup & Installation

```bash
# Clone the repository
npm install
npm run dev
```

- Build for production: `npm run build`
- Lint: `npm run lint`
- Preview: `npm run preview`

---

## Project Structure

### Root Files
- `package.json` — Project metadata and dependencies
- `vite.config.js` — Vite build configuration (React, path aliases)
- `tailwind.config.js` — Tailwind CSS theming and plugin setup
- `index.html` — Main HTML entry point
- `README.md` — This documentation

### src/ Directory

#### src/api/
- **base44Client.js** — Initializes the Base44 API client with authentication
- **entities.js** — Exposes API entities: `Event`, `Venue`, `HotelConfig`, and `User` (auth)
- **integrations.js** — Exposes integration endpoints: LLM, email, file upload, image generation, data extraction

#### src/components/
- **dashboard/**
    - `KPICard.jsx` — Card for displaying KPI metrics (title, value, trend, icon, badge)
    - `QuickActions.jsx` — Action shortcuts for common dashboard tasks
    - `ActivityFeed.jsx` — Recent activity/events feed with status badges
- **events/**
    - `EventCard.jsx` — Detailed event card (impact, venue, price, actions)
    - `EventFilters.jsx` — Filtering UI for events (date, impact, venue, distance, sort, view)
- **venues/**
    - `VenueCard.jsx` — Venue summary card (tier, activity, capacity, location)
- **integrations/**
    - `Ticketmaster.jsx` — Ticketmaster API integration, event/venue mapping, and simulation logic
- **ui/** (Reusable UI primitives)
    - `button.jsx` — Button component (variants, sizes)
    - `card.jsx` — Card layout primitives (header, content, footer, etc.)
    - `badge.jsx` — Status/category badge
    - `input.jsx` — Styled input field
    - `select.jsx` — Dropdown select (Radix UI)
    - `slider.jsx` — Range slider (Radix UI)
    - `form.jsx` — Form context, field, label, validation (react-hook-form)
    - `sidebar.jsx` — Responsive sidebar navigation system
    - ...and many more (see [UI Components Reference](#ui-components-reference))

#### src/hooks/
- **use-mobile.jsx** — Custom hook to detect mobile viewport and trigger responsive UI

#### src/lib/
- **utils.js** — Utility function `cn` for merging Tailwind and classnames

#### src/pages/
- **index.jsx** — Main router, sets up all routes and page switching
- **Dashboard.jsx** — Dashboard page (KPIs, quick actions, activity feed)
- **Events.jsx** — Event discovery, filtering, and display
- **Venues.jsx** — Venue search and management
- **Analytics.jsx** — Data visualizations (charts, metrics)
- **Integration.jsx** — API/pricing system integration management
- **Settings.jsx** — Hotel/system configuration
- **Layout.jsx** — Main layout, sidebar, and header

#### src/utils/
- **index.ts** — Utility: `createPageUrl(pageName)` for route generation

---

## UI Components Reference

The app uses a large set of modular, accessible UI primitives (in `src/components/ui/`).

- **button.jsx** — All-purpose button, supports variants (default, outline, ghost, link, etc.) and sizes
- **card.jsx** — Card container with header, content, footer, title, and description
- **badge.jsx** — Status or category label, supports variants (default, secondary, destructive, outline)
- **input.jsx** — Styled input field for forms
- **select.jsx** — Dropdown select, built on Radix UI
- **slider.jsx** — Range slider for numeric input
- **form.jsx** — Form context, field, label, validation (react-hook-form integration)
- **sidebar.jsx** — Responsive, collapsible sidebar navigation with groups, menu items, and actions
- **Other primitives:** Tabs, table, toast, dialog, dropdown, accordion, calendar, etc. (see `src/components/ui/`)

---

## API & Integrations

### API Layer (`src/api/`)
- **base44Client.js** — Sets up the Base44 SDK client with app ID and authentication
- **entities.js** — Exposes:
    - `Event` — Event data model (list, create, update, etc.)
    - `Venue` — Venue data model
    - `HotelConfig` — Hotel/system configuration
    - `User` — Auth/user management
- **integrations.js** — Exposes integration endpoints:
    - `InvokeLLM` — Large language model invocation
    - `SendEmail` — Email sending
    - `UploadFile` — File upload
    - `GenerateImage` — Image generation
    - `ExtractDataFromUploadedFile` — Data extraction from files

### Ticketmaster Integration (`src/components/integrations/Ticketmaster.jsx`)
- **Event/venue mapping:** Maps Ticketmaster API responses to internal format
- **Impact scoring:** Calculates event impact based on distance, price, venue size, and sales status
- **Venue capacity estimation:** Uses known venues and heuristics for unknowns
- **API simulation:** Simulates Ticketmaster Discovery API for local development

---

## Architecture & Extensibility

- **Routing:** React Router, all routes defined in `src/pages/index.jsx`
- **State Management:** React hooks, local state per page/component
- **Styling:** Tailwind CSS with custom theme (see `tailwind.config.js`)
- **UI:** Radix UI primitives, custom components for dashboard, events, venues, etc.
- **API:** Modular, easily extendable via `src/api/` and integration files
- **Responsive:** Mobile support via custom hook and responsive sidebar
- **Extensible:** Add new pages, components, or integrations by following the modular structure

---

## Contribution Guidelines

1. Fork and clone the repository
2. Create a new branch for your feature or fix
3. Follow the existing code style (ESLint, Prettier, Tailwind)
4. Add/modify components in the appropriate directory
5. Test your changes locally (`npm run dev`)
6. Submit a pull request with a clear description

---

## Deployment

- **Build:** `npm run build` (outputs to `dist/`)
- **Preview:** `npm run preview`
- **Static hosting:** Deploy `dist/` to any static host (Vercel, Netlify, etc.)
- **Environment variables:** Configure as needed for production API endpoints

---

## Support & Contact

For support, questions, or feature requests, contact:
- **Base44 Support:** app@base44.com
- **Project Maintainer:** (add your contact here)

---

## File-by-File Details

### Root Files
- **package.json** — Lists all dependencies (React, Vite, Tailwind, Radix UI, Recharts, Base44 SDK, etc.) and scripts
- **vite.config.js** — Sets up React plugin, path aliases (`@` → `src/`), and build optimizations
- **tailwind.config.js** — Customizes colors, radii, animations, and includes `tailwindcss-animate` plugin
- **index.html** — Main HTML entry point for Vite

### src/api/
- **base44Client.js** — Initializes the Base44 API client with authentication required for all operations
- **entities.js** — Exports API entities: `Event`, `Venue`, `HotelConfig`, and `User` (auth)
- **integrations.js** — Exports integration endpoints for LLM, email, file upload, image generation, and data extraction

### src/components/dashboard/
- **KPICard.jsx** — Displays a KPI metric with icon, value, trend, and optional badge
- **QuickActions.jsx** — Renders shortcut buttons for common dashboard actions (search, report, etc.)
- **ActivityFeed.jsx** — Shows recent activity/events with status, time, and actions

### src/components/events/
- **EventCard.jsx** — Detailed event card with impact, venue, price, and action buttons
- **EventFilters.jsx** — Filtering UI for events (date, impact, venue, distance, sort, view)

### src/components/venues/
- **VenueCard.jsx** — Venue summary card with tier, activity, capacity, and location

### src/components/integrations/
- **Ticketmaster.jsx** — Handles Ticketmaster API integration, event/venue mapping, impact scoring, and API simulation

### src/components/ui/
- **button.jsx** — Button component with variants and sizes
- **card.jsx** — Card layout primitives (header, content, footer, etc.)
- **badge.jsx** — Status/category badge
- **input.jsx** — Styled input field
- **select.jsx** — Dropdown select (Radix UI)
- **slider.jsx** — Range slider (Radix UI)
- **form.jsx** — Form context, field, label, validation (react-hook-form)
- **sidebar.jsx** — Responsive sidebar navigation system
- ...and many more (see [UI Components Reference](#ui-components-reference))

### src/hooks/
- **use-mobile.jsx** — Custom hook to detect mobile viewport and trigger responsive UI

### src/lib/
- **utils.js** — Utility function `cn` for merging Tailwind and classnames

### src/pages/
- **index.jsx** — Main router, sets up all routes and page switching
- **Dashboard.jsx** — Dashboard page (KPIs, quick actions, activity feed)
- **Events.jsx** — Event discovery, filtering, and display
- **Venues.jsx** — Venue search and management
- **Analytics.jsx** — Data visualizations (charts, metrics)
- **Integration.jsx** — API/pricing system integration management
- **Settings.jsx** — Hotel/system configuration
- **Layout.jsx** — Main layout, sidebar, and header

### src/utils/
- **index.ts** — Utility: `createPageUrl(pageName)` for route generation

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

*Generated by deep code analysis. For further details, see inline code comments and the [UI Components Reference](#ui-components-reference).*