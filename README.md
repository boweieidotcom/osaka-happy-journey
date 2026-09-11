# OSAKA Happy Journey V4.4

- No embedded map / no Leaflet
- Trip page uses local real photos extracted from the provided tour programme PDF
- Saved area filters are horizontal chips
- Favorite + Free Day shared sync uses the existing Supabase setup and Trip Code `osaka26`
- Weather: Today card + 4-day forecast in More (Open-Meteo)
- Trip page intentionally has no weather cards

Upload all files in this folder to the repository root. No new Supabase SQL is required if V4.3.3 setup already succeeded.


V4.4.2: Favorite is offline-first with a persistent pending sync queue, so stars remain saved locally even if Supabase/network is temporarily unavailable.
