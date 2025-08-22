export default function DataDeletionPageEn() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#15192a] via-[#232946] to-[#334269] text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Navigation */}
          <div className="flex justify-between items-center mb-4">
            <a
              href="/"
              className="text-blue-400 hover:text-blue-300 underline text-sm flex items-center"
            >
              ← Back to Home
            </a>
            <a
              href="/data-deletion"
              className="text-blue-400 hover:text-blue-300 underline text-sm"
            >
              Deutsch
            </a>
          </div>

          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-[#f3aacb] via-[#a3bffa] to-[#e6ebfc] bg-clip-text text-transparent">
              Data Deletion
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Here you can learn how to delete your personal data from our system
            </p>
          </div>

          {/* Main Content */}
          <div className="bg-[#15192a]/80 backdrop-blur-lg rounded-xl shadow-2xl p-8 md:p-12 border border-white/10">
            
            {/* Step 1 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-[#f3aacb] bg-[#232946]/70 flex items-center justify-center text-white font-extrabold text-2xl md:text-3xl shadow-lg">
                  1
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-[#f3aacb]">
                  Open Account
                </h2>
              </div>
              <div className="ml-20 md:ml-24">
                <p className="text-lg text-gray-300 mb-4">
                  Click on your account name or profile picture in the top right of the navigation bar.
                </p>
                <div className="bg-[#232946]/50 p-4 rounded-lg border border-[#f3aacb]/20">
                  <p className="text-sm text-gray-400">
                    <strong>Note:</strong> You must be logged into your account to see this option.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-[#f3aacb] bg-[#232946]/70 flex items-center justify-center text-white font-extrabold text-2xl md:text-3xl shadow-lg">
                  2
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-[#f3aacb]">
                  Open Settings
                </h2>
              </div>
              <div className="ml-20 md:ml-24">
                <p className="text-lg text-gray-300 mb-4">
                  In the dropdown menu, click on "Settings".
                </p>
                <div className="bg-[#232946]/50 p-4 rounded-lg border border-[#f3aacb]/20">
                  <p className="text-sm text-gray-400">
                    <strong>Alternative:</strong> You can also directly access the "/settings" link in the URL bar.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-[#f3aacb] bg-[#232946]/70 flex items-center justify-center text-white font-extrabold text-2xl md:text-3xl shadow-lg">
                  3
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-[#f3aacb]">
                  Find "Delete User Data"
                </h2>
              </div>
              <div className="ml-20 md:ml-24">
                <p className="text-lg text-gray-300 mb-4">
                  Scroll down in the settings until you find the "Account" or "Privacy" section.
                </p>
                <p className="text-lg text-gray-300 mb-4">
                  There you will find the "Delete User Data" button - this is usually colored red to indicate its importance.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-[#f3aacb] bg-[#232946]/70 flex items-center justify-center text-white font-extrabold text-2xl md:text-3xl shadow-lg">
                  4
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-[#f3aacb]">
                  Confirm Deletion
                </h2>
              </div>
              <div className="ml-20 md:ml-24">
                <p className="text-lg text-gray-300 mb-4">
                  After clicking "Delete User Data", a confirmation dialog will open.
                </p>
                <p className="text-lg text-gray-300 mb-4">
                  Type "DELETE" to confirm and click "Permanently Delete".
                </p>
                <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg">
                  <p className="text-sm text-red-300">
                    <strong>⚠️ Important:</strong> This action cannot be undone. All your data will be permanently deleted.
                  </p>
                </div>
              </div>
            </div>

            {/* What Gets Deleted */}
            <div className="bg-[#232946]/50 p-6 rounded-lg border border-[#f3aacb]/20">
              <h3 className="text-xl font-bold text-[#f3aacb] mb-4">
                What gets deleted?
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  All personal data (name, email, profile information)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  All created AI chatbots and personas
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  Chat histories and conversations
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  Subscription data and payment information
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  All settings and configurations
                </li>
              </ul>
            </div>

            {/* Alternative Methods */}
            <div className="mt-12 bg-[#232946]/50 p-6 rounded-lg border border-[#f3aacb]/20">
              <h3 className="text-xl font-bold text-[#f3aacb] mb-4">
                Alternative Contact Methods
              </h3>
              <p className="text-gray-300 mb-4">
                If you have problems deleting your data or need further assistance, you can also contact us directly:
              </p>
              <div className="bg-[#15192a]/50 p-4 rounded-lg">
                <h4 className="font-semibold text-[#f3aacb] mb-2">Email</h4>
                <p className="text-gray-300 text-sm">info@rudolpho-chat.de</p>
              </div>
            </div>

            {/* Back to Dashboard */}
            <div className="mt-12 text-center">
              <a
                href="/dashboard"
                className="inline-block bg-[#f3aacb] text-[#334269] font-bold px-8 py-3 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Back to Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
