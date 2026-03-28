# Radar-PP — Advanced Weather Radar Web App

Radar-PP is a modern, dark-mode weather radar platform built with **Next.js + Express + Socket.io + Leaflet + Zustand + Tailwind CSS**.

## Features

- Live radar viewport with MapTiler basemap
- Radar products:
  - Reflectivity
  - Velocity
  - Correlation Coefficient (CC)
  - Storm Relative Velocity (SRV)
- Time scrubber + auto-animation loop (past ~36 minutes in 2-minute steps)
- Adjustable radar opacity
- Cursor lat/lon display
- Active official warning polygons (mocked realistic data)
- Weather model side panel (GFS / HRRR / NAM) with forecast-hour timeline
- **Kabeb Warnings** (custom warning system):
  - Admin login (sessionStorage; clears when tab/session closes)
  - Draw polygons on map
  - Broadcast warning title / severity / expiration
  - Real-time sync to all connected clients via WebSocket
  - Distinct pink glow styling and popup details
- Bonus:
  - Warning sound on new Kabeb alert
  - Favorite location quick-search seeds

---

## Stack

- Frontend: Next.js (Pages Router), React, Tailwind CSS
- Backend: Express custom server hosting Next
- Real-time: Socket.io
- Map: Leaflet + MapTiler basemap style
- State: Zustand

---

## Local Setup

### 1) Install dependencies

```bash
npm install
```

### 2) Run in development

```bash
npm run dev
```

App runs at:

- `http://localhost:3000`

### 3) Build and run production

```bash
npm run build
npm start
```

---

## Admin Credentials

Defaults:

- Username: `kabeb-admin`
- Password: `radar123`

Override with environment variables:

- `KABEB_ADMIN_USER`
- `KABEB_ADMIN_PASS`

Example:

```bash
KABEB_ADMIN_USER=myuser KABEB_ADMIN_PASS=mypass npm run dev
```

---

## How Kabeb Warnings Work

1. Admin logs in from panel.
2. Toggle **Draw Polygon**.
3. Click map to place at least 3 points.
4. Fill warning metadata and submit.
5. Warning is emitted with Socket.io and appears instantly for all users.

Warnings are in-memory for this demo and reset on server restart.

---

## Replacing Mock Data with Real APIs

### Official warnings

Current source: mocked server payload in `server.js` (`officialWarnings` array).

To switch to real feeds:

- NOAA/NWS API: `https://api.weather.gov/alerts/active`
- Convert polygon/geocodes to GeoJSON and keep same frontend schema.

### Radar products

Current source: simulated radar cells (`lib/mockRadar.ts`).

To switch to real radar tiles:

- Use NOAA/NEXRAD tile/service endpoint(s), or a weather tile provider.
- Replace circle rendering with tile overlays or image overlays keyed by timestamp and product.
- Keep existing timeline/layer controls; map product names to external sources.

### Models

Current source: mock text panel.

To switch to real model data:

- Pull model gridded data (e.g., NOMADS/HRRR/NAM/GFS) via backend preprocess job.
- Serve tiled raster/vector products for precip/temp/wind, keyed by forecast hour.

---

## Project Structure

```text
.
├── components/
│   ├── ControlPanel.tsx
│   └── RadarMap.tsx
├── lib/
│   ├── mockRadar.ts
│   ├── store.ts
│   └── warningsStore.ts
├── pages/
│   ├── _app.tsx
│   └── index.tsx
├── styles/
│   └── globals.css
├── types/
│   └── index.ts
├── server.js
└── README.md
```

