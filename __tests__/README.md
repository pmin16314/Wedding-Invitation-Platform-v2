# Vowly Invites — Unit Tests

## Setup

```bash
npm install           # installs jest, ts-jest, @types/jest
npm test              # run all suites once
npm run test:watch    # watch mode during development
npm run test:cov      # with full coverage report
```

## Test Suites (9 files, ~320 test cases)

| File | Area | Cases |
|------|------|-------|
| `lib.utils.test.ts` | `generateToken`, `makeSlug`, `formatDate`, `ok`/`err`, `signCloudinary`, `rateLimit`, SSE chat helpers | ~37 |
| `validation.phone.test.ts` | LK phone format/strip, `validatePhone`, `validateField` (name, email) | ~40 |
| `api.schemas.test.ts` | All Zod schemas: Lead, NewWedding, RSVP, Guest, Status, Credentials, Theme, Share, Settings, Wish, Event, Sections | ~76 |
| `api.business-logic.test.ts` | Attendee capping, date parsing, CSV escaping, gallery limits, inviteType defaults, rate limit windows | ~37 |
| `api.routes.test.ts` | Every route handler with mocked Prisma + auth — happy paths, auth enforcement, validation errors, edge cases | ~76 |
| `auth.config.test.ts` | JWT callback, session callback, all 9 `authorized` redirect/allow cases | ~15 |
| `slug.collision.test.ts` | Slug format, collision suffix strategy, character safety, length limits | ~7 |
| `whatsapp.template.test.ts` | Template placeholder replacement, link generation, edge cases, wa.me URL encoding | ~21 |
| `countdown.logic.test.ts` | Countdown math (days/hours/mins/secs), past date handling, unit boundaries | ~12 |

## What is tested

- **Pure utility functions** — fully covered
- **Zod validation schemas** — every field, every constraint, every enum value
- **Auth middleware callbacks** — all 9 routing cases (admin/couple/unauthenticated × login/admin/dashboard)
- **API route handlers** — auth enforcement (401), input validation (422), not found (404), rate limiting (429), successful responses (200/201), and business logic edge cases
- **Business logic** — attendee capping, CSV escaping, gallery limits, phone formatting
- **Template engine** — WhatsApp message placeholders, link injection, edge cases

## Mocking strategy

- `@/lib/auth` — `mockAuth` returns configurable session objects
- `@/lib/prisma` — `mockPrisma` with `jest.fn()` for every method used
- `next/cache` — `revalidatePath` is mocked to a no-op
- `crypto` — uses real implementation; `Date.now` mocked in timer tests

## Not unit-tested (requires integration environment)

- Cloudinary actual upload (external service — signature generation is tested)
- Next.js middleware Edge Runtime
- React component rendering (needs jsdom + Testing Library configured for CSS modules)
- Full auth flow with real bcrypt and DB (covered by integration tests)
