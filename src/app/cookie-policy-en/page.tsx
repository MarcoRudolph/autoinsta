export const metadata = {
  title: "Cookie Policy",
};

export default function CookiePolicyEn() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 text-[#334269] space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
        <a
          href="/"
          className="text-blue-600 hover:text-blue-800 underline text-sm flex items-center"
        >
          ← Back to Home
        </a>
        <div className="flex flex-wrap gap-2 text-sm">
          <a href="/cookie-policy" className="text-blue-600 hover:underline">Deutsch</a>
          <span className="text-gray-400">|</span>
          <span className="text-gray-500">English</span>
          <span className="text-gray-400">|</span>
          <a href="/cookie-policy-fr" className="text-blue-600 hover:underline">Français</a>
          <span className="text-gray-400">|</span>
          <a href="/cookie-policy-es" className="text-blue-600 hover:underline">Español</a>
          <span className="text-gray-400">|</span>
          <a href="/cookie-policy-it" className="text-blue-600 hover:underline">Italiano</a>
          <span className="text-gray-400">|</span>
          <a href="/cookie-policy-pt" className="text-blue-600 hover:underline">Português</a>
        </div>
      </div>

      <h1 className="text-3xl font-bold">Cookie Policy</h1>
      <p>
        This application uses Supabase Auth for sign-in via Google,
        Facebook, and Magic Links. The settings you make in the dashboard
        are stored in a database and can be linked to your Instagram
        account to automatically respond to direct messages and comments.
      </p>
      <p>We use the following types of cookies:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Functional cookies</strong> – necessary for the site to
          function properly.
        </li>
        <li>
          <strong>Analytical cookies</strong> – help us understand how the
          site is used.
        </li>
        <li>
          <strong>Marketing cookies</strong> – used to show you relevant
          offers.
        </li>
      </ul>
      <p>
        Your choices are stored in your browser&apos;s Local Storage. We also
        keep a local log of when and with which options you agreed or
        declined. This log is not transmitted to the server.
      </p>
      <p>
        You can delete your decision at any time by clearing your
        browser&apos;s Local Storage. On your next visit, the banner will
        appear again.
      </p>

      <section className="space-y-4 mt-8">
        <h2 className="text-2xl font-semibold">Contact</h2>
        <p>For questions about our cookie policy, you can reach us at:</p>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p>
            <strong>Email:</strong> MarcoRudolph09@proton.me
          </p>
          <p>
            <strong>Address:</strong> Marco Rudolph, No de Halloh 8a,
            25591 Ottenbüttel
          </p>
          <p>
            <strong>Phone:</strong> 04893 9373110
          </p>
        </div>
      </section>
    </div>
  );
}
