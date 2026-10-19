import { OptInRescueModal } from "@/components/dashboard/OptInRescueModal";
import { LegalDocument } from "@/components/legal/legal-document";

export default function AbandonedProjectPolicy() {
  return (
    <LegalDocument kicker="Projects" title="Abandoned project policy">
      <p>
        A CrowdVenture campaign is a public build. This policy is what happens when that build stops, and how a backer
        or another maker can ask for a rescue review.
      </p>
      <section>
        <h2>When a project is quiet</h2>
        <p className="mt-3">
          A project is treated as quiet when the studio stops shipping in public and milestone phases stay unsigned.
          The campaign page remains the record of what was promised and what was paid.
        </p>
      </section>
      <section>
        <h2>Money already released</h2>
        <p className="mt-3">
          An instant pledge is paid to the creator when checkout succeeds. A milestone amount is paid after the pull
          request is merged and the backer signs off. Released funds are not sitting in a platform hold, and opting
          into rescue does not claw them back.
        </p>
      </section>
      <section>
        <h2>Money still held</h2>
        <p className="mt-3">
          Milestone amounts that have not been signed off stay on the platform. They are not transferred to the
          creator while the phase is open. A rescue review can recommend a refund of those held amounts, or a named
          maker continuing the public build before a later release.
        </p>
      </section>
      <section>
        <h2>Opting in</h2>
        <p className="mt-3">
          A backer can ask for held funds to be reviewed. A maker can offer to continue the public build. The request
          names you, the project, and which of those two roles you are taking. It is a request for a decision. It does
          not transfer ownership, create equity, or refund anything by itself.
        </p>
        <div className="mt-5">
          <OptInRescueModal
            label="Opt in to project rescue"
            className="inline-flex rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-emerald-400"
          />
        </div>
      </section>
    </LegalDocument>
  );
}
