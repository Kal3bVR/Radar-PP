# Kabeb Radar Console (Standalone HTML)

This project now includes a **no-terminal** standalone app at:

- `index.html`

## How to use (no setup)

1. Open the project folder.
2. Double-click `index.html` (or right-click → Open in browser).
3. The full radar UI loads immediately.

> No npm install, no build, no server required.

## Included features

- MapTiler basemap (using your provided map style/key)
- Radar products: Reflectivity, Velocity, CC, SRV
- Animated radar timeline + time scrubber
- Opacity slider
- Lat/Lon cursor display
- Official warning polygons with click details
- Model panel (GFS / HRRR / NAM)
- Admin login for **Kabeb Warnings** (`kabeb-admin` / `radar123`)
- Draw polygon and broadcast custom Kabeb warnings
- Instant sync between open tabs/windows on same browser profile (BroadcastChannel/localStorage)
- Dark modern UI with mobile-friendly controls

## Notes

- Because this is a pure HTML app (no backend), Kabeb sync works across tabs/windows on the same browser profile/device.
- For internet-wide multi-user sync, you would add a backend WebSocket service later.
