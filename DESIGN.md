# FDE Training design system

The source of truth for how the training app looks and behaves. It is built on the **FiftyFive Design System** (navy, square, hairline, Plus Jakarta Sans). Tokens live once, at the top of `src/styles.css`; components and pages use only those tokens. Change the token, not the page.

The app shell and components follow the same patterns as the company's V3 programs app (cards, Lucide icons, toasts, confirm dialogs, skeletons, drawer), so the two products feel related, but they look different: this one is the FiftyFive brand, with the product name "FDE Training" under the logo.

## 1. Personality

Calm, precise, square. A FiftyFive product, not a generic dashboard.

- **Navy is the only saturated colour.** Headings, links, eyebrows, the primary button and the current place are navy; everything else is white, snow (`#F8F9FE`) and black. Pastel tints appear only in avatars, status chips and selected states.
- **Square and flat.** Radius 0 everywhere (buttons, inputs, cards, chips, tabs, dialogs, menus). Only avatars are round. Borders are 1 px hairlines; there are no soft drop shadows (only the brand's tiny float shadow `0 1px 4px rgba(0,0,0,.2)` on things that float: menus, toasts, dialogs). The active card carries a 5 px navy rule on its left edge.
- **One primary action per screen**, plain words, sentence case in text, spaced caps only for eyebrows, tags and chips.
- **Always say what is going on.** Loading shows skeletons in the shape of the content; empty states say what to do next; errors say what failed and offer "Try again".

## 2. Tokens

### Brand values (from the design system, transcribed once as `--ff-*`)

| Token | Value | Use |
|---|---|---|
| `--ff-navy` | `#000090` | Headings, links, eyebrows, active states |
| `--ff-navy-button` | `#000099` | Primary button fill (hover `--ff-navy`) |
| `--ff-snow` | `#F8F9FE` | Panels, inputs, text on dark |
| `--ff-black` / `-70` / `-50` / `-20` / `-10` | black at alpha | Text, muted text, hairlines |
| `--ff-blue-08` / `-10` / `-20` | `#2356F6` at alpha | Hairlines on snow panels |
| `--ff-green` | `#34C759` | Live dot only |
| `--ff-mint` `#8BDBC9`, `--ff-lavender` `#ACA6FF`, `--ff-avatar-periwinkle` `#D4DBFF`, `--ff-avatar-butter` `#FFEDA9`, `--ff-avatar-mint` `#E3FFF0` | | Avatars, chips, selected tints |

### App roles (what components use)

`--bg --surface --surface-2 --surface-3 --border --border-strong --text --text-2 --text-3 --text-display --accent --accent-bg --accent-bg-hover --on-accent --accent-soft --accent-soft-text --ring --success --warning --danger --info` (each with a `-soft` tint where it makes sense). Light uses the brand directly; dark is derived (section 5).

### What was changed from the brand, and why (WCAG 2.2 AA)

| Brand value | Problem | Used instead |
|---|---|---|
| Placeholder / meta text at 50% black | 4.0:1 on white | 62% black (`--text-3`), about 6:1 |
| Input border `rgba(35,86,246,.20)` | Under 3:1 for the edge of a control | `--border-strong #7F89AE` (3.5:1); the hairline look is kept, the field also has the snow fill |
| Status green `#34C759` as text | 2.2:1 on white | `#1B7A3A` for words; `#34C759` stays for the live dot |
| Navy on butter or mint chips | passes, kept | butter chip text darkened to `#6B4A00` |
| Brand type scale (76px display, 35px body line) | marketing sizes | App scale below |

### Type

Plus Jakarta Sans for text (headings 500, body 400, tracking `+0.01em`); Manrope for UI chrome (buttons 600, labels 600, tabs 600, tags and chips 700). Both load from Google Fonts in `index.html` (the CSP allows only `fonts.googleapis.com` and `fonts.gstatic.com`, so nothing is self-hosted).

App scale, keeping the brand's ratios, weights and tracking: `--fs-xs 12`, `--fs-sm 13`, `--fs-md 14` (controls, dense table text), `--fs-base 16` (body, line height 1.6), `--fs-lg 18` (card titles), `--fs-xl 22` (section titles), `--fs-2xl 30` (page titles), `--fs-3xl 46` (sign-in hero only). Eyebrows, tags and chips are Manrope 700 uppercase with 0.09 to 0.12em tracking, 11 to 12 px. `h1` and `h2` are navy (`--text-display`); card titles are black.

### Motion

Ease `cubic-bezier(.2,.7,.2,1)`; 150 ms fast (hover, press), 240 ms base (menus, drawer, day cards, page fade). Only opacity and transform animate. Under `prefers-reduced-motion: reduce` everything is cut to near zero and skeletons stop shimmering.

### Icons and logo

Lucide (`lucide-react`, pinned, ISC licence), only through `components/Icon.tsx`; decorative, the meaning is always in words. The FiftyFive logo is used unchanged (`public/assets/fiftyfive-logo-color.svg` on light, `-white.svg` on dark, swapped by CSS with `--logo-light` / `--logo-dark`), `alt="FiftyFive Technologies"`, with "FDE Training" under it in the side panel and next to it on the sign-in page. In the icon rail the same file is cropped to its mark.

## 3. Shell

- **Side panel** (256 px, hairline right edge): logo + "FDE Training", then **Home, Programme, Progress, Feed**, a "Tools" group (**Practice lab, Resources**, and for reviewers **Review**, for the admin **Admin**), then the **account button** (name, role) opening a popover with email, role, batch, theme (System / Light / Dark) and Sign out. Counts: missed days on Home, new items on Feed, submissions waiting on Review. Active item: soft fill, navy text, 4 px navy bar on the panel edge, `aria-current="page"`.
- **Icon rail** (72 px): the top-bar button folds the panel; the choice is remembered (`fde:sidebar`); labels become tooltips on hover and keyboard focus. Below 1200 px the panel starts as a rail.
- **Top bar** (56 px + safe area): fold or menu button, breadcrumb, the "View as" switch (reviewers and admin), the reminders bell.
- **Phones (< 768 px)**: bottom tab bar (Home, Programme, Progress, Feed, More) above the home indicator; "More" opens the drawer (focus moves in, page behind is inert, Esc / scrim / X / a link / Android Back closes it and focus returns). `lib/layers.ts` gives drawers, dialogs and popovers a history entry so Back closes the top layer first.
- **Devices**: `viewport-fit=cover` and `env(safe-area-inset-*)`, `100dvh`, 16 px inputs on touch (no iOS zoom), 44 px targets on touch, hover effects only under `(hover: hover)`. Checked at 360, 390, 412, 768, 1024, 1366 and 1920 px with no sideways scroll.
- **Routes** are lazy chunks. Route changes move focus to `<main>`; there is a skip link; a 401 shows "Your session has expired".

## 4. Pages and where the old pages went

| Page | Holds | Old addresses that redirect here |
|---|---|---|
| Home `/` | Greeting and progress ring, today's work (tick points in place), **Catch up** (`#catch-up`), **My steps** (`#steps`), new in the feed, profile | `/backlog`, `/myplan` |
| Programme `/week/:n` | Week switcher, six-week overview (`#overview`), day cards (Theory, Practical, study notes inline, Submit panel or cohort summary) | `/outline`, `/notes/:day` |
| Progress `/progress` | Tabs: My report or Reports, Week 1 results; `/progress/:id` for one person; status filter and print | `/report` |
| Feed `/feed` | Shared links, topics, sort, search | |
| Practice lab `/lab` | Tabs: Lab, Recruitment assistant, Task assistant; one shared Gemini key panel | `/assistant`, `/task-assistant` |
| Resources `/resources` | Tabs: Study notes, Stack guide, Readiness, Downloads | `/notes`, `/stack`, `/readiness`, `/docs` |
| Review `/review` | Reviewers only | |
| Admin `/admin` | Admin only | |

Tabs live in the address (`?tab=`), so they can be linked and reached with Back.

## 5. Dark theme (derived; the brand defines light only)

Dark follows the system unless the person picks Light or Dark (stored as `data-theme`, set before first paint by `public/theme-init.js`). Derived from the brand's ink and snow:

- Page `#0C0D14` (the brand ink), panels `#12141D` / `#181B27`, hairlines snow at 14%, text `#F8F9FE` (muted 74%, meta 62%).
- Navy cannot carry text or a button on near-black, so the accent becomes periwinkle `#8FA2FF` for buttons (dark text on it, 8:1) and lavender `#ACA6FF` for links and focus; headings use `#C9D0FF`. Control edges `#6F78A0` (3.7:1).
- Chips use translucent tints of the same hues with light text; the white FiftyFive logo is shown.

## 6. Components

| Component | Rules |
|---|---|
| Button | `.btn` primary (navy fill, snow text, hairline ring), `.secondary` (white, strong border), `.ghost`, `.danger`; icon left; 40 px high (44 touch); full-width variant `.block` with an icon for form cards |
| Form card | The pattern the owner likes: bold title, muted one-line subtitle, labelled fields with "(optional)" hints, a full-width primary button with an icon, in the square hairline style |
| Card | White, 1 px hairline, no shadow; the active or focused one gets the 5 px navy left rule (`.wcard.focus`, `.daycard.open`) |
| Chip, tag | Square, Manrope 700 uppercase, a dot before the word; words carry the meaning, colour backs it up |
| Tabs | Underlined links with `aria-current="page"`; segmented controls (`.seg`) for local switches |
| Toast, Dialog, Menu, Popover | As in the V3 app: toasts for results (errors stay 7 s, `role="alert"`), `useConfirm()` on `<dialog>` instead of `window.confirm`, arrow-key menus, Esc and Android Back close and return focus |
| Skeleton, Empty, Error | Skeletons sized like the content inside an `aria-busy` region; empty states give a next step; errors say what failed and offer "Try again" |
| Unsaved changes | `useUnsaved()` marks a form dirty; leaving through a link asks first, closing the tab asks too |
| Avatar | Initials on a brand tint (periwinkle, butter, mint, lavender), round, decorative |
