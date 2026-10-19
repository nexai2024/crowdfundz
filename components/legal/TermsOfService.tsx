import Link from "next/link";
import { LegalDocument } from "@/components/legal/legal-document";

export default function TermsOfService() {
  return (
    <LegalDocument kicker="Terms" title="Terms of service">
      <p>
        CrowdVenture connects a solo software maker with people who want the product. Using a studio, a campaign page,
        or checkout means you accept these terms.
      </p>
      <section>
        <h2>What a pledge is</h2>
        <p className="mt-3">
          A contribution is a fee for access, a digital perk, an early software version, or creator sponsorship.
          CrowdVenture is not an equity crowdfunding portal, broker-dealer, or registered investment advisor. Backing
          a creator does not confer equity, ownership, voting rights, or a monetary return. Contributions are
          non-charitable and are not tax-deductible.
        </p>
      </section>
      <section>
        <h2>How the money moves</h2>
        <p className="mt-3">
          Checkout runs through Stripe. The platform fee is 5% of the pledge. The creator receives the other 95%
          through a connected Stripe account, and Stripe&apos;s processing fee is charged on that account.
        </p>
        <ul className="mt-3">
          <li>An instant pledge is paid to the creator when checkout succeeds.</li>
          <li>
            A milestone pledge stays on the platform until the linked pull request is merged and the backer signs off.
            The 95% is transferred after that.
          </li>
          <li>A full refund or a dispute reverses the amount counted on the campaign.</li>
        </ul>
      </section>
      <section>
        <h2>Makers</h2>
        <p className="mt-3">
          The creator is responsible for the story, the tiers, and the work they said the pledge supports. The public
          page is the record: the roadmap, the commits, and the phase notes. A studio can be paused or removed when
          payments, the public page, or these terms are being abused.
        </p>
      </section>
      <section>
        <h2>Patrons</h2>
        <p className="mt-3">
          You pay for the tier you chose. Polls and comments on a campaign are a way to weigh in. They are not shares
          and they do not direct the company. If a project goes quiet, held milestone funds follow the{" "}
          <Link href="/legal/abandoned-projects" className="text-emerald-300 hover:text-emerald-200">
            abandoned project policy
          </Link>
          .
        </p>
      </section>
      <section>
        <h2>Accounts</h2>
        <p className="mt-3">
          Keep the email on the account current. During the open beta, new studios may be invited from the waitlist
          instead of open signup. You are responsible for activity under your session.
        </p>
      </section>
    </LegalDocument>
  );
}
