'use client';

import React from 'react';
import Link from 'next/link';

export default function KontoLoeschenPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#15192a] via-[#232946] to-[#334269] text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#f3aacb] via-[#a3bffa] to-[#e6ebfc] bg-clip-text text-transparent">
            Anleitung zum Löschen des Kontos
          </h1>
          <p className="text-xl text-gray-300">
            So löschen Sie Ihr AI-Chatbot-Konto und alle Daten dauerhaft
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-[#15192a]/80 backdrop-blur-lg rounded-xl shadow-2xl p-8 mb-8">
          <div className="prose prose-invert max-w-none">
            <h2 className="text-2xl font-bold mb-6 text-[#f3aacb]">
              So löschen Sie Ihr Konto
            </h2>
            
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="bg-[#232946]/60 rounded-lg p-6 border border-[#334269]/30">
                <h3 className="text-xl font-semibold mb-3 text-[#a3bffa]">
                  Schritt 1: Zugriff auf Ihre Kontoeinstellungen
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-300">
                  <li>Melden Sie sich bei Ihrem AI-Chatbot-Konto auf <span className="text-[#f3aacb]">rudolpho-chat.de</span> an</li>
                  <li>Navigieren Sie zum Dashboard</li>
                  <li>Klicken Sie auf Ihr Profilbild in der oberen rechten Ecke</li>
                                     <li>Wählen Sie &quot;Einstellungen&quot; aus dem Dropdown-Menü</li>
                </ol>
              </div>

              {/* Step 2 */}
              <div className="bg-[#232946]/60 rounded-lg p-6 border border-[#334269]/30">
                <h3 className="text-xl font-semibold mb-3 text-[#a3bffa]">
                  Schritt 2: Konto-Löschung finden
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-300">
                                     <li>Scrollen Sie auf der Einstellungsseite nach unten zu &quot;Kontoverwaltung&quot;</li>
                   <li>Suchen Sie nach dem Abschnitt &quot;Konto löschen&quot; oder &quot;Konto dauerhaft löschen&quot;</li>
                   <li>Klicken Sie auf den &quot;Konto löschen&quot; Button</li>
                </ol>
              </div>

              {/* Step 3 */}
              <div className="bg-[#232946]/60 rounded-lg p-6 border border-[#334269]/30">
                <h3 className="text-xl font-semibold mb-3 text-[#a3bffa]">
                  Schritt 3: Löschung bestätigen
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-300">
                  <li>Sie werden aufgefordert, Ihr Passwort zur Sicherheitsüberprüfung einzugeben</li>
                  <li>Lesen Sie die Löschwarnung sorgfältig - diese Aktion ist unwiderruflich</li>
                                     <li>Geben Sie &quot;LÖSCHEN&quot; in das Bestätigungsfeld ein</li>
                   <li>Klicken Sie auf &quot;Mein Konto dauerhaft löschen&quot;</li>
                </ol>
              </div>

              {/* Step 4 */}
              <div className="bg-[#232946]/60 rounded-lg p-6 border border-[#334269]/30">
                <h3 className="text-xl font-semibold mb-3 text-[#a3bffa]">
                  Schritt 4: Konto-Löschungsprozess
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-300">
                  <li>Ihr Konto wird sofort deaktiviert</li>
                  <li>Alle Ihre Daten werden innerhalb von 30 Tagen dauerhaft gelöscht</li>
                  <li>Sie erhalten eine Bestätigungs-E-Mail</li>
                  <li>Nach 30 Tagen können Ihre Daten nicht mehr wiederhergestellt werden</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* What Gets Deleted */}
        <div className="bg-[#15192a]/80 backdrop-blur-lg rounded-xl shadow-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-[#f3aacb]">
            Was wird gelöscht
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#a3bffa]">Kontodaten</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>Ihre Profilinformationen</li>
                <li>E-Mail-Adresse und Anmeldedaten</li>
                <li>Kontoeinstellungen und Präferenzen</li>
                <li>Abonnement- und Rechnungsinformationen</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#a3bffa]">AI-Chatbot-Daten</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>Alle erstellten AI-Chatbots und Personas</li>
                <li>Chatverlauf und Gespräche</li>
                <li>Instagram-Verbindungseinstellungen</li>
                <li>Produktlinks und Konfigurationen</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Important Information */}
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-red-400">
            ⚠️ Wichtige Informationen
          </h2>
          <div className="space-y-4 text-gray-300">
            <p>
              <strong className="text-red-400">Das Löschen des Kontos ist dauerhaft und unwiderruflich.</strong> 
              Sobald Sie Ihr Konto löschen:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Verlieren Sie den Zugriff auf alle Ihre AI-Chatbots und Daten</li>
              <li>Ihre Instagram-Verbindungen werden dauerhaft entfernt</li>
              <li>Alle Abonnement-Zahlungen werden gekündigt</li>
              <li>Sie können Ihr Konto nach 30 Tagen nicht mehr wiederherstellen</li>
            </ul>
            <p className="text-yellow-400">
              <strong>Hinweis:</strong> Wenn Sie ein aktives Abonnement haben, sollten Sie es vor dem Löschen Ihres Kontos kündigen, um zukünftige Gebühren zu vermeiden.
            </p>
          </div>
        </div>

        {/* Alternative Options */}
        <div className="bg-[#15192a]/80 backdrop-blur-lg rounded-xl shadow-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-[#f3aacb]">
            Alternative Optionen
          </h2>
          <div className="space-y-4 text-gray-300">
            <p>
              Bevor Sie Ihr Konto löschen, sollten Sie diese Alternativen in Betracht ziehen:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Konto deaktivieren:</strong> Deaktivieren Sie Ihr Konto vorübergehend anstatt es dauerhaft zu löschen</li>
              <li><strong>Daten exportieren:</strong> Laden Sie Ihre AI-Chatbots und Daten vor der Löschung herunter</li>
              <li><strong>Support kontaktieren:</strong> Wenn Sie Probleme haben, kann unser Support-Team helfen</li>
              <li><strong>Einstellungen ändern:</strong> Passen Sie Datenschutzeinstellungen an oder entfernen Sie bestimmte Daten</li>
            </ul>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-[#15192a]/80 backdrop-blur-lg rounded-xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-[#f3aacb]">
            Brauchen Sie Hilfe?
          </h2>
          <div className="space-y-4 text-gray-300">
            <p>
              Wenn Sie Hilfe beim Löschen Ihres Kontos benötigen oder Fragen haben, kontaktieren Sie uns:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-[#a3bffa] mb-2">E-Mail-Support</h3>
                <p>marcorudolph09@proton.me</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#a3bffa] mb-2">Antwortzeit</h3>
                <p>Innerhalb von 24-48 Stunden</p>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link 
            href="/"
            className="inline-block bg-[#f3aacb] text-[#334269] font-bold px-8 py-3 rounded-lg hover:bg-[#e6a3c4] transition-colors"
          >
            Zurück zur Startseite
          </Link>
        </div>
      </div>
    </div>
  );
}
