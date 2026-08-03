# Website project — handoff (as of Aug 3, 2026)

Paste this into a new Claude Code session (or hand it to whoever's picking this up) to continue exactly where this left off. This supersedes the prior handoff doc — every open item in that doc has either been resolved or is re-flagged below with current status.

## Site purpose (load-bearing)
This site is built exclusively for AI safety and governance roles. It is not being used for media operations job applications — that audience is not expected to land here, so content and framing should be judged against an AI-safety-literate reader, not a general operations hiring manager.

## Site structure (flat folder, all files uploaded together to GitHub Pages)
- `index.html` — Home
- `about.html` — About
- `work.html` — Experience (nav label is "Experience"; file/page internals still use "work" naming — see below)
- `projects.html` — Projects (new this session — split out of work.html)
- `ai-safety.html` — AI Safety & Governance
- `writing.html` — Writing index
- `contact.html` — Contact
- `styles.css` — shared stylesheet, linked by every page
- `AI/govproposal.html` — governance proposal (unchanged this session)
- `ai_video_course.html` — pre-existing, own visual identity, deliberately not restyled (unchanged)
- `airtable-hiring-workflow-tutorial.html` — restyled to match site tokens (unchanged); now linked from `projects.html` instead of `work.html`

Hosting: GitHub Pages. All internal links are relative paths except where noted below (this was fixed this session — see "Fixes applied").

## Nav (current, confirmed order — applies identically to all 7 pages)
```
About | AI safety | Experience | Projects | Writing | Contact
```
Link targets: `about.html`, `ai-safety.html`, `work.html`, `projects.html`, `writing.html`, `contact.html`. Only the **label** on the Experience link changed (was "Work"); the href and filename are still `work.html` — nothing broke, but be aware of the label/filename mismatch if you're grepping for "work" later.

**Known cosmetic gap, not yet addressed:** `work.html`'s own on-page `<h1>` still reads "Selected work" — it doesn't say "Experience." Flagged to the user once; no decision made yet on whether to change it.

## What changed this session (in order)

### 1. Projects page split out of Work
- New `projects.html` created with its own card grid, its own modal (same Situation/Challenge/Solution pattern as Work), and hash-based deep linking (`projects.html#slug`).
- Contains the 3 former "Projects & passions" case studies pulled out of `work.html`: AI video production upskilling, Media library, Building an enterprise hiring workflow in Airtable.
- `work.html` reduced to the 8 professional case studies; its "Media" filter chip was removed since no remaining Work item uses that tag (still present on Projects).
- **Bug fixed in the process:** the AI video course case study had a singular `link: {...}` property, but the modal renderer only ever checked `cs.links` (plural array). That meant "View the course" never rendered in the live modal. Fixed in `projects.html`'s script with a fallback: `else if (cs.link) { ... }`. Not yet verified whether the same fallback needs porting anywhere else — check if any other case study anywhere uses singular `link`.

### 2. Nav relabeled and reordered
- "Work" → "Experience" (link text only, see filename note above).
- Order changed from `About, Work, Projects, AI safety, Writing, Contact` to `About, AI safety, Experience, Projects, Writing, Contact`.

### 3. Fixes applied (from prior handoff's flagged inconsistencies)
- `contact.html` previously used absolute paths (`/about.html`, `/work.html`, etc.) while every other page used relative paths. **Fixed** — all nav links and the resume download link in `contact.html` are now relative, matching the rest of the site. Resume link now points to `JamesKelly_Resume_2026.pdf` (relative) — **not yet verified that this file actually lives at the repo root**; confirm before pushing.

### 4. Typography changes (styles.css)
- `header.page-head h1`: 22px → 32px (now matches About's `.name-title` size exactly).
- `header.page-head p` (subtitle): went 14px → 20px → **corrected down to 15px** (20px was reported as looking "weird" next to the 32px title — likely the font-family/line-height mismatch with the title's display font; 15px with `line-height: 1.5` resolved it).
- `.contact-wrap .name-title`: 19px → 32px, to match About/page-head convention (Contact doesn't use the `page-head` pattern, so this was a separate manual edit).
- `.section-label` (shared across every page — About, Experience, Projects, AI Safety, Writing all use this for section headers): 13px/weight 600 → **16px/weight 700, applied site-wide.** Flagged to user that this wasn't scoped to AI Safety only, per their request wording — no objection raised, treat as intentional/accepted.

### 5. Chip sizing (Experience & Projects only, NOT Writing)
- Chips on `work.html` and `projects.html` increased ~25%: font-size 12px→15px, padding 6px/14px→7.5px/17.5px.
- **Scoped via `#chips .chip` in styles.css**, not the global `.chip` class — Work and Projects both use `id="chips"` on their filter container; Writing's filter chips use `id="wchips"` and were deliberately left untouched. If a future page adds filter chips and wants the larger size, give its container `id="chips"` (or add another scoped rule) — don't touch the base `.chip` class without checking Writing first.

### 6. Modal sizing (shared class — affects Experience & Projects identically)
- `.modal`: max-width 560px→700px, padding 1.75rem→2.1875rem (~25% increase, single shared CSS class so one edit covered both pages).

### 7. Modal content changes (Experience & Projects)
- Removed "Under construction — full write-up and supporting media coming soon." banner from both pages' modals entirely.
- **Experience only:** added a footer note element (`#modalFooterNote`) reading "Supporting materials coming soon..." at the bottom of every modal *except* `ryot-greenlight-process` (the one case study with a real image already in place). Logic is a hardcoded slug check in the script — `cs.slug === "ryot-greenlight-process" ? "" : "Supporting materials coming soon..."`. If more real media gets added to other case studies, this line needs the exclusion list expanded (currently only excludes one slug, not media-presence-driven).

### 8. "Skills applied" section added to Experience modals only (not Projects)
- New element between the title and the media placeholder: `<p class="scs-label">Skills applied</p><div class="skill-list" id="modalSkills"></div>`.
- Rendered as neutral pills (`.skill-pill` — new CSS class, not part of the category tag color system) so they're visually distinct from the org/operational/tech/etc. category tags above the title.
- Every one of the 8 Experience case studies now has a `skills: [...]` array in its data object. **These were authored by Claude, derived strictly from each case study's existing Situation/Challenge/Solution text — not new claims from the user.** Flagged for the user to review; not yet confirmed accurate/complete by them.
- Projects' 3 case studies do **not** have this field or section — only added to Experience per the specific request.

### 9. Experience page reorganized into Entrepreneurial / Enterprise
- Two new labeled sections (`.section-label` headers "Entrepreneurial" and "Enterprise"), each with its own grid container (`#gridEntrepreneurial`, `#gridEnterprise`).
- **Entrepreneurial** (top): Cassette Systems — housing PM plan, Hatch Escapes.
- **Enterprise** (below): the remaining 6 case studies (AOL/Yahoo consolidation, RYOT greenlight process, Studio builds, Motion capture pipeline, Yahoo hiring pipeline, DAM/systems integration), in original order.
- Each case study object now has a `group: "entrepreneurial" | "enterprise"` field driving which grid it renders into. Filter chips still work globally across both grids (`document.querySelectorAll(".card")`, not grid-scoped).

### 10. New "Positioning" section added to AI Safety & Governance page
- Section header: "Positioning: Operations Experience → AI Safety & Governance", placed directly after the page header, before Coursework.
- Contains an origin paragraph plus three subsections (each with two paragraphs, bold lead-in phrases): **Managing diverse, cross-disciplinary teams**, **Business analysis & process development**, **Media & production experience**.
- Full text was supplied verbatim by the user — not paraphrased or altered, only lightly marked up with `<strong>` on lead-in phrases and placed into the existing `.section-label`/`.section-body` classes.
- Flagged to user once that the section is long (7 paragraphs before Coursework) — no changes requested in response; treat as accepted as-is.

### 11. Coursework and "What I'm focused on" sections swapped
- AI Safety page order is now: Positioning → **What I'm focused on** → **Coursework** → The governance landscape → Writing on this.

## Design system reference (styles.css, current state)
- CSS custom properties for light/dark mode, tag color system unchanged from prior handoff (Organizational purple, Technical blue, Legal amber, Financial green, Founder-built red, Operational grey, Media teal).
- Shared components: `.card`, `.section-label`/`.section-body` (now 16px/bold), `.quote-block`/`.quote-strip`, `.list-row`, `.focus-card`, `.feature-card`, `.chip` (base) + `#chips .chip` (scoped larger variant), `.modal`/`.overlay`, and the new `.skill-list`/`.skill-pill`.
- Style conventions still enforced: no em dashes, Title Case preserved verbatim when specified, no fabricated quotes/testimonials.

## Resume
- Canonical file confirmed: **`JamesKelly_Resume_2026.pdf`**, referenced from `contact.html`'s download link (relative path, file expected at repo root — not yet verified present).
- **Open/unconfirmed:** two discrepancies were flagged in this resume during this session and the user said they'd fix them themselves. Status of that fix is unknown as of this handoff:
  1. Professional summary said "$30M studio operation" / "250+ person team" while the Yahoo Studios bullet below it said "$45M annual operating budget" / "300+ person team" — same job, two different numbers, needs reconciling to one figure (memory prior to this resume consistently used $30M/300+).
  2. BlueDot coursework listed "Future of AI" as a certificate name, with no mention of "AGI Safety Fundamentals" (which prior sessions have as the first course completed) — unclear if renamed or dropped.
- A separate exec summary rewrite was drafted and delivered in-chat this session (dropped a repeated "ambiguous/ambiguity," removed a defensive "Genuine," restored comma structure) — **not yet incorporated into the actual resume file**, only shown as suggested text.

## Domain
Resolved: **zentropic.co**. No longer an open question.

## Cassette Systems title — resolved, no change made
User confirmed the CA HCD dealer-of-record license is still active and still held personally. Per that, the "Co-Founder & Chief Operating Officer" title was **kept as-is** on both the resume and the website case study — a "Strategic Advisor" relabel was considered and rejected, since it would misstate an active legal/regulatory role, not just soften a tone. If this changes (license lapses, dealer-of-record role transfers), both the resume and the `cassette-housing-pm` case study likely need revisiting.

## Still-open asset gaps (unchanged from prior handoff, not addressed this session)
- `img/about.png` — About page photo
- `img/bluedotbadge.png` — used 3x on AI Safety page
- `img/AIGoveEcosystemMap.pdf` — ecosystem map document
- `media-library-tutorial.html`, `medialibrary/library.html`, `img/medialib.png` — three destinations for the Media Library entry (now on `projects.html`)
- Real photos/diagrams for 7 of 8 Experience case studies (only `ryot-greenlight-process` has a placeholder image path set: `img/ryotflow.png` — not yet confirmed to exist on disk)
- A second real, cleared manager quote for About page

## Unresolved side items carried forward
- The three inline SVG diagrams (Find/Render comparison, recursive enshittification loop, governance thumbnail) built for Substack essays in an earlier session were never exported as real `.svg`/`.png` files — still just chat renders, not saved anywhere.
