# IPM SAC Treasury Portal UI refresh

This refresh applies the Organic Intelligence / Premium Fluidity visual direction to the existing Next.js application.

## What changed
- Added the cream / charcoal / indigo design tokens and Google font families (Playfair Display, Inter, JetBrains Mono) in `app/globals.css`.
- Reworked the global presentation palette from the previous dark zinc/emerald theme to warm cream, white surfaces, neutral borders and indigo accents.
- Added premium easing, mesh drift, reveal, pulse and reduced-motion styles.
- Added a shared client-side dashboard frame. It observes the dashboard's actual scrolling element and shrinks the header after 100px.
- Updated the shared header, sidebar, mobile navigation, cards, buttons, badges and form controls.
- Restyled the login branding panel and changed Cloudflare Turnstile to its light theme.
- Preserved Supabase actions, auth flow, database calls, role routing and schema.

## Important notes
- Google Fonts are loaded from `fonts.googleapis.com`; the app uses system fallbacks if those fonts cannot be reached.
- `data-reveal` is available for elements that should animate into view. Add it to a section/card only when appropriate.
- The dashboard header compacts when the dashboard main scroll container passes 100px, not when the browser window scrolls.
- The portfolio-specific 100vh hero, action CTA, and service accordion were not forced into financial workflow pages. The login branding panel receives the editorial treatment; operational dashboards remain information-dense.
- No new runtime dependencies were added.

## Validation
The source was updated in-place. A production build could not be completed in this environment because dependency installation did not finish (`next` executable unavailable). Run `npm ci` followed by `npm run build` in the project environment before deployment.
