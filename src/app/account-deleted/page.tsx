'use client';

import Link from 'next/link';

export default function AccountDeletedPage() {
  return (
    <div className="min-h-screen p-4 md:p-6" style={{ background: 'linear-gradient(135deg, #1b1f2b, #2b2e47, #313c5c)' }}>
      <div className="max-w-2xl mx-auto text-center">
        {/* Success Icon */}
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-green-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-[#15192a]/80 backdrop-blur-lg rounded-xl shadow-2xl p-8 text-white mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4 text-green-400">
            Konto erfolgreich gelöscht
          </h1>
          <p className="text-lg text-gray-300 mb-6">
            Ihr Konto und alle zugehörigen Daten wurden erfolgreich gelöscht.
          </p>
          
          <div className="bg-[#1a1f2e] rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-[#f3aacb]">Was passiert ist:</h2>
            <ul className="text-left text-gray-300 space-y-2">
              <li className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Alle Ihre Personas wurden gelöscht
              </li>
              <li className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Ihre Einstellungen wurden entfernt
              </li>
              <li className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Instagram-Verbindungen wurden getrennt
              </li>
              <li className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Alle gespeicherten Daten wurden dauerhaft gelöscht
              </li>
            </ul>
          </div>

          <p className="text-gray-300 mb-6">
            Vielen Dank, dass Sie rudolpho-chat genutzt haben. Falls Sie sich in Zukunft wieder anmelden möchten, können Sie jederzeit ein neues Konto erstellen.
          </p>
        </div>

        {/* Contact Information */}
        <div className="bg-[#15192a]/80 backdrop-blur-lg rounded-xl shadow-2xl p-6 text-white mb-8">
          <h3 className="text-xl font-bold mb-4 text-[#f3aacb]">Haben Sie Fragen?</h3>
          <p className="text-gray-300 mb-4">
            Falls Sie Fragen haben oder Hilfe benötigen, kontaktieren Sie uns gerne:
          </p>
          <div className="bg-[#1a1f2e] rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-2">
              <strong>Marco Rudolph</strong><br />
              No de Halloh 8a<br />
              25591 Ottenbüttel<br />
              Tel: 04893 9373110<br />
              E-Mail: MarcoRudolph09@proton.me
            </p>

          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block w-full px-6 py-3 bg-[#f3aacb] text-[#334269] font-semibold rounded-lg hover:bg-[#e6ebfc] transition-colors"
          >
            Zur Startseite
          </Link>
          
          <Link
            href="/"
            className="inline-block w-full px-6 py-3 bg-transparent border border-[#f3aacb] text-[#f3aacb] font-semibold rounded-lg hover:bg-[#f3aacb] hover:text-[#334269] transition-colors"
          >
            Neues Konto erstellen
          </Link>
        </div>
      </div>
    </div>
  );
}
