# PubTrack Publisher Dashboard

Next.js 16 app for publisher catalog, inventory, distribution, and sales.

Shared UI primitives live in `components/ui` (kept identical to `library-portal`). Preview them at `/design-system`. See `../docs/phase-1-design-system.md`.

The authenticated shell (sidebar, top bar, route stubs) is documented in `../docs/phase-4-publisher-dashboard-shell.md`. The `/dashboard` overview (seven publisher questions) is documented in `../docs/phase-5-publisher-dashboard-overview.md`. Catalog list/detail/create/edit is documented in `../docs/phase-6-books-and-editions.md`. Inventory, copies, and QR tokens are documented in `../docs/phase-7-inventory.md`. Partner libraries are documented in `../docs/phase-8-libraries.md`. Live analytics and alerts are documented in `../docs/phase-11-analytics.md`.

## Getting Started

```bash
npm run dev
```

The app listens on [http://localhost:3001](http://localhost:3001). NestJS must be running on `http://localhost:3000` (`API_URL` / `NEXT_PUBLIC_API_URL`).

Demo publisher login (seeded in `pubtrack-backend`):

- Email: `quinn.m@example.net`
- Password: `ChangeMe123!`

After sign-in you land on `/dashboard`. Sidebar sections other than Dashboard, Books, Inventory, Libraries, Distribution, Sales, Analytics, and Alerts are shells until their feature phases land.

## Routes

| Path | Notes |
|---|---|
| `/login` | Public |
| `/design-system` | Public primitive gallery |
| `/dashboard` | Overview — KPIs, library rankings, low stock, top sellers, activity |
| `/books` | Catalog list, search, add title |
| `/books/new` `/books/[id]` `/books/[id]/edit` | Create, detail, edit book |
| `/books/[id]/editions/new` `/books/[id]/editions/[editionId]/edit` | Edition forms |
| `/inventory` | Warehouse stock, low-stock, generate copies, QR tokens |
| `/inventory/[editionId]` `/inventory/copies/[copyId]` | Edition stock + copy detail |
| `/libraries` | Partner libraries — list, add, link by slug |
| `/libraries/new` `/libraries/link` `/libraries/[id]` `/libraries/[id]/edit` | Create, link, detail, edit |
| `/distribution` `/sales` | Shipments and partner sales history |
| `/analytics` | Period KPIs, top books, library performance, activity |
| `/alerts` | Low-stock warehouse exceptions |
| `/reports` | Insights stub (Phase 20) |
| `/users` `/settings` | Admin stubs |

Unauthenticated visits to those paths redirect to `/login`.
