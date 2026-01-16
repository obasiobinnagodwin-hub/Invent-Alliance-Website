import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | Invent Alliance Limited',
  description: 'Privacy Policy and GDPR compliance information for Invent Alliance Limited',
};

export default function PrivacyPolicyPage() {
  const lastUpdated = 'January 16, 2025';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 via-slate-700/50 to-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-slate-800/95 backdrop-blur-md rounded-lg shadow-xl p-8 border border-slate-700">
          <h1 className="text-4xl font-extrabold mb-6 gradient-text-blue text-elevated-bold">
            Privacy Policy
          </h1>
          
          <p className="text-white/80 mb-6 text-sm">
            <strong>Last Updated:</strong> {lastUpdated}
          </p>

          <div className="prose prose-invert max-w-none space-y-6 text-white/90">
            {/* Controller Identity */}
            <section>
              <h2 className="text-2xl font-bold mb-4 gradient-text-purple text-elevated-bold">
                1. Controller Identity (GDPR Art. 13(1)(a))
              </h2>
              <p className="mb-4">
                <strong>Data Controller:</strong> Invent Alliance Limited<br />
                <strong>Address:</strong> [Company Address]<br />
                <strong>Email:</strong> <Link href="/contacts" className="text-neon-cyan hover:text-neon-blue underline">Contact Us</Link><br />
                <strong>Website:</strong> <Link href="/" className="text-neon-cyan hover:text-neon-blue underline">www.inventallianceco.com</Link>
              </p>
            </section>

            {/* Purposes and Legal Bases */}
            <section>
              <h2 className="text-2xl font-bold mb-4 gradient-text-purple text-elevated-bold">
                2. Purposes and Legal Bases for Processing (GDPR Art. 13(1)(c), (d))
              </h2>
              <p className="mb-4">
                We process personal data for the following purposes:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Website Analytics:</strong> To understand website usage, improve user experience, and analyze traffic patterns. <strong>Legal Basis:</strong> Consent (GDPR Art. 6(1)(a))</li>
                <li><strong>Contact Form Submissions:</strong> To respond to inquiries and provide customer support. <strong>Legal Basis:</strong> Legitimate interest (GDPR Art. 6(1)(f))</li>
                <li><strong>Academy Registration:</strong> To process registrations for Invent Academy programs. <strong>Legal Basis:</strong> Contract performance (GDPR Art. 6(1)(b))</li>
                <li><strong>Authentication:</strong> To provide secure access to admin dashboard. <strong>Legal Basis:</strong> Legitimate interest (GDPR Art. 6(1)(f))</li>
                <li><strong>Security:</strong> To protect against fraud, abuse, and security threats. <strong>Legal Basis:</strong> Legitimate interest (GDPR Art. 6(1)(f))</li>
              </ul>
            </section>

            {/* Data Categories */}
            <section>
              <h2 className="text-2xl font-bold mb-4 gradient-text-purple text-elevated-bold">
                3. Categories of Personal Data (GDPR Art. 13(1)(e))
              </h2>
              <p className="mb-4">We collect and process the following categories of personal data:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Contact Information:</strong> Name, email address, phone number (from contact forms and academy registration)</li>
                <li><strong>Technical Data:</strong> IP address (pseudonymized), browser type, device information, session identifiers</li>
                <li><strong>Usage Data:</strong> Pages visited, time spent on pages, referral sources, click patterns</li>
                <li><strong>Authentication Data:</strong> Username, password hash (for admin users only)</li>
                <li><strong>Communication Data:</strong> Messages submitted through contact forms</li>
              </ul>
            </section>

            {/* Retention Periods */}
            <section>
              <h2 className="text-2xl font-bold mb-4 gradient-text-purple text-elevated-bold">
                4. Data Retention Periods (GDPR Art. 13(2)(a))
              </h2>
              <p className="mb-4">We retain personal data for the following periods:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Analytics Data:</strong> 30 days (pseudonymized IP addresses)</li>
                <li><strong>Contact Form Submissions:</strong> 2 years from submission date</li>
                <li><strong>Academy Registrations:</strong> 5 years from registration date (for program records)</li>
                <li><strong>User Sessions:</strong> 24 hours (session cookies)</li>
                <li><strong>Authentication Data:</strong> Retained while account is active, deleted upon account closure</li>
              </ul>
              <p className="mb-4">
                After the retention period expires, data is securely deleted or anonymized.
              </p>
            </section>

            {/* Data Subject Rights */}
            <section>
              <h2 className="text-2xl font-bold mb-4 gradient-text-purple text-elevated-bold">
                5. Your Rights (GDPR Art. 13(2)(b), (c), (d), (e))
              </h2>
              <p className="mb-4">Under GDPR, you have the following rights:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Right of Access (Art. 15):</strong> Request a copy of your personal data</li>
                <li><strong>Right to Rectification (Art. 16):</strong> Request correction of inaccurate data</li>
                <li><strong>Right to Erasure (Art. 17):</strong> Request deletion of your personal data (&quot;right to be forgotten&quot;)</li>
                <li><strong>Right to Restrict Processing (Art. 18):</strong> Request limitation of data processing</li>
                <li><strong>Right to Data Portability (Art. 20):</strong> Receive your data in a structured, machine-readable format</li>
                <li><strong>Right to Object (Art. 21):</strong> Object to processing based on legitimate interests</li>
                <li><strong>Right to Withdraw Consent (Art. 7(3)):</strong> Withdraw consent for analytics at any time</li>
                <li><strong>Right to Lodge a Complaint (Art. 77):</strong> File a complaint with your supervisory authority</li>
              </ul>
              <p className="mb-4">
                To exercise these rights, please <Link href="/contacts" className="text-neon-cyan hover:text-neon-blue underline">contact us</Link>.
              </p>
            </section>

            {/* International Transfers */}
            <section>
              <h2 className="text-2xl font-bold mb-4 gradient-text-purple text-elevated-bold">
                6. International Transfers (GDPR Art. 13(1)(f), Art. 44-49)
              </h2>
              <p className="mb-4">
                Some of our service providers may process data outside the European Economic Area (EEA). 
                We ensure appropriate safeguards are in place, including:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
                <li>Adequacy decisions where applicable</li>
                <li>Data processing agreements with all third-party providers</li>
              </ul>
            </section>

            {/* Third Parties */}
            <section>
              <h2 className="text-2xl font-bold mb-4 gradient-text-purple text-elevated-bold">
                7. Third-Party Data Processors (GDPR Art. 13(1)(e))
              </h2>
              <p className="mb-4">We use the following third-party services:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>SMTP Email Service:</strong> For sending contact form and registration emails. Data is processed according to the provider&apos;s privacy policy.</li>
                <li><strong>Hosting Provider:</strong> Website hosting and infrastructure. Data is stored in secure data centers.</li>
                <li><strong>Google Maps:</strong> Embedded map functionality. Google may collect usage data according to their privacy policy. You can manage preferences in your browser settings.</li>
                <li><strong>Analytics Services:</strong> Self-hosted analytics (no third-party analytics cookies unless consent is given)</li>
              </ul>
              <p className="mb-4">
                All third-party processors are bound by data processing agreements and GDPR compliance requirements.
              </p>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-2xl font-bold mb-4 gradient-text-purple text-elevated-bold">
                8. Cookies and Tracking Technologies
              </h2>
              <p className="mb-4">We use the following types of cookies:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Necessary Cookies:</strong> Required for website functionality (authentication, security). These cannot be disabled.</li>
                <li><strong>Analytics Cookies:</strong> Used to analyze website usage and improve user experience. These require your consent.</li>
              </ul>
              <p className="mb-4">
                You can manage cookie preferences through the cookie consent banner or your browser settings.
              </p>
            </section>

            {/* Security Measures */}
            <section>
              <h2 className="text-2xl font-bold mb-4 gradient-text-purple text-elevated-bold">
                9. Security Measures (GDPR Art. 32)
              </h2>
              <p className="mb-4">We implement the following security measures:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Encryption of sensitive data at rest (AES-256-GCM)</li>
                <li>Pseudonymization of IP addresses for analytics</li>
                <li>Secure password hashing (bcrypt)</li>
                <li>HTTPS/TLS encryption for data in transit</li>
                <li>Regular security updates and patches</li>
                <li>Access controls and authentication for admin functions</li>
                <li>CSRF protection for form submissions</li>
                <li>Rate limiting to prevent abuse</li>
              </ul>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-bold mb-4 gradient-text-purple text-elevated-bold">
                10. Contact Information
              </h2>
              <p className="mb-4">
                For questions about this privacy policy or to exercise your rights, please contact us:
              </p>
              <p className="mb-4">
                <Link href="/contacts" className="text-neon-cyan hover:text-neon-blue underline font-semibold">
                  Contact Form
                </Link>
              </p>
            </section>

            {/* Changes to Policy */}
            <section>
              <h2 className="text-2xl font-bold mb-4 gradient-text-purple text-elevated-bold">
                11. Changes to This Policy
              </h2>
              <p className="mb-4">
                We may update this privacy policy from time to time. The &quot;Last Updated&quot; date at the top 
                indicates when changes were made. We encourage you to review this policy periodically.
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-700">
            <Link 
              href="/" 
              className="text-neon-cyan hover:text-neon-blue font-semibold inline-flex items-center gap-1 group"
            >
              ← Back to Home
              <span className="group-hover:-translate-x-1 transition-transform duration-300">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

