import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2">Privacy Policy</h1>
        <p className="text-gray-500 text-sm">Last updated: March 2026</p>
      </div>

      <div className="space-y-8 text-gray-400 text-sm leading-relaxed">
        <Section title="1. Information We Collect">
          When you register and use BGMI Arena, we collect:
          <ul className="list-disc pl-5 space-y-1.5 mt-2">
            <li>Name, email address, and phone number</li>
            <li>BGMI in-game ID and username</li>
            <li>UPI ID (only when you request a withdrawal)</li>
            <li>Payment transaction data (processed securely by Razorpay — we do not store card or bank details)</li>
            <li>Referral code usage data</li>
          </ul>
        </Section>

        <Section title="2. How We Use Your Information">
          <ul className="list-disc pl-5 space-y-1.5 mt-2">
            <li>To create and manage your account</li>
            <li>To process tournament registrations and payments</li>
            <li>To send room ID and match details via email</li>
            <li>To verify match results and distribute prizes</li>
            <li>To process withdrawal requests to your UPI ID</li>
            <li>To improve platform features and user experience</li>
          </ul>
        </Section>

        <Section title="3. Data Storage & Security">
          Your data is stored on secure MongoDB Atlas servers. Passwords are hashed using bcrypt and never stored in plain text. Payment processing is handled entirely by Razorpay — we do not store any card or bank details. Authentication uses JWT tokens that expire after 7 days.
        </Section>

        <Section title="4. Third-Party Services">
          We use the following third-party services:
          <ul className="list-disc pl-5 space-y-1.5 mt-2">
            <li>Razorpay — payment processing</li>
            <li>Resend — transactional email delivery</li>
            <li>MongoDB Atlas — database hosting</li>
            <li>Cloudinary — banner image storage</li>
          </ul>
          Each service has its own privacy policy. We encourage you to review them.
        </Section>

        <Section title="5. Data Sharing">
          We do not sell, trade, or share your personal information with third parties except as required to operate the platform (e.g., payment processor) or as required by law.
        </Section>

        <Section title="6. Your Rights">
          You may request deletion of your account and associated data by contacting us. Upon request, we will delete your personal information within 30 days, except where retention is required by law.
        </Section>

        <Section title="7. Cookies">
          We use minimal browser storage (localStorage) for authentication tokens only. We do not use tracking or advertising cookies.
        </Section>

        <Section title="8. Contact">
          For privacy-related concerns, email us at{' '}
          <a href="mailto:spalande092@gmail.com" className="text-orange-400 hover:underline">spalande092@gmail.com</a>.
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
