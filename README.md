# Crowdventure

Crowdventure is a multi-tenant crowdfunding app. Each creator has a subdomain home, and each project is a campaign slug under that home. Signed-in creators design the project in the studio at `/account/[slug]`. The public page shows the story, pledges, roadmap, and only the blocks published from the studio.

## Stack

- Next.js 14 App Router
- React 18
- PostgreSQL with Prisma 7
- Better Auth for email and password accounts
- Stripe Checkout with Connect destination charges
- Tailwind CSS

Subdomain routing lives in `middleware.ts`. Apex hosts (`localhost`, `crowdventure.quest`, `venturesolo.quest`) serve the marketing site and `/account`. A creator host such as `protocol.localhost:3000` rewrites to that creator's pages.

## Quick start

```bash
npm install
npx prisma migrate deploy
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). A creator home is [http://protocol.localhost:3000](http://protocol.localhost:3000), and a campaign is [http://localhost:3000/protocol/protocol100](http://localhost:3000/protocol/protocol100).

## Environment

```bash
DATABASE_URL=            # pooled Postgres URL
DIRECT_URL=              # optional direct URL for Prisma migrations
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
STRIPE_SECRET_KEY=       # Checkout and Connect stay off until this is set
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=          # password reset and email confirmation
EMAIL_FROM=              # verified sender, used with Resend
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Next.js development server |
| `npm run build` | Generate the Prisma client and build |
| `npm start` | Serve the production build |
| `npm run lint` | Next.js ESLint |

## Payments

Creators connect a Stripe Express account from the studio. Checkout asks Stripe to email a receipt. An instant pledge is a destination charge on behalf of the creator. `application_fee_amount` is 5% of the pledge, and Stripe sends the other 95% to the creator. Stripe charges its processing fee to that destination account, on top of the 5%. A milestone pledge stays on the platform until the pull request is merged and the backer signs off, then the same 95% is transferred. The webhook marks the pledge paid, and the success page confirms the Checkout Session with Stripe if the webhook has not arrived yet. Studio reconcile covers one subdomain. Platform reconcile at `/account/reconcile` covers every studio for emails in `PLATFORM_ADMIN_EMAILS`. A full refund or dispute reverses the campaign total.
