export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

      <div className="prose prose-gray max-w-none space-y-6">
        <p className="text-muted-foreground">
          Last updated: {new Date().toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold mt-8">1. Introduction</h2>
          <p>
            At Caarl, we are committed to protecting your privacy and personal information. This Privacy Policy explains
            how we collect, use, store, and protect your data in compliance with the Protection of Personal Information
            Act (POPIA) and other applicable South African laws.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold mt-8">2. Information We Collect</h2>
          <p>We collect the following types of information:</p>

          <h3 className="text-xl font-semibold mt-4">Personal Information:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Name and surname</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Delivery address</li>
            <li>Payment information (processed securely through Paystack)</li>
          </ul>

          <h3 className="text-xl font-semibold mt-4">Account Information:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Username and password (encrypted)</li>
            <li>Order history</li>
            <li>Wishlist and saved items</li>
            <li>Product reviews and ratings</li>
          </ul>

          <h3 className="text-xl font-semibold mt-4">Technical Information:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>IP address</li>
            <li>Browser type and version</li>
            <li>Device information</li>
            <li>Cookies and similar technologies</li>
            <li>Pages visited and time spent on site</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold mt-8">3. How We Use Your Information</h2>
          <p>We use your information for the following purposes:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Processing and fulfilling your orders</li>
            <li>Communicating with you about your orders and account</li>
            <li>Providing customer support</li>
            <li>Improving our website and services</li>
            <li>Personalizing your shopping experience</li>
            <li>Sending promotional emails (with your consent)</li>
            <li>Preventing fraud and ensuring security</li>
            <li>Complying with legal obligations</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold mt-8">4. Cookies</h2>
          <p>
            We use cookies and similar technologies to enhance your experience on our website. Cookies are small text
            files stored on your device that help us:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Remember your preferences and settings</li>
            <li>Keep you logged in to your account</li>
            <li>Analyze website traffic and usage patterns</li>
            <li>Provide personalized content and recommendations</li>
          </ul>
          <p className="mt-4">
            You can control cookies through your browser settings. However, disabling cookies may affect your ability to
            use certain features of our website.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold mt-8">5. Information Sharing</h2>
          <p>We do not sell your personal information to third parties. We may share your information with:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Service Providers:</strong> Paystack (payment processing), Courier Guy and Pudo (delivery),
              Cloudinary (image hosting)
            </li>
            <li>
              <strong>Legal Requirements:</strong> When required by law or to protect our rights
            </li>
            <li>
              <strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets
            </li>
          </ul>
          <p className="mt-4">
            All third-party service providers are required to protect your information and use it only for the purposes
            we specify.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold mt-8">6. Data Security</h2>
          <p>We implement appropriate technical and organizational measures to protect your personal information:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Secure Socket Layer (SSL) encryption for data transmission</li>
            <li>Encrypted password storage</li>
            <li>Regular security audits and updates</li>
            <li>Access controls and authentication</li>
            <li>Secure cloud storage with Supabase</li>
          </ul>
          <p className="mt-4">
            However, no method of transmission over the internet is 100% secure. While we strive to protect your
            information, we cannot guarantee absolute security.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold mt-8">7. Your Rights (POPIA Compliance)</h2>
          <p>Under the Protection of Personal Information Act, you have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Access:</strong> Request a copy of your personal information
            </li>
            <li>
              <strong>Correction:</strong> Update or correct inaccurate information
            </li>
            <li>
              <strong>Deletion:</strong> Request deletion of your personal information
            </li>
            <li>
              <strong>Objection:</strong> Object to processing of your information
            </li>
            <li>
              <strong>Portability:</strong> Request transfer of your data to another service
            </li>
            <li>
              <strong>Withdraw Consent:</strong> Opt-out of marketing communications
            </li>
          </ul>
          <p className="mt-4">To exercise these rights, please contact us at privacy@caarl.co.za</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold mt-8">8. Data Retention</h2>
          <p>We retain your personal information for as long as necessary to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide our services to you</li>
            <li>Comply with legal obligations (e.g., tax records for 5 years)</li>
            <li>Resolve disputes and enforce our agreements</li>
          </ul>
          <p className="mt-4">When your information is no longer needed, we securely delete or anonymize it.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold mt-8">9. Children's Privacy</h2>
          <p>
            Our website is not intended for children under 18 years of age. We do not knowingly collect personal
            information from children. If you believe we have collected information from a child, please contact us
            immediately.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold mt-8">10. International Transfers</h2>
          <p>
            Your information may be transferred to and stored on servers located outside South Africa. We ensure that
            appropriate safeguards are in place to protect your information in accordance with this Privacy Policy and
            applicable laws.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold mt-8">11. Changes to Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of significant changes by posting a
            notice on our website or sending you an email. Your continued use of our website after changes are posted
            constitutes acceptance of the updated policy.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold mt-8">12. Contact Us</h2>
          <p>
            If you have any questions, concerns, or requests regarding this Privacy Policy or your personal information,
            please contact us:
          </p>
          <ul className="list-none space-y-2">
            <li>Email: privacy@caarl.co.za</li>
            <li>Phone: +27 XX XXX XXXX</li>
            <li>Address: [Your Business Address]</li>
          </ul>
          <p className="mt-4">
            Information Officer: [Name]
            <br />
            Email: info.officer@caarl.co.za
          </p>
        </section>
      </div>
    </div>
  )
}
