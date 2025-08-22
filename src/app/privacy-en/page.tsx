export default function PrivacyPolicyEn() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-[#334269] space-y-6">
      {/* Back Button and Language Switcher */}
      <div className="flex justify-between items-center mb-4">
        <a 
          href="/" 
          className="text-blue-600 hover:text-blue-800 underline text-sm flex items-center"
        >
          ← Back to Home
        </a>
        <a 
          href="/privacy" 
          className="text-blue-600 hover:text-blue-800 underline text-sm"
        >
          Deutsch
        </a>
      </div>
      
      <h1 className="text-4xl font-bold text-center mb-8">Privacy Policy</h1>
      
      <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
        <p className="text-sm text-blue-800">
          <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US')}
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">1. Introduction</h2>
        <p>
          The protection of your personal data is important to us. This Privacy Policy 
          informs you about the nature, scope, and purpose of the processing of personal data 
          when using rudolpho-chat.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">2. Data Controller</h2>
        <p>
          Responsible for data processing is:
        </p>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p><strong>rudolpho-chat</strong></p>
          <p><strong>Marco Rudolph</strong></p>
          <p>No de Halloh 8a</p>
          <p>25591 Ottenbüttel</p>
          <p>Tel: 04893 9373110</p>
          <p>Email: MarcoRudolph09@proton.me</p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">3. Data Collected</h2>
        <p>We collect the following types of data:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Account Data:</strong> Email address, name (during registration)</li>
          <li><strong>Usage Data:</strong> Interactions with the service, created personas</li>
          <li><strong>Instagram Data:</strong> Messages and comments (only with your consent)</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">4. Purpose of Data Processing</h2>
        <p>Your data is processed for the following purposes:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Provision and improvement of the rudolpho-chat service</li>
          <li>Management of your account and personas</li>
          <li>Automation of your Instagram interactions</li>
          <li>Customer support and communication</li>
          <li>Analysis of service usage for improvement</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">5. Legal Basis</h2>
        <p>Processing is based on the following legal grounds:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Contract Fulfillment:</strong> For the provision of the service</li>
          <li><strong>Consent:</strong> For marketing communication and Instagram integration</li>
          <li><strong>Legitimate Interests:</strong> For service improvements and security</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">6. Data Sharing</h2>
        <p>
          We only share your data in the following cases:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>To service providers who support us in providing the service</li>
          <li>To Instagram (Meta) for API integration (only with your consent)</li>
          <li>When legally required or by official order</li>
          <li>To protect our rights and the security of other users</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">7. Data Security</h2>
        <p>
          We implement appropriate technical and organizational measures to 
          protect your data from unauthorized access, loss, or misuse.
        </p>
        <p>
          All data transmissions are encrypted (HTTPS/TLS). Your data is 
          stored in secure data centers.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">8. Your Rights</h2>
        <p>You have the following rights regarding your data:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Right of Access:</strong> Information about processed data</li>
          <li><strong>Right of Rectification:</strong> Correction of incorrect data</li>
          <li><strong>Right of Erasure:</strong> Removal of your data</li>
          <li><strong>Right of Restriction:</strong> Limitation of data processing</li>
          <li><strong>Data Portability:</strong> Export of your data</li>
          <li><strong>Right to Object:</strong> Against certain processing</li>
        </ul>
        
        <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
          <p className="text-blue-800">
            <strong>Data Deletion:</strong> You can delete your data at any time. 
            A detailed guide can be found on our{" "}
            <a href="/data-deletion" className="text-blue-600 hover:underline font-semibold">
              Data Deletion Page
            </a>.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">9. Cookies</h2>
        <p>
          We use cookies and similar technologies. Details can be found in our 
          <a href="/cookie-policy" className="text-blue-600 hover:underline"> Cookie Policy</a>.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">10. Storage Period</h2>
        <p>
          We only store your data for as long as necessary:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Account Data:</strong> Until cancellation of your account</li>
          <li><strong>Usage Data:</strong> 2 years after last activity</li>
          <li><strong>Instagram Data:</strong> Only during active connection</li>
          <li><strong>Log Data:</strong> 90 days for security purposes</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">11. Contact</h2>
        <p>
          For questions about data protection, you can reach us at:
        </p>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p><strong>Email:</strong> MarcoRudolph09@proton.me</p>
          <p><strong>Address:</strong> Marco Rudolph, No de Halloh 8a, 25591 Ottenbüttel</p>
          <p><strong>Phone:</strong> 04893 9373110</p>
        </div>
        <p>
          You also have the right to complain to the competent supervisory authority.
        </p>
      </section>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>Note:</strong> This Privacy Policy may be updated as needed. 
          Significant changes will be communicated to you by email.
        </p>
      </div>
    </div>
  );
}
