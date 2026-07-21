export const metadata = {
  title: "Terms of Service — Sanad",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="font-display text-3xl font-bold text-ink mb-2">
          Terms of Service
        </h1>
        <p className="text-sm text-slate mb-8">
          Effective date: July 21, 2026 | Last updated: July 21, 2026
        </p>

        <div className="space-y-8 text-sm text-ink leading-relaxed">
          <section>
            <h2 className="font-display text-xl font-semibold mb-3">1. Acceptance</h2>
            <p className="text-slate">
              These Terms are a binding agreement between Sanad Technologies (&quot;Sanad,&quot;
              &quot;we,&quot; &quot;us&quot;) and the school, academy, or educational institution
              registering for or using the Sanad platform (the &quot;Institution&quot;). By
              creating an account, starting a trial, or using the Service, the Institution&apos;s
              authorized representative confirms they have the authority to bind the Institution
              and accepts these Terms in full.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">2. Description of Service</h2>
            <p className="text-slate">
              Sanad is a web-based, multi-tenant software-as-a-service platform that helps
              schools and academies manage staff, students, attendance, academics, fees, and
              communication with parents/guardians. Features vary by subscription plan and
              enabled modules.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">3. Free trial</h2>
            <p className="text-slate">
              New Institutions receive a 21-day free trial with full access to their selected
              plan&apos;s features, no payment method required. At trial end without an active
              subscription, the account moves to a restricted state: existing data remains
              visible, but new record creation is paused until a subscription is activated.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">4. Subscriptions and payment</h2>
            <p className="text-slate">
              Plans and pricing are published on our website and may be updated. Price changes
              apply only to renewals, not current billing periods. At launch, payments are
              via bank transfer, JazzCash, or Easypaisa with proof-of-payment upload. Paid
              subscription fees are generally non-refundable once a billing period has begun.
              Cancellation takes effect at the end of the current paid period.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">5. Acceptable use</h2>
            <p className="text-slate">
              The Institution agrees not to: use the Service for unlawful purposes; attempt
              unauthorized access to another Institution&apos;s data; upload data without
              appropriate authority; reverse-engineer the Service; send unsolicited bulk
              communications; or interfere with the Service&apos;s integrity. Violations may
              result in suspension or termination.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">6. Data ownership and export</h2>
            <p className="text-slate">
              The Institution retains ownership of all data entered into the Service. We claim
              no ownership over Institution Data. An Institution may request a data export at
              any time. Following cancellation, data is retained for 90 days then deleted or
              anonymized, unless longer retention is required by law.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">7. Intellectual property</h2>
            <p className="text-slate">
              Sanad retains all rights to the software, design, branding, and underlying
              technology — excluding Institution Data. Nothing grants the Institution any right
              to use Sanad&apos;s trademarks or software outside the Service.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">8. Disclaimers</h2>
            <p className="text-slate">
              The Service is provided &quot;as is&quot; and &quot;as available.&quot; We do not
              guarantee specific uptime or error-free operation, though we take security
              seriously. We disclaim all implied warranties to the maximum extent permitted by
              law.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">9. Limitation of liability</h2>
            <p className="text-slate">
              Our total liability will not exceed the amount the Institution paid in the twelve
              months preceding the claim. We are not liable for indirect, incidental, or
              consequential damages.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">10. Termination</h2>
            <p className="text-slate">
              The Institution may cancel anytime through billing settings, effective at period
              end. We may suspend access for non-payment or material breach with notice and
              opportunity to export data before deletion.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">11. Governing law</h2>
            <p className="text-slate">
              Governed by the laws of Pakistan. Disputes first attempted via good-faith
              negotiation, then subject to exclusive jurisdiction of Pakistani courts.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">12. Contact</h2>
            <p className="text-slate">
              Sanad Technologies<br />
              Email: legal@sanad.pk<br />
              Address: Pakistan
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
