import { Link } from 'react-router-dom';

export default function TermsOfService() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2">Terms of Service</h1>
        <p className="text-gray-500 text-sm">Last updated: March 2026</p>
      </div>

      <div className="space-y-8 text-gray-400 text-sm leading-relaxed">
        <Section title="1. Acceptance of Terms">
          By accessing or using BGMI Arena, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform. We reserve the right to update these terms at any time with notice posted on the platform.
        </Section>

        <Section title="2. Eligibility">
          You must be at least 18 years old to participate in paid tournaments. By registering, you confirm that you meet this requirement. Users under 18 may browse the platform but cannot make payments or join paid events.
        </Section>

        <Section title="3. Account Responsibility">
          You are responsible for maintaining the confidentiality of your account credentials. Any activity under your account is your responsibility. Report unauthorized access immediately to{' '}
          <a href="mailto:esportbgmiarena@gmail.com" className="text-orange-400 hover:underline">esportbgmiarena@gmail.com</a>.
          We reserve the right to suspend accounts that violate these terms.
        </Section>

        <Section title="4. Tournament Rules">
          <ul className="list-disc pl-5 space-y-1.5 mt-2">
            <li>Entry fees are non-refundable once a tournament begins, except in cases of cancellation by BGMI Arena.</li>
            <li>Players must use their registered BGMI ID during matches. Using a different account is grounds for disqualification.</li>
            <li>Room ID and password are sent via email. Do not share them with non-registered players.</li>
            <li>Results are final once verified by admin. Disputes must be raised within 24 hours with evidence.</li>
            <li>BGMI Arena reserves the right to cancel or reschedule tournaments at any time.</li>
          </ul>
        </Section>

        <Section title="5. Payments & Refunds">
          Entry fees are collected via Razorpay. Wallet deposits are credited instantly after payment verification. Refunds are issued to your BGMI Arena wallet in the following cases:
          <ul className="list-disc pl-5 space-y-1.5 mt-2">
            <li>Tournament cancelled by admin</li>
            <li>Tournament does not reach minimum player count</li>
            <li>Technical failure preventing match from starting</li>
          </ul>
          Wallet balance can be withdrawn to your UPI ID. Withdrawals are processed within 3–5 business days.
          See our full <Link to="/refund-policy" className="text-orange-400 hover:underline">Refund Policy</Link>.
        </Section>

        <Section title="6. Prize Distribution">
          Prizes are distributed to the team leader's wallet after admin verification of match results. BGMI Arena retains 20% of the total entry fee pool as a platform fee. Kill prizes are awarded only to top 3 ranked players.
        </Section>

        <Section title="7. Prohibited Conduct">
          <ul className="list-disc pl-5 space-y-1.5 mt-2">
            <li>Using hacks, cheats, emulators, or any third-party software that provides unfair advantage</li>
            <li>Teaming with opponents in solo/duo matches</li>
            <li>Creating multiple accounts to gain unfair advantage</li>
            <li>Abusing, harassing, or threatening other players or staff</li>
          </ul>
          Violations result in immediate disqualification, account ban, and forfeiture of any prizes.
        </Section>

        <Section title="8. Limitation of Liability">
          BGMI Arena is not responsible for internet connectivity issues, server downtime of BGMI game servers, or any losses arising from technical failures outside our control. Our maximum liability is limited to the entry fee paid for the affected tournament.
        </Section>

        <Section title="9. Governing Law">
          These terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in India.
        </Section>

        <Section title="10. Contact">
          For any questions regarding these terms, contact us at{' '}
          <a href="mailto:esportbgmiarena@gmail.com" className="text-orange-400 hover:underline">esportbgmiarena@gmail.com</a>.
        </Section>
      </div>

      <div className="mt-10 text-center">
        <Link to="/contact" className="btn-secondary text-sm">Contact Us</Link>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-white font-bold text-base mb-2">{title}</h2>
      <div>{children}</div>
    </div>
  );
}
