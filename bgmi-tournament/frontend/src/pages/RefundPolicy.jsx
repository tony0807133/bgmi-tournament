import { Link } from 'react-router-dom';

export default function RefundPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2">Refund & Cancellation Policy</h1>
        <p className="text-gray-500 text-sm">Last updated: March 2026</p>
      </div>

      <div className="space-y-8 text-gray-400 text-sm leading-relaxed">
        <Section title="Overview">
          BGMI Arena is committed to fair treatment of all players. This policy explains when and how refunds are issued for tournament entry fees and wallet deposits.
        </Section>

        <Section title="Tournament Entry Fee Refunds">
          Entry fees are refunded to your BGMI Arena wallet in the following cases:
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>
              <span className="text-white font-medium">Tournament Cancelled by Admin</span> — If admin cancels a tournament before it starts, all entry fees are automatically refunded to players' wallets and a refund email is sent.
            </li>
            <li>
              <span className="text-white font-medium">Insufficient Players</span> — If a tournament does not fill the minimum required slots before the scheduled time, all registrations are refunded.
            </li>
            <li>
              <span className="text-white font-medium">Platform Technical Failure</span> — If a match cannot start due to a platform-side technical issue, affected players receive a full refund.
            </li>
          </ul>
        </Section>

        <Section title="When Refunds Are NOT Issued">
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>Player fails to join the match room on time</li>
            <li>Player is disqualified for rule violations or cheating</li>
            <li>Player voluntarily withdraws after tournament has started</li>
            <li>Internet or device issues on the player's end</li>
            <li>BGMI game server issues outside our control</li>
            <li>Player registered with incorrect BGMI ID</li>
          </ul>
        </Section>

        <Section title="Wallet Deposits">
          Wallet deposits made via Razorpay are non-refundable to the original payment method. However, your wallet balance can be withdrawn to your UPI ID at any time (subject to minimum withdrawal of ₹10).
          <br /><br />
          If a Razorpay payment is deducted but your wallet is not credited, contact us within 48 hours at{' '}
          <a href="mailto:spalande092@gmail.com" className="text-orange-400 hover:underline">spalande092@gmail.com</a>{' '}
          with your payment ID and we will resolve it within 2 business days.
        </Section>

        <Section title="Refund Method">
          All tournament refunds are credited to your BGMI Arena wallet balance — not to the original payment method. Wallet balance can then be used for future tournaments or withdrawn to your UPI ID.
        </Section>

        <Section title="Wallet Withdrawals">
          <ul className="list-disc pl-5 space-y-1.5 mt-2">
            <li>Minimum withdrawal amount: ₹10</li>
            <li>Maximum withdrawal per transaction: ₹50,000</li>
            <li>Withdrawals are processed to your registered UPI ID</li>
            <li>Processing time: 3–5 business days</li>
            <li>If a withdrawal is rejected by admin, the amount is automatically returned to your wallet</li>
          </ul>
        </Section>

        <Section title="Cancellation by Player">
          Players cannot cancel a tournament registration once payment is made. If you are unable to participate, your entry fee is forfeited unless the tournament is cancelled by admin.
        </Section>

        <Section title="Dispute Resolution">
          If you believe a refund was incorrectly denied, contact us within 48 hours of the tournament end time with:
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Your registered email address</li>
            <li>Tournament name and date</li>
            <li>Description of the issue</li>
            <li>Any supporting screenshots</li>
          </ul>
          <br />
          Email: <a href="mailto:spalande092@gmail.com" className="text-orange-400 hover:underline">spalande092@gmail.com</a>
          <br />
          We will review and respond within 3 business days.
        </Section>
      </div>

      <div className="mt-10 text-center">
        <Link to="/contact" className="btn-secondary text-sm">Contact Support</Link>
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
