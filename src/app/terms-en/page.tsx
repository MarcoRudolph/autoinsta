export default function TermsOfServiceEn() {

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
          href="/terms" 
          className="text-blue-600 hover:text-blue-800 underline text-sm"
        >
          Deutsch
        </a>
      </div>
      
      <h1 className="text-4xl font-bold text-center mb-8">Terms of Use</h1>
      
      <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
        <p className="text-sm text-blue-800">
          <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US')}
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">1. Introduction</h2>
        <p>Welcome to rudolpho-chat! These Terms of Use govern the use of our AI-powered automation service for Instagram interactions. By using our service, you agree to these terms.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">2. Description of Our Service</h2>
        
        <h3 className="text-xl font-semibold">2.1 How It Works</h3>
        <p>rudolpho-chat is an AI-powered platform that allows you to create automated responses to Instagram direct messages and comments. Our service works as follows:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Persona Creation: You create a digital personality with specific characteristics, communication style, and response patterns</li>
          <li>AI Integration: Our artificial intelligence automatically generates appropriate responses based on your defined persona</li>
          <li>Instagram Automation: The service can automatically respond to incoming messages and comments</li>
          <li>Customizable Settings: You maintain full control over all automated responses</li>
        </ul>

        <h3 className="text-xl font-semibold">2.2 Interaction with Meta Platforms</h3>
        <p>Our service interacts with Instagram (a Meta platform) through official APIs:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Data Retrieval: We only retrieve data necessary for providing our service (e.g., incoming messages, comments)</li>
          <li>Data Transmission: Responses are sent to recipients via the Instagram API</li>
          <li>Data Security: All data transmissions are encrypted and conducted over secure connections</li>
          <li>Consent Requirement: We only access your Instagram data when you have explicitly approved it</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">3. Relationship with Meta Platforms, Inc.</h2>
        
        <h3 className="text-xl font-semibold">3.1 Independence from Meta</h3>
        <p>Important Notice: rudolpho-chat is a completely independent service and is neither offered, sponsored, nor operated by Meta Platforms, Inc. We are an independent company with our own business models and technologies.</p>

        <h3 className="text-xl font-semibold">3.2 Disclaimer Regarding Meta</h3>
        <p>Meta Platforms, Inc. is not responsible for:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>The operation, functionality, or availability of our service</li>
          <li>The content of responses generated through our service</li>
          <li>Technical issues or failures of our system</li>
          <li>Our business practices or obligations to users</li>
          <li>Privacy or security aspects of our service</li>
        </ul>
        <p>We act as an independent service provider and are solely responsible for all aspects of our service.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">4. Terms of Use</h2>
        
        <h3 className="text-xl font-semibold">4.1 Permitted Use</h3>
        <p>You may only use our service for lawful purposes:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Automating your own Instagram interactions</li>
          <li>Creating personas for your personal or business purposes</li>
          <li>Use in compliance with Instagram's Terms of Use</li>
        </ul>

        <h3 className="text-xl font-semibold">4.2 Prohibited Use</h3>
        <p>The following uses are not permitted:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Violation of Instagram's Terms of Use or Community Guidelines</li>
          <li>Spam, harassment, or abusive behavior</li>
          <li>Use for illegal or harmful purposes</li>
          <li>Attempting to compromise the security of our system</li>
          <li>Sharing your account with third parties</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">5. Accounts and Subscriptions</h2>
        
        <h3 className="text-xl font-semibold">5.1 Free Usage</h3>
        <p>We offer a free plan with limited features:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>20 automated messages per month</li>
          <li>Basic persona creation</li>
          <li>Standard response templates</li>
        </ul>

        <h3 className="text-xl font-semibold">5.2 Pro Subscription</h3>
        <p>Our Pro plan offers enhanced features:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Unlimited automated messages</li>
          <li>Enhanced AI responses</li>
          <li>Priority support</li>
          <li>Custom persona creation</li>
        </ul>
        <p><strong>Price: €10 per month, cancelable at any time</strong></p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">6. Privacy and Security</h2>
        <p>
          The protection of your data is our highest priority. All details about data processing can be found in our{" "}
          <a href="/privacy-new" className="text-blue-600 hover:underline">Privacy Policy</a>.
        </p>
        <p>We implement comprehensive security measures to protect your data and ensure compliance with all applicable data protection regulations.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">7. Liability and Warranty</h2>
        <p>Our service is provided 'as is'. We make no warranty for uninterrupted availability or error-free functionality.</p>
        <p>Our liability is limited to the amount you have paid for our service in the last 12 months.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">8. Changes to Terms of Use</h2>
        <p>We reserve the right to change these Terms of Use as needed. Significant changes will be communicated to you by email. Continued use of our service after changes constitutes acceptance of the new terms.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">9. Termination</h2>
        <p>You can cancel your account at any time. Upon cancellation, all your data will be deleted within 30 days, unless legal retention periods apply.</p>
        <p>We reserve the right to block or delete accounts that violate these Terms of Use.</p>
        
        <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
          <p className="text-blue-800">
            <strong>Data Deletion:</strong> You can also delete your data yourself before cancellation. A detailed guide can be found on our{" "}
            <a href="/data-deletion" className="text-blue-600 hover:underline font-semibold">
              Data Deletion Page
            </a>.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">10. Contact</h2>
        <p>For questions about these Terms of Use, you can reach us at:</p>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p><strong>Email:</strong> MarcoRudolph09@proton.me</p>
          <p><strong>Address:</strong> Marco Rudolph, No de Halloh 8a, 25591 Ottenbüttel</p>
          <p><strong>Phone:</strong> 04893 9373110</p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">11. Legal Basis</h2>
        <p>These Terms of Use are subject to German law. The place of jurisdiction is, to the extent legally permissible, the registered office of our company.</p>
      </section>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>Note: These Terms of Use may be updated as needed. Significant changes will be communicated to you by email.</strong>
        </p>
      </div>
    </div>
  );
}
