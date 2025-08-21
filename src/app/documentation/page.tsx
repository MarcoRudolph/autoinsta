'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/hooks/useI18n';

export default function DocumentationPage() {
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'de'>('de');
  const { t } = useI18n(selectedLanguage);

  const documentation = {
    en: {
      title: 'Documentation',
      subtitle: 'Complete guide to setting up and using your AI-Chatbot',
      languageLabel: 'Language:',
      sections: [
        {
          title: 'Getting Started - Login',
          content: 'Learn how to create an account and access your dashboard using Facebook login, email registration, or existing account login.'
        },
        {
          title: 'Creating Your First AI-Chatbot',
          content: 'Step-by-step instructions for creating your first AI-Chatbot, defining personality traits, and customizing response behavior.'
        },
        {
          title: 'Connecting Instagram',
          content: 'How to connect your Instagram account, authorize access, and verify the connection for seamless integration.'
        },
        {
          title: 'Configuring Bot Settings',
          content: 'Configure response timing, operating hours, response frequency, and content filtering to optimize your AI-Chatbot performance.'
        },
        {
          title: 'Setting Up Product Links',
          content: 'Add your products, configure promotion strategies, and set up purchase tracking to drive sales through your AI-Chatbot.'
        },
        {
          title: 'Activating Your AI-Chatbot',
          content: 'Review your setup, test in test mode, and go live with your AI-Chatbot while monitoring performance metrics.'
        },
        {
          title: 'Managing Multiple AI-Chatbots',
          content: 'Create additional AI-Chatbots, switch between them, and use different personalities for various audiences and purposes.'
        },
        {
          title: 'Troubleshooting',
          content: 'Common issues and solutions for Instagram connection problems, bot response issues, and product link problems.'
        }
      ]
    },
    de: {
      title: 'Dokumentation',
      subtitle: 'Vollständige Anleitung zur Einrichtung und Nutzung Ihres AI-Chatbots',
      languageLabel: 'Sprache:',
      sections: [
                 {
           title: 'Anmeldung',
           content: 'Mit Klick auf Jetzt ausprobieren gelangen Sie zu unseren Login Möglichkeiten. Sie können sich mit Ihrem Google- oder Facebookaccount anmelden. Natürlich können Sie sich auch mit E-Mail und Passwort registrieren.'
         },
                 {
           title: 'Chatbot erstellen',
           content: 'Im Dashboard angekommen, sehen Sie bereits die Felder für die Persönlichkeitserstellung. Geben Sie ihrem Chatbot einen Namen und fügen Sie je nach Zielgruppe Content zu den einzelnen Eigenschaften hinzu. Dieser wird während des Gesprächs herangezogen, wenn die Situation es zulässt.'
         },
        {
          title: 'Instagram verbinden',
          content: 'Wie Sie Ihr Instagram-Konto verbinden, Zugriff autorisieren und die Verbindung für nahtlose Integration verifizieren.'
        },
                 {
           title: 'Bot-Einstellungen konfigurieren',
           content: 'Unter der Auswahl ihrer Chatbots können Sie Einstellungen tätigen wie System prompts, Antwortzeiten und Memory-Settings'
         },
                 {
           title: 'Produkt-Links einrichten',
           content: 'Fügen Sie Ihre Produkte hinzu, die ihr Chatbot während des Gesprächs vorschlägt, um Verkäufe zu fördern.'
         },
                 {
           title: 'AI-Chatbot aktivieren',
           content: 'Überprüfen Sie Ihr Setup, indem Sie einen AI-Chatbot aktivieren und dessen Verhalten testen. Sie können zunächst wahlweise nur Direct Messages aktivieren und Kommentare deaktiviert lassen – oder umgekehrt –, um die Funktionen schrittweise zu testen.'
         },
        {
          title: 'Mehrere AI-Chatbots verwalten',
          content: 'Erstellen Sie zusätzliche AI-Chatbots, wechseln Sie zwischen ihnen und verwenden Sie verschiedene Persönlichkeiten für verschiedene Zielgruppen und Zwecke.'
        },
        {
          title: 'Fehlerbehebung',
          content: 'Häufige Probleme und Lösungen für Instagram-Verbindungsprobleme, Bot-Antwortprobleme und Produkt-Link-Probleme.'
        }
      ]
    }
  };

  const currentDoc = documentation[selectedLanguage];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155]">
      {/* Header */}
      <div className="bg-[#15192a] border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-sky-700 to-cyan-500 bg-clip-text text-transparent">
              rudolpho-chat
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-[#a3bffa] text-sm">{currentDoc.languageLabel}</span>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value as 'en' | 'de')}
                className="bg-[#1e293b] text-[#a3bffa] border border-gray-600 rounded px-3 py-1 text-sm focus:outline-none focus:border-[#f3aacb]"
              >
                <option value="de">Deutsch</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4" style={{
            fontFamily: '"Inter", sans-serif',
            letterSpacing: '-0.04em',
            lineHeight: '1.2em'
          }}>
            {currentDoc.title}
          </h1>
          <p className="text-xl text-[#a3bffa] max-w-3xl mx-auto">
            {currentDoc.subtitle}
          </p>
        </div>

        {/* Documentation Overview */}
        <div className="bg-[#1e293b] rounded-lg p-8 mb-12 border border-gray-700">
          {/* Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentDoc.sections.map((section, index) => (
              <div key={index} className="bg-[#15192a] rounded-lg p-6 border border-gray-600 hover:border-[#f3aacb] transition-colors">
                <h3 className="text-lg font-semibold text-white mb-3" style={{
                  fontFamily: '"Inter", sans-serif',
                  letterSpacing: '-0.04em',
                  lineHeight: '1.2em'
                }}>
                  {section.title}
                </h3>
                <p className="text-[#a3bffa] text-sm">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Download Links */}
        <div className="bg-[#1e293b] rounded-lg p-8 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6" style={{
            fontFamily: '"Inter", sans-serif',
            letterSpacing: '-0.04em',
            lineHeight: '1.2em'
          }}>
            {selectedLanguage === 'de' ? 'Vollständige Dokumentation herunterladen' : 'Download Complete Documentation'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#15192a] rounded-lg p-6 border border-gray-600">
              <h3 className="text-lg font-semibold text-white mb-3">
                {selectedLanguage === 'de' ? 'Deutsche Version' : 'German Version'}
              </h3>
              <p className="text-[#a3bffa] text-sm mb-4">
                {selectedLanguage === 'de' ? 'Vollständiges Benutzerhandbuch in deutscher Sprache' : 'Complete user guide in German'}
              </p>
              <a
                href="/docs/benutzerhandbuch.md"
                download
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-sky-700 to-cyan-500 text-white rounded-lg hover:from-sky-600 hover:to-cyan-400 transition-all duration-200 text-sm font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {selectedLanguage === 'de' ? 'PDF herunterladen' : 'Download PDF'}
              </a>
            </div>
            <div className="bg-[#15192a] rounded-lg p-6 border border-gray-600">
              <h3 className="text-lg font-semibold text-white mb-3">
                {selectedLanguage === 'de' ? 'English Version' : 'English Version'}
              </h3>
              <p className="text-[#a3bffa] text-sm mb-4">
                {selectedLanguage === 'de' ? 'Complete user guide in English' : 'Complete user guide in English'}
              </p>
              <a
                href="/docs/user-guide.md"
                download
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-sky-700 to-cyan-500 text-white rounded-lg hover:from-sky-600 hover:to-cyan-400 transition-all duration-200 text-sm font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {selectedLanguage === 'de' ? 'PDF herunterladen' : 'Download PDF'}
              </a>
            </div>
          </div>
        </div>

        {/* Quick Start Guide */}
        <div className="bg-[#1e293b] rounded-lg p-8 mt-8 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6" style={{
            fontFamily: '"Inter", sans-serif',
            letterSpacing: '-0.04em',
            lineHeight: '1.2em'
          }}>
            {selectedLanguage === 'de' ? 'Schnellstart-Anleitung' : 'Quick Start Guide'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-sky-700 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">1</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {selectedLanguage === 'de' ? 'Anmelden' : 'Sign Up'}
              </h3>
              <p className="text-[#a3bffa] text-sm">
                {selectedLanguage === 'de' ? 'Erstellen Sie ein Konto über Google, Facebook oder E-Mail' : 'Create an account via Google, Facebook or email'}
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-sky-700 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">2</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {selectedLanguage === 'de' ? 'AI-Chatbot erstellen' : 'Create AI-Chatbot'}
              </h3>
              <p className="text-[#a3bffa] text-sm">
                {selectedLanguage === 'de' ? 'Definieren Sie Persönlichkeit und Antwortverhalten' : 'Define personality and response behavior'}
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-sky-700 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">3</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {selectedLanguage === 'de' ? 'Instagram verbinden' : 'Connect Instagram'}
              </h3>
              <p className="text-[#a3bffa] text-sm">
                {selectedLanguage === 'de' ? 'Verbinden Sie Ihr Instagram-Konto und aktivieren Sie den Bot' : 'Connect your Instagram account and activate the bot'}
              </p>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-sky-700 to-cyan-500 text-white rounded-lg hover:from-sky-600 hover:to-cyan-400 transition-all duration-200 font-medium"
            >
              {selectedLanguage === 'de' ? 'Jetzt loslegen' : 'Get Started'}
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


