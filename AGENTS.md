# AGENTS.md — Build Guild Tanta Hackathon Portal
> Guidelines for GitHub Copilot and all AI agents working on this codebase.
> Read this file in full before touching any code.

---

## 📌 Project Overview

This is the **Build Guild Tanta Hackathon Portal** — a web application for managing hackathon
activities for the **Build Guild Tanta** event, organized under
[Blueprint by Hack Club](https://blueprint.hackclub.com/guilds), taking place in **Tanta, Gharbia, Egypt**.

The event is a partnership between:
- **Gharbiya STEM Hack Club** (the local Hack Club branch)
- **Gharbiya STEM Robo Club** (the robotics club co-organizing the event)

The portal serves four user roles, each with a distinct view of the application:

| Role | Who they are | What they see |
|---|---|---|
| **Guest** | Unauthenticated visitors | Public-facing info: event details, schedule, registration |
| **Participant** | Registered attendees | Personal dashboard, team, project submission, announcements |
| **Organizer** | Event staff from either club | Participant list, teams, projects, schedule management, announcements |
| **Admin** | Lead organizers / super-users | Everything organizers see plus judging, user management, and settings |

This file covers **frontend and design matters only**. It is the single source of truth for how
the UI looks, what components exist, how they are structured, and which design rules must never
be broken.

---

## 🛠 Tech Stack

| Layer | Tool |
|---|---|
| Framework | [Vite](https://vitejs.dev) + [React](https://react.dev) (latest stable) |
| Language | JavaScript — **no TypeScript** |
| Routing | [React Router v6](https://reactrouter.com) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Icons | [@hackclub/icons](https://icons.hackclub.com) — **only this icon set** |
| UI Components | [Hack Club Theme](https://theme.hackclub.com) / [hackclub/css](https://github.com/hackclub/css) — **only these** |
| Fonts | R&C (headings) + Phantom Sans (body) — **only these two fonts** |
| Deployment | TBD (assume static output, `vite build`) |

> ⚠️ **Do NOT introduce any other icon libraries (Heroicons, Lucide, FontAwesome, etc.).**
> ⚠️ **Do NOT introduce any other UI component libraries (shadcn, DaisyUI, Flowbite, etc.).**
> ⚠️ **Do NOT use system fonts or Google Fonts.** All typography must use R&C (headings) and Phantom Sans (body).
> ⚠️ **Do NOT add TypeScript.** All files are `.js` / `.jsx` only.

---

## 🎨 Brand & Styling Guidelines

### Color Palette

These are the **only** colors to use — derived directly from the Blueprint style guide.
Reference them via CSS custom properties.

```css
/* ── Blueprint Brand Colors ──────────────────────────────── */
--color-dark:    #0E305B;   /* Deep navy — primary background */
--color-darker:  #081C35;   /* Deeper navy — card/overlay bg  */
--color-light:   #DBE4EE;   /* Off-white — light surfaces     */

/* ── Semantic States ─────────────────────────────────────── */
--color-danger:  #FE8E86;   /* Danger / error — coral red     */
--color-warning: #FFC857;   /* Warning / caution — amber      */
--color-success: #A8F0AE;   /* Success / confirmation — mint  */
```

Text colors per the style guide:
- On `--color-dark` / `--color-darker` → **white text**
- On `--color-light` → **dark text** (e.g. `--color-darker`)
- On semantic surfaces → text in the matching semantic color

Extend these in Tailwind config as custom colors so they're available as `bg-dark`, `bg-darker`,
`bg-light`, `text-danger`, `text-warning`, `text-success`, etc.

> ⚠️ **No Hack Club brand colors** (`#ec3750`, `#ff8c37`, `#33d6a6`, etc.) — do not use them.
> Blueprint has its own palette and that is the only source of truth for color in this portal.

---

### Typography

Two fonts are used — one for headings, one for body. No other fonts are permitted.

#### Display / Heading Font — R&C (by JBFoundry)

**R&C** is the heading font. It is a geometric, grid-based display font with a technical
drafting / blueprint aesthetic — characters are constructed with compass-and-ruler construction
lines visible beneath the letterforms.

The font has four variants:

| Variant | CSS font-family | Use case |
|---|---|---|
| **Full** | `'RC'` | Page titles, dashboard headings — fully opaque white |
| **Dark** | `'RC Dark'` | Panel/section headings on dark backgrounds |
| **Light** | `'RC Light'` | Decorative / ghosted labels layered behind content |
| **Empty** | `'RC Empty'` | Outline-only / hollow text for decorative use |

**Licensing:** R&C is free for personal/demo use. The commercial license is at
`myfonts.com/fonts/jbfoundry/r-c/`. Self-host all font files in `public/fonts/` and declare
them via `@font-face` in `src/index.css`:

```css
/* R&C — Full (primary headings) */
@font-face {
  font-family: 'RC';
  src: local('R&C'),
       url('/fonts/RC.woff2') format('woff2'),
       url('/fonts/RC.woff')  format('woff');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
/* R&C — Dark */
@font-face {
  font-family: 'RC Dark';
  src: local('R&C Dark'),
       url('/fonts/RCDark.woff2') format('woff2'),
       url('/fonts/RCDark.woff')  format('woff');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
/* R&C — Light */
@font-face {
  font-family: 'RC Light';
  src: local('R&C Light'),
       url('/fonts/RCLight.woff2') format('woff2'),
       url('/fonts/RCLight.woff')  format('woff');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
/* R&C — Empty */
@font-face {
  font-family: 'RC Empty';
  src: local('R&C Empty'),
       url('/fonts/RCEmpty.woff2') format('woff2'),
       url('/fonts/RCEmpty.woff')  format('woff');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
```

> 🔑 **TODO for project lead**: Download the font files from dafont.com/r-c.font or purchase the
> commercial license from myfonts.com/fonts/jbfoundry/r-c/, place `.woff` and `.woff2` files in
> `public/fonts/`, and remove this TODO once done.

In Tailwind config, extend `fontFamily`:

```js
fontFamily: {
  display:         ['"RC"',       'sans-serif'],
  'display-dark':  ['"RC Dark"',  'sans-serif'],
  'display-light': ['"RC Light"', 'sans-serif'],
  'display-empty': ['"RC Empty"', 'sans-serif'],
  sans:            ['"Phantom Sans"', 'system-ui', 'sans-serif'],
},
```

Apply `font-display` on `h1`/`h2` and `font-display-dark` on `h3` in the global base layer.
Use `font-sans` for all body text, labels, inputs, and table content.

#### Body Font — Phantom Sans (Hack Club brand font)

Load all three weights from Hack Club's asset CDN:

```css
@font-face {
  font-family: 'Phantom Sans';
  src: url('https://assets.hackclub.com/fonts/Phantom_Sans_0.7/Regular.woff2') format('woff2'),
       url('https://assets.hackclub.com/fonts/Phantom_Sans_0.7/Regular.woff')  format('woff');
  font-weight: normal; font-style: normal; font-display: swap;
}
@font-face {
  font-family: 'Phantom Sans';
  src: url('https://assets.hackclub.com/fonts/Phantom_Sans_0.7/Italic.woff2') format('woff2'),
       url('https://assets.hackclub.com/fonts/Phantom_Sans_0.7/Italic.woff')  format('woff');
  font-weight: normal; font-style: italic; font-display: swap;
}
@font-face {
  font-family: 'Phantom Sans';
  src: url('https://assets.hackclub.com/fonts/Phantom_Sans_0.7/Bold.woff2') format('woff2'),
       url('https://assets.hackclub.com/fonts/Phantom_Sans_0.7/Bold.woff')  format('woff');
  font-weight: bold; font-style: normal; font-display: swap;
}
```

#### Typography Scale

```
h1 (page title)     → font-display,       text-4xl–6xl, font-normal, tracking-wide, uppercase
h2 (section title)  → font-display,       text-2xl–4xl, font-normal
h3 (panel title)    → font-display-dark,  text-xl–2xl,  font-normal
h4+, table headers  → font-sans bold,     text-base–lg
body / paragraphs   → font-sans,          text-base, leading-relaxed
labels / captions   → font-sans,          text-sm, opacity-70
form inputs         → font-sans,          text-base
```

---

### Visual Style — Blueprint Aesthetic

The portal shares the same engineering/blueprint drafting aesthetic as the public event site:
dark navy backgrounds, fine white grid lines, and vivid accent colors. Think: "technical
drawing brought to life."

Rules to follow:

- **Background**: Always `--color-dark` (`#0E305B`) as the root/page background.
- **Sidebar / navigation panel**: Use `--color-darker` (`#081C35`) as the background.
- **Blueprint grid**: A subtle CSS background-image grid using thin white lines at low opacity
  (`rgba(255,255,255,0.05)`) on dashboard hero areas and prominent section headers.
- **Card / panel surfaces**: `--color-darker` background, `1px solid rgba(255,255,255,0.1)` border.
  No drop shadows — rely on the border alone to define surfaces.
- **Headings**: White, uppercase for h1; sentence-case acceptable for h2/h3.
- **Accent**: `--color-warning` (`#FFC857`) for primary CTAs, active nav states, and key highlights.
  `--color-success` (`#A8F0AE`) for confirmed/approved statuses and success feedback.
  `--color-danger` (`#FE8E86`) for destructive actions, errors, and rejection states only.
- **Buttons**:
  - Primary: solid white background, `--color-darker` text. Hover: `hover:brightness-110`.
  - Outline: `1px solid white`, transparent background, white text.
  - Destructive: `--color-danger` background, dark text.
  - No other button color schemes.
- **Form inputs**: `--color-darker` background, `1px solid rgba(255,255,255,0.15)` border,
  white text, `--color-warning` focus ring. Placeholder text at 50% white opacity.
- **Tables**: Alternating rows using `rgba(255,255,255,0.03)`. Header row uses `--color-darker`
  background with `--color-warning` text.
- **Status badges**: Pill-shaped. Background at 15% opacity of the semantic color, border at
  60% opacity, text in the full semantic color.
  Example — pending: `bg-warning/15 border border-warning/60 text-warning`.
- **Section / panel dividers**: Dashed or dotted white lines at `rgba(255,255,255,0.12)` opacity,
  not solid full-opacity lines.

---

## 🖼 Logos & Assets

### Primary Logo (Temporary)

Use the official Hack Club flag logo from the asset CDN until the event logo is finalized:

```html
<!-- Preferred: Flag with Orpheus on top -->
<img src="https://assets.hackclub.com/flag-orpheus-top.svg" alt="Hack Club" />

<!-- Fallback: standalone flag -->
<img src="https://assets.hackclub.com/flag-standalone.svg" alt="Hack Club" />

<!-- Icon only (for favicon / compact sidebar) -->
<img src="https://assets.hackclub.com/icon-rounded.svg" alt="Hack Club" />
```

### Partner Logos

Placeholder components must be created for:
1. `GharbiyaSTEMHackClubLogo` — replace when real asset is provided
2. `GharbiyaSTEMRoboClubLogo` — replace when real asset is provided

Use a styled placeholder `<div>` with the org name until real assets arrive.
Mark with `{/* TODO: replace with actual logo asset */}`.

### Logo Usage Rules

- Never distort, recolor, or add effects to Hack Club logos.
- Never place a Hack Club logo on a background that makes it hard to read.
- Always link the Hack Club logo to `https://hackclub.com`.

---

## 🗂 Portal Structure

```
src/
├── main.jsx                          # Vite entry — mounts <App />, imports index.css
├── App.jsx                           # Root component — React Router route definitions
├── index.css                         # Font-face declarations, CSS custom properties, base styles
├── pages/
│   ├── Login.jsx                     # Login page — centered card, no sidebar
│   ├── guest/
│   │   ├── Home.jsx                  # Landing: event info, schedule, register CTA
│   │   └── Register.jsx              # Registration form
│   ├── participant/
│   │   ├── Dashboard.jsx             # Personal overview: team, project status, next event
│   │   ├── Team.jsx                  # My team — members, invite code
│   │   ├── Project.jsx               # Submit / edit project
│   │   ├── Schedule.jsx              # Read-only event schedule
│   │   └── Announcements.jsx         # Read-only announcement feed
│   ├── organizer/
│   │   ├── Dashboard.jsx             # Overview stats: registrations, teams, submissions
│   │   ├── Participants.jsx          # Participant list with search/filter
│   │   ├── Teams.jsx                 # Team list — name, members, project status
│   │   ├── Projects.jsx              # All submitted projects
│   │   ├── Schedule.jsx              # Schedule builder (CRUD)
│   │   └── Announcements.jsx         # Create / edit / delete announcements
│   └── admin/
│       ├── Dashboard.jsx             # Full overview + judging + user management links
│       ├── Judging.jsx               # Assign judges, enter scores, view leaderboard
│       ├── Users.jsx                 # User list — manage roles
│       └── Settings.jsx              # Event config
├── layouts/
│   ├── GuestLayout.jsx               # Guest shell — top nav, no sidebar
│   ├── ParticipantLayout.jsx         # Participant shell — sidebar + top bar
│   ├── OrganizerLayout.jsx           # Organizer shell — sidebar + top bar
│   └── AdminLayout.jsx               # Admin shell — sidebar + top bar (extends organizer nav)
├── components/
│   ├── layout/
│   │   ├── Sidebar.jsx               # Role-aware sidebar navigation
│   │   ├── TopBar.jsx                # Page title (RC font), user name, role badge
│   │   ├── GuestNav.jsx              # Top navigation bar for guest views
│   │   └── Footer.jsx                # Portal footer — HC attribution, partner logos
│   ├── sections/
│   │   ├── GuestHero.jsx             # Guest landing hero with event name + register CTA
│   │   ├── GuestSchedule.jsx         # Read-only schedule for the guest view
│   │   ├── AnnouncementFeed.jsx      # Announcement list (shared by participant + organizer)
│   │   ├── SchedulePanel.jsx         # Schedule display (shared, read-only)
│   │   └── OrganizerStats.jsx        # Stat tiles row on organizer/admin dashboard
│   └── ui/
│       ├── Button.jsx                # Primary / outline / destructive variants
│       ├── Card.jsx                  # Blueprint-styled panel
│       ├── Badge.jsx                 # Status badges (pending/success/danger/warning)
│       ├── Table.jsx                 # Styled data table
│       ├── Input.jsx                 # Styled text input / textarea
│       ├── Modal.jsx                 # Overlay dialog
│       ├── Toast.jsx                 # Success / error / warning notifications
│       └── SectionHeading.jsx        # Consistent h2/h3 section title treatment
public/
└── fonts/                            # Self-hosted R&C font files (.woff / .woff2)
```

---

## 🧩 Component Conventions

### JSX Components

- All component files use `.jsx`. Never introduce `.ts` or `.tsx`.
- Prefer Server Components for layout and display content.
- Add `'use client'` only when the component genuinely needs browser APIs or event handlers.
- Never use `'use client'` on layout shells or purely display components.

### Hack Club Icons

Import from `@hackclub/icons`:

```jsx
import Icon from '@hackclub/icons'
```

Reference icons at https://icons.hackclub.com — **only use icons from this set.**

Useful icons for the portal: `person`, `email`, `clubs`, `flag`, `calendar`, `clock`,
`bolt`, `hardware`, `check`, `x`, `edit`, `trash`, `external`, `github`, `slack`,
`chart-bar`, `door-enter`, `settings`, `announcement`.

### Tailwind Usage

- Use Tailwind utility classes directly in markup — no custom CSS unless strictly necessary.
- Extend `tailwind.config.mjs` with the brand colors and font families defined above.
- Use `@apply` sparingly; prefer inline utilities.
- Responsive breakpoints: mobile-first. Key breakpoints: `sm` (640px), `md` (768px), `lg` (1024px).
- The sidebar collapses to a bottom nav or hamburger drawer on `sm` screens.

### Role-Aware UI

Components that vary by role accept a `role` prop and render the appropriate variant.
Never show organizer or admin controls to participants or guests — gate them visually with
a role value passed down from the layout.

```jsx
// Show edit controls only to organizers and admins
{(role === 'organizer' || role === 'admin') && (
  <Button variant="outline">Edit</Button>
)}
```

### Null / Empty State Handling

Never render raw `null`, `undefined`, or empty arrays to the DOM:

| Data state | What to render |
|---|---|
| `null` date / time | `"Coming Soon"` with a `--color-warning` badge |
| `null` venue | `"Venue to be announced"` as muted placeholder |
| Empty list (participants, projects, etc.) | Empty-state card with an icon and a short message |
| Unsubmitted project | `"Not submitted"` badge in `--color-warning` |
| No team assigned | `"No team"` muted label |
| Score not entered | `"—"` dash, not `0` or blank |

---

## ✨ UI Patterns to Follow

| Pattern | Component |
|---|---|
| Guest landing hero with event name + register CTA | `GuestHero.jsx` |
| Top nav for unauthenticated / guest views | `GuestNav.jsx` |
| Role-aware sidebar with active link highlight in `--color-warning` | `Sidebar.jsx` |
| Top bar with page title in RC font, user name, role badge | `TopBar.jsx` |
| Blueprint-styled card panel with heading + content slot | `Card.jsx` |
| Stat tile (icon + number + label) for dashboard overviews | `OrganizerStats.jsx` |
| Searchable, filterable data table | `Table.jsx` + filter controls above |
| Status badge — pill shape, semantic color at varied opacities | `Badge.jsx` |
| Confirmation modal before any destructive action | `Modal.jsx` |
| Toast notification for action feedback | `Toast.jsx` |
| Pinned announcement at top of feed | `AnnouncementFeed.jsx` with `pinned` prop |
| Read-only schedule list for participants and guests | `SchedulePanel.jsx` |

---

## 🚫 Hard Rules — Never Do These

1. **No other fonts** — R&C variants for headings (h1/h2/h3), Phantom Sans for everything else. Nothing else, ever.
2. **No other icon sets** — @hackclub/icons only.
3. **No other component libraries** — Hack Club Theme / CSS only.
4. **No TypeScript** — all files are `.js` / `.jsx`. Never create `.ts` or `.tsx` files.
5. **No `null` or `undefined` rendered to DOM** — always provide a graceful fallback UI.
6. **No inline styles for colors** — use Tailwind classes or CSS custom properties only.
7. **No white/light backgrounds** — the portal is dark-navy only. `--color-light` is never used as a panel or page background.
8. **No distortion of Hack Club logos** — use them as-is from the CDN URLs above.
9. **No organizer/admin UI visible to participants or guests** — gate all elevated controls with a role check.
10. **No `console.log` left in production code** — use `{/* TODO: */}` comments for debug markers.
11. **No `'use client'` on layout shells or display-only components** — defer to server rendering unless interactivity is genuinely required.

---

## ✅ Copilot Collaboration Checklist

Before submitting any code suggestion, verify:

- [ ] File extension is `.js` or `.jsx` — no TypeScript introduced
- [ ] Colors used are from the defined palette only
- [ ] Heading font is R&C; body font is Phantom Sans — no other fonts used or imported
- [ ] Icons are from @hackclub/icons only
- [ ] Null / empty states have proper fallback UI
- [ ] Organizer and admin controls are hidden from participants and guests
- [ ] No `'use client'` added to layout shells or non-interactive components
- [ ] Tailwind classes follow mobile-first responsive pattern
- [ ] Destructive actions are guarded by a `Modal` confirmation
- [ ] Status fields use a `Badge` component — not raw strings
- [ ] Hack Club logo links to `https://hackclub.com`
- [ ] No inline color styles — Tailwind classes or CSS custom properties only

---

## 🔗 Key Reference Links

| Resource | URL |
|---|---|
| Hack Club Brand Guide | https://hackclub.com/brand |
| Hack Club Icons | https://icons.hackclub.com |
| Hack Club Theme | https://theme.hackclub.com |
| Hack Club CSS (GitHub) | https://github.com/hackclub/css |
| Blueprint reference site | https://blueprint.hackclub.com/guilds |
| Hack Club Assets CDN | https://assets.hackclub.com |
| Phantom Sans (Regular) | https://assets.hackclub.com/fonts/Phantom_Sans_0.7/Regular.woff2 |
| HC Flag Logo (SVG) | https://assets.hackclub.com/flag-orpheus-top.svg |
| R&C Font (free/demo) | https://www.dafont.com/r-c.font |
| R&C Commercial License | https://www.myfonts.com/fonts/jbfoundry/r-c/ |

---

*Last updated by: project lead — update this line when you modify this file.*
*Agents: if you modify this file, preserve all sections and append a changelog entry at the bottom.*

---

## 📝 Changelog

| Date | Author | Change |
|---|---|---|
| 2026-04-11 | Project lead | Initial AGENTS.md created for the hackathon portal |