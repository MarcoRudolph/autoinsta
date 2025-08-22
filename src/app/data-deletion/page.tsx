export default function DataDeletionPage() {
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
              ← Zurück zur Startseite
            </a>
            <a
              href="/data-deletion-en"
              className="text-blue-400 hover:text-blue-300 underline text-sm"
            >
              English
            </a>
          </div>

          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-[#f3aacb] via-[#a3bffa] to-[#e6ebfc] bg-clip-text text-transparent">
              Datenlöschung
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Hier erfahren Sie, wie Sie Ihre persönlichen Daten aus unserem System löschen können
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
                  Account öffnen
                </h2>
              </div>
              <div className="ml-20 md:ml-24">
                <p className="text-lg text-gray-300 mb-4">
                  Klicken Sie oben rechts in der Navigationsleiste auf Ihren Account-Namen oder das Profilbild.
                </p>
                <div className="bg-[#232946]/50 p-4 rounded-lg border border-[#f3aacb]/20">
                  <p className="text-sm text-gray-400">
                    <strong>Hinweis:</strong> Sie müssen in Ihrem Account angemeldet sein, um diese Option zu sehen.
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
                  Settings öffnen
                </h2>
              </div>
              <div className="ml-20 md:ml-24">
                <p className="text-lg text-gray-300 mb-4">
                  Im Dropdown-Menü klicken Sie auf "Settings" oder "Einstellungen".
                </p>
                <div className="bg-[#232946]/50 p-4 rounded-lg border border-[#f3aacb]/20">
                  <p className="text-sm text-gray-400">
                    <strong>Alternative:</strong> Sie können auch direkt auf den Link "/settings" in der URL-Leiste zugreifen.
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
                  "Userdaten löschen" finden
                </h2>
              </div>
              <div className="ml-20 md:ml-24">
                <p className="text-lg text-gray-300 mb-4">
                  Scrollen Sie in den Settings nach unten, bis Sie den Abschnitt "Account" oder "Datenschutz" finden.
                </p>
                <p className="text-lg text-gray-300 mb-4">
                  Dort finden Sie den Button "Userdaten löschen" - dieser ist normalerweise rot eingefärbt, um auf die Wichtigkeit hinzuweisen.
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
                  Löschung bestätigen
                </h2>
              </div>
              <div className="ml-20 md:ml-24">
                <p className="text-lg text-gray-300 mb-4">
                  Nach dem Klick auf "Userdaten löschen" öffnet sich ein Bestätigungsdialog.
                </p>
                <p className="text-lg text-gray-300 mb-4">
                  Geben Sie zur Bestätigung "LÖSCHEN" ein und klicken Sie auf "Endgültig löschen".
                </p>
                <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg">
                  <p className="text-sm text-red-300">
                    <strong>⚠️ Wichtig:</strong> Diese Aktion kann nicht rückgängig gemacht werden. Alle Ihre Daten werden permanent gelöscht.
                  </p>
                </div>
              </div>
            </div>

            {/* What Gets Deleted */}
            <div className="bg-[#232946]/50 p-6 rounded-lg border border-[#f3aacb]/20">
              <h3 className="text-xl font-bold text-[#f3aacb] mb-4">
                Was wird gelöscht?
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  Alle persönlichen Daten (Name, E-Mail, Profilinformationen)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  Alle erstellten AI-Chatbots und Personas
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  Chat-Verläufe und Konversationen
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  Abonnement-Daten und Zahlungsinformationen
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  Alle Einstellungen und Konfigurationen
                </li>
              </ul>
            </div>

            {/* Alternative Methods */}
            <div className="mt-12 bg-[#232946]/50 p-6 rounded-lg border border-[#f3aacb]/20">
              <h3 className="text-xl font-bold text-[#f3aacb] mb-4">
                Alternative Kontaktmöglichkeiten
              </h3>
              <p className="text-gray-300 mb-4">
                Falls Sie Probleme beim Löschen Ihrer Daten haben oder weitere Unterstützung benötigen, können Sie uns auch direkt kontaktieren:
              </p>
              <div className="bg-[#15192a]/50 p-4 rounded-lg">
                <h4 className="font-semibold text-[#f3aacb] mb-2">E-Mail</h4>
                <p className="text-gray-300 text-sm">info@rudolpho-chat.de</p>
              </div>
            </div>

            {/* Back to Dashboard */}
            <div className="mt-12 text-center">
              <a
                href="/dashboard"
                className="inline-block bg-[#f3aacb] text-[#334269] font-bold px-8 py-3 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Zurück zum Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

