export default function RefundPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2">Refund Policy</h1>
        <p className="text-gray-500 text-sm">Last updated: March 2026</p>
      </div>

      <div className="space-y-8 text-gray-400 text-sm leading-relaxed">
        <Section title="Overview">
          BGMI Arena is committed to fair treatment of all players. This policy explains when and how refunds are issued.
        </Section>

        <Section title="When Refunds Are Issued">
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li><span className="text-white font-medium">Tournament Cancelled</span> — If admin cancels a tournament, all entry fees are automatically refunded to players' BGMI Arena wallets.</li>
            <li><span className="text-white font-medium">Insufficient Players</span> — If a tournament does not fill the minimum required slots before the scheduled time, all registrations are refunded.</li>
            <li><span className="text-white font-medium">Technical Failure</span> — If a match cannot start due to a platform-side technical issue, affected players receive a full refund.</li>
          </ul>
        </Section>

        <Section title="When Refunds Are NOT Issued">
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>Player fails to join the match room on time</li>
            <li>Player is disqualified for rule violations or cheating</li>
            <li>Player voluntarily withdraws after tournament has started</li>
            <li>Internet or device issues on the player's end</li>
            <li>BGMI game server issues outside our control</li>
          </ul>
        </Section>

        <Section title="Refund Method">
          All refunds are credited to your BGMI Arena wallet balance — not to the original payment method. Wallet balance can then be used for future tournaments or withdrawn to your UPI ID.
        </Section>

        <Section title="Withdrawal of Wallet Balance">
          <ul className="list-disc pl-5 space-y-1.5 mt-2">
            <li>Minimum withdrawal amount: ₹10</li>
            <li>Withdrawals are processed to your registered UPI ID</li>
            <li>Processing time: 3–5 business days</li>
            <li>If a withdrawal is rejected by admin, the amount is returned to your wallet</li>
          </ul>
        </Section>

        <Section title="Dispute Resolution">
          If you believe a refund was incorrectly denied, contact us within 48 hours of the tournament end time with your registered email and tournament details. We will review and respond within 3 business days.
        </Section>

        <Section title="Contact">
          Refund queries: support@bgmiarena.com
        </Section>
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
