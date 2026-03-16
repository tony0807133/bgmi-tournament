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
            <li>Payment transaction data (processed securely by Razorpay — we do not store card details)</li>
            <li>Match screenshots uploaded for prize verification</li>
            <li>Google profile data if you sign in with Google (name, email, profile picture)</li>
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
          Your data is stored on secure MongoDB Atlas servers. Passwords are hashed using bcrypt and never stored in plain text. Payment processing is handled entirely by Razorpay — we do not store any card or bank details. We use JWT tokens for authentication, which expire after 7 days.
        </Section>

        <Section title="4. Screenshot Data">
          Winning screenshots uploaded for prize verification are stored on our server and automatically deleted after 10 days. Screenshots are only accessible to platform admins for verification purposes.
        </Section>

        <Section title="5. Third-Party Services">
          We use the following third-party services:
          <ul className="list-disc pl-5 space-y-1.5 mt-2">
            <li>Razorpay — payment processing</li>
            <li>Google OAuth — optional sign-in</li>
            <li>Nodemailer / Gmail SMTP — email delivery</li>
            <li>MongoDB Atlas — database hosting</li>
          </ul>
          Each service has its own privacy policy. We encourage you to review them.
        </Section>

        <Section title="6. Data Sharing">
          We do not sell, trade, or share your personal information with third parties except as required to operate the platform (e.g., payment processor) or as required by law.
        </Section>

        <Section title="7. Your Rights">
          You may request deletion of your account and associated data by contacting us. Upon request, we will delete your personal information within 30 days, except where retention is required by law.
        </Section>

        <Section title="8. Cookies">
          We use minimal cookies for authentication sessions. We do not use tracking or advertising cookies.
        </Section>

        <Section title="9. Contact">
          For privacy-related concerns, email us at privacy@bgmiarena.com.
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
