<!-- ea3981bd-b268-4cf8-9f75-ddf15f367e11 9f3d149f-90d2-46e8-babb-99672bcf29c7 -->
# OM Indian Restaurant Next.js Rebuild & Ordering System (Updated)

## Goals & Scope

- **Rebuild the marketing site** currently on WordPress using **Next.js + TypeScript**, matching content/sections but fixing menu, prices, and structure.
- **Implement a first-party ordering system** (no DoorDash redirect) where customers **build an order, add free-text notes per dish, and pay in-store only**.
- **Integrate with Toast POS/printer** so new orders flow into Toast (and thus the kitchen printer) via a Toast-specific connector behind a pluggable integration layer.
- Keep this **lean (no formal automated test suite or heavy documentation)** while still clean and maintainable.

## Tech Stack & Infrastructure

- **Frontend framework**: Next.js (App Router, TypeScript, likely Next 14+).
- **Styling/UI**: Tailwind CSS + headless UI primitives for fast, modern, mobile-first layout.
- **State management**: Local cart state with React context or Zustand; server actions / API routes for order submission.
- **Backend/data**:
- Relational DB (e.g. Postgres via Supabase/Neon/RDS) accessed with Prisma.
- Entities: `Category`, `MenuItem`, `Order`, `OrderItem`, `OrderItemNote` (free-text per dish instance), plus any supporting tables.
- **Deployment**: Vercel or similar for the Next.js app; managed DB service; environment variables for secrets.
- **Tooling**: ESLint, Prettier, TypeScript strict mode. Minimal but solid dev tooling, no heavy CI/test infrastructure beyond basic linting on commit.

## Content, Layout, and Design

- **Global layout**:
- Traditional layout with a **top navigation bar** on all pages: logo on the top-left, navigation links on the right (Menu, Order, Catering, About, Contact, etc.).
- No persistent side panel layout; ordering/cart UI will fit naturally within the main content (e.g. cart on the right only on the order page if needed, but navigation stays top-bar style).
- A **Google Maps embed (or similar)** rendered **just above the footer** on key pages (or globally via a shared layout section) showing the restaurant’s location.
- **Pages/sections** (responsive, SEO-friendly):
- **Home**: Hero with logo and hero image, key dishes imagery, CTAs (View Menu, Order Now), brief story, and optional DoorDash link if desired.
- **Menu**: Structured menu from canonical data (no Word/PDF mismatch), with categories and clear prices.
- **Catering**: Dedicated page pulling from `CATERING MENU (NEW).docx` with clear contact/CTA.
- **Order**: Main ordering interface (likely `/order`) with menu browsing and cart in a straightforward layout (list of items + optional cart panel), following the top-nav pattern.
- **About**: Story, chef/restaurant background, gallery using assets.
- **Visit/Contact**: Address, hours, phone, email/contact form, plus the map above the footer.

## Menu & Data Modeling (Simplified Modifiers)

- **Source of truth**:
- Parse/import data from the existing Word/PDF menu files into structured seed data (e.g. Prisma seed) as the canonical menu source.
- Normalize categories, item names, descriptions, prices, and flags (e.g. spicy, vegetarian) only where clearly needed.
- **Data model (high-level)**:
- `Category`: name, description, sort order.
- `MenuItem`: belongs to `Category`; name, description, base price, simple flags.
- **No structured modifier groups** like “Spice Level” or “Rice Choice” in the data model for now.
- `Order`: customer info (name, phone), order type (pickup/delivery if they offer it), timing (ASAP/scheduled), status, optional overall order note.
- `OrderItem`: references `MenuItem`, quantity, price at time of order.
- `OrderItemNote`: free-text associated with a specific `OrderItem` row (per dish instance) for things like “extra spicy”, “no onions”, or “one mild, one spicy”.

## Cart & Ordering UX (Free-Text Notes, Pay-in-Store Only)

- **Adding items**:
- From the menu, each `MenuItem` card has an **Add to order** button.
- When adding, the user can set quantity and **optionally enter a free-text note for that specific dish instance** (e.g. “extra spicy, no onions, one with rice, one without”).
- **Per-dish notes vs quantity**:
- Encourage **one dish instance per cart line** when users want different notes: they can add the same item multiple times, each with quantity 1 and a different note.
- Provide a quick **“Add another with different notes”** option on the cart item so the flow feels smooth.
- **Cart behavior**:
- Shows all line items with name, quantity, per-line notes, and price, plus ability to edit/remove items and notes.
- Shows subtotal, tax estimate, and any fees (if applicable), but **no online payment form**.
- **Checkout flow**:
- Collect: name, phone, order type (pickup vs delivery, depending on restaurant policy), pickup time (ASAP or scheduled time), and an optional **overall order note**.
- On submit: validate, create `Order` + `OrderItem`s + `OrderItemNote`s in DB, then send to Toast via the integration layer.
- Show a confirmation screen with order summary and pickup/delivery expectations.

## Backend Order Flow & Toast POS/Printer Integration

- **Order pipeline**:

1. API route / server action receives validated order payload from frontend.
2. Persist `Order`, `OrderItem`, and `OrderItemNote` records in the DB with status `NEW`.
3. Trigger an `OrderDispatcher` service responsible for forwarding the order to Toast (and any secondary channels if needed).

- **Dispatcher design**:
- Keep a small but **pluggable** `OrderDispatcher` abstraction (for possible future POS or notification channels).
- Implement a **ToastChannel** that maps our orders to Toast’s API (menu item IDs, modifiers as free-text notes where appropriate, customer info, and order timing).
- Optionally keep a simple `EmailChannel` or `DashboardChannel` as fallback/backup if Toast integration is ever offline.
- **Toast mapping**:
- Store mapping between our `MenuItem` IDs and Toast catalog items (and any Toast-required metadata) in the DB.
- When dispatching, translate each `OrderItem` into Toast’s expected payload, and include **order-level and item-level notes** as modifiers or comments so they appear on the Toast tickets.
- **Printer behavior**:
- Rely on Toast’s standard behavior to generate and print kitchen tickets once an order is created via its API.
- If auto-print is disabled or unreliable, rely on Toast’s own UI workflows, with our system purely feeding Toast.

## Quality, Performance, and Manual QA

- **Quality approach**:
- Focus on clean, simple code (TypeScript, Prisma), but **skip formal automated test suites and deep documentation** per your budget constraints.
- Rely on targeted manual QA passes for critical flows: browsing menu, adding items with notes, submitting orders, and verifying they appear correctly in Toast.
- **Performance**:
- Use static generation (SSG) or ISR for marketing pages and the mostly-static menu.
- Keep order-related endpoints efficient, and use image optimization and sane bundle splitting to keep the site feeling snappy.

## Minimal Documentation & Project Hygiene

- **Git & repo setup**:
- Initialize a git repo with `.gitignore` and clear, readable commit history.
- **Docs**:
- Provide a **concise `README.md`** explaining how to run/dev/deploy the project and where to set Toast/DB environment variables.
- Skip deep architecture and workflow docs unless you decide to add them later.

## Phased Implementation Plan (Updated)

- **Phase 0 – Setup & Discovery**
- Initialize Next.js + TypeScript + Tailwind project, git repo, and basic linting/formatting.
- Ingest menu assets/docs; design the simplified DB schema and create Prisma models.
- **Phase 1 – Marketing Site & Static Menu**
- Implement core pages (Home, Menu, Catering, About, Contact) using structured menu data and existing assets.
- Implement the **top navigation bar**, consistent layout, and **map embed just above the footer** via the shared layout.
- **Phase 2 – Cart & Order Creation (Free-Text Notes)**
- Implement menu → cart flow, with per-dish **free-text notes** and an optional overall order note at checkout.
- Create the order API route, persist orders in DB, and build a simple internal "Orders" view (can be within the main app with basic protection).
- **Phase 3 – Toast Integration Layer**
- Implement the `OrderDispatcher` abstraction and **ToastChannel** connector.
- Add the mapping between our menu items and Toast catalog IDs, then wire order submission to create corresponding orders in Toast so tickets print.
- **Phase 4 – Manual QA, Polish, and Launch**
- Conduct manual QA for core flows (menu, cart, checkout, Toast printing) across a few devices/browsers.
- Fix any UX/content issues, finalize content with client, deploy to production, and walk the restaurant through the flow.

### To-dos

- [ ] Initialize Next.js + TypeScript + Tailwind project, configure ESLint/Prettier/CI, and set up git repository.
- [ ] Design and implement the Prisma data model for categories, menu items, options, orders, order items, and notes, then run initial migrations.
- [ ] Parse the existing Word/PDF menus into structured seed data and verify all items, prices, and categories with the client.
- [ ] Implement Home, Menu, Catering, About, and Contact pages using structured menu data and existing assets, ensuring responsive design.
- [ ] Build the menu browsing, add-to-cart flow with per-dish notes, and the checkout form that creates orders in the database.
- [ ] Create an internal orders dashboard for staff to view, filter, and update order statuses, with basic auth/protection.
- [ ] Implement the OrderDispatcher with pluggable channels and add the POS integration connector plus email/dashboard fallbacks.
- [ ] Add unit, integration, and e2e tests for key flows and write README, ARCHITECTURE, PLAN, and ORDERING_WORKFLOW documentation files.
- [ ] Run performance/accessibility checks, finalize content, deploy to production, and walk the restaurant through using the new system.