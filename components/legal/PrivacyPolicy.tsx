import { LegalDocument } from "@/components/legal/legal-document";

export default function PrivacyPolicy() {
  return (
    <LegalDocument kicker="Privacy" title="Privacy policy">
      <p>
        CrowdVenture is a public studio for independent software. This policy describes the information the platform
        keeps so a maker can run a campaign and a patron can back it.
      </p>
      <section>
        <h2>Account and studio</h2>
        <p className="mt-3">
          An account stores a name, an email address, a password hash, and an optional profile: subdomain, headline,
          bio, and image. Sessions store a token, expiry, and the IP address and browser string sent with the sign-in.
          A studio page and its campaigns, tiers, phases, and updates are public by design.
        </p>
      </section>
      <section>
        <h2>Pledges and payments</h2>
        <p className="mt-3">
          A pledge stores the backer&apos;s name, email, optional wall message, amount, funding mode, and the Stripe
          identifiers needed to confirm payment, transfer a milestone, or reverse a refund or dispute. Card numbers
          stay with Stripe. CrowdVenture does not store them. Creators connect a Stripe account from the studio so
          payouts can reach them.
        </p>
      </section>
      <section>
        <h2>Waitlist and rescue requests</h2>
        <p className="mt-3">
          The beta list stores a name, email, optional note, and consent to be contacted. A project-rescue opt-in
          stores a name, email, whether you are a backer or a maker, the project you named, and an optional note.
          Those records are used to review the request and write back to that email.
        </p>
      </section>
      <section>
        <h2>Community</h2>
        <p className="mt-3">
          Joining a project room stores your account on that room&apos;s membership list. That membership is also your
          membership in the CrowdVenture community. Comments store the text you post, the time, and the account that
          wrote them. Comments stay on the project room if you leave it.
        </p>
      </section>
      <section>
        <h2>How it is used</h2>
        <ul className="mt-3">
          <li>Run accounts, studios, checkout, milestone holds, and payouts.</li>
          <li>Show public campaign pages, backer walls, project rooms, and comments.</li>
          <li>Send the messages you asked for: waitlist confirmation, a studio invite, or a rescue follow-up.</li>
          <li>Detect abuse, duplicate signups, and payment disputes.</li>
        </ul>
      </section>
      <section>
        <h2>What we do not do</h2>
        <p className="mt-3">
          CrowdVenture does not sell personal information. A pledge is a fee for access, a perk, early software, or
          sponsorship. It is not a purchase of equity, and the platform does not build an investment profile from it.
        </p>
      </section>
      <section>
        <h2>Asking for a change</h2>
        <p className="mt-3">
          Write from the email on the account, waitlist entry, or rescue request and ask for a copy, a correction, or
          deletion. Payment records that Stripe or a dispute still requires are kept until that obligation ends. Public
          campaign copy can be edited from the studio by the creator who published it.
        </p>
      </section>
    </LegalDocument>
  );
}
