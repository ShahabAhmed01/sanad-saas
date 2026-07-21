export const metadata = {
  title: "Privacy Policy — Sanad",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="font-display text-3xl font-bold text-ink mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-slate mb-8">
          Effective date: July 21, 2026 | Last updated: July 21, 2026
        </p>

        <div className="space-y-8 text-sm text-ink leading-relaxed">
          <section>
            <h2 className="font-display text-xl font-semibold mb-3">1. Who we are</h2>
            <p className="text-slate">
              Sanad (&quot;Sanad,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is a school and academy management platform
              operated by Sanad Technologies, based in Pakistan. This policy explains what
              information we collect through the Sanad platform (the &quot;Service&quot;), why we
              collect it, how we protect it, and the choices available to schools, staff,
              parents/guardians, and students whose information passes through the Service.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">2. Who this applies to</h2>
            <p className="text-slate">
              Sanad is a business-to-business tool licensed to schools and academies
              (&quot;Institutions&quot;). The Institution — not Sanad — is the primary account
              holder and controls who at the school (staff) and which families
              (parents/guardians) get access. Students do not create their own Sanad
              accounts. Student information is entered and managed by the Institution&apos;s
              authorized staff.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">3. Information we collect</h2>
            <ul className="text-slate space-y-2 list-disc list-inside">
              <li><strong>Institution information:</strong> school name, address, contact details, board/curriculum type, branding assets, and subscription/billing details.</li>
              <li><strong>Staff information:</strong> full name, role, employee code, phone number, CNIC, address, qualifications, date joined, photo, and salary details for payroll.</li>
              <li><strong>Student information:</strong> full name, date of birth, gender, admission number, B-Form number, photo, class/section, attendance records, academic marks, fee status, and any notes staff enter.</li>
              <li><strong>Parent/Guardian information:</strong> full name, relationship to student, CNIC, phone number, email address, and payment records.</li>
              <li><strong>Automatically collected:</strong> IP address, browser/device type, and usage logs needed to operate and secure the Service.</li>
              <li><strong>Payment information:</strong> for manual transfers, we receive reference numbers and/or proof-of-payment images. We never collect or store card numbers or wallet PINs.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">4. How we use information</h2>
            <p className="text-slate">
              We use the information to operate core features (attendance, gradebook, fee
              management, communication), authenticate users, enforce role-based permissions,
              generate documents (report cards, receipts, certificates), send notifications,
              process subscription billing, maintain security and audit trails, and improve the
              Service. We do not use student, staff, or parent data for advertising, and we do
              not sell personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">5. Children&apos;s data protections</h2>
            <p className="text-slate">
              Because much of the information concerns minor students, we apply extra care:
              student data is never used for marketing; access is restricted by role-based
              permissions; we do not allow children to create their own login accounts; and we
              follow internationally recognized principles for children&apos;s data (data
              minimization, purpose limitation, strong access controls).
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">6. Data security</h2>
            <p className="text-slate">
              We apply industry-standard safeguards: encryption in transit (HTTPS/TLS) and at
              rest; strict Row-Level Security ensuring one Institution&apos;s data is never
              accessible to another; role-based access control within each Institution; and an
              audit log of significant actions. We will promptly notify affected Institutions of
              any confirmed data breach.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">7. Data sharing</h2>
            <p className="text-slate">
              We share information only: with the Institution itself; with service providers
              who help us run the Service (Supabase, Vercel, Resend, and payment gateways)
              under confidentiality obligations; for legal reasons under Pakistani law; and in
              a business transfer with continuity commitments. We do not sell personal
              information.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">8. Data retention</h2>
            <p className="text-slate">
              We retain data for as long as the Institution&apos;s subscription is active,
              plus a 90-day grace period after cancellation. Institutions can request data
              export at any time before deletion.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">9. Your rights</h2>
            <p className="text-slate">
              You may request access to, correction of, or deletion of personal information
              (subject to the Institution&apos;s record-keeping obligations), request a data
              export, and withdraw consent for optional communications. Contact your
              Institution&apos;s administrator or email us directly.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">10. Changes to this policy</h2>
            <p className="text-slate">
              We may update this policy as the Service evolves or as Pakistani data-protection
              law develops. Material changes will be communicated via email or in-app notice.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">11. Governing law</h2>
            <p className="text-slate">
              This policy is governed by the laws of the Islamic Republic of Pakistan. Read
              together with our Terms of Service.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">12. Contact us</h2>
            <p className="text-slate">
              Sanad Technologies<br />
              Email: privacy@sanad.pk<br />
              Address: Pakistan
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
