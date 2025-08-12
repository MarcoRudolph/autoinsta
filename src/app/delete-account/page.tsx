'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/auth/supabaseClient.client';
import Link from 'next/link';

export default function DeleteAccountPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [showFinalConfirmation, setShowFinalConfirmation] = useState(false);

  const handleDeleteAccount = async () => {
    if (confirmation !== 'LÖSCHEN') {
      alert('Bitte geben Sie "LÖSCHEN" ein, um zu bestätigen, dass Sie Ihr Konto löschen möchten.');
      return;
    }

    setShowFinalConfirmation(true);
  };

  const handleFinalDelete = async () => {
    try {
      setLoading(true);
      
      // Hier würde die tatsächliche Löschung der Daten erfolgen
      // Für jetzt löschen wir nur die Session
      await supabase.auth.signOut();
      localStorage.clear();
      
      // Weiterleitung zur Bestätigungsseite
      router.push('/account-deleted');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Fehler beim Löschen des Kontos. Bitte kontaktieren Sie den Support.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ background: 'linear-gradient(135deg, #1b1f2b, #2b2e47, #313c5c)' }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Konto löschen
          </h1>
          <p className="text-lg text-gray-300">
            Diese Aktion kann nicht rückgängig gemacht werden
          </p>
        </div>

        {/* Warning Section */}
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 mb-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <h2 className="text-xl font-bold text-red-400">Wichtiger Hinweis</h2>
          </div>
          <p className="text-red-200 mb-4">
            Das Löschen Ihres Kontos führt zu folgenden Konsequenzen:
          </p>
          <ul className="list-disc list-inside text-red-200 space-y-2">
            <li>Alle Ihre gespeicherten Personas werden unwiderruflich gelöscht</li>
            <li>Ihre Einstellungen und Konfigurationen gehen verloren</li>
            <li>Ihr Instagram-Zugriff wird entfernt</li>
            <li>Alle gespeicherten Daten werden dauerhaft gelöscht</li>
            <li>Diese Aktion kann nicht rückgängig gemacht werden</li>
          </ul>
        </div>

        {/* Confirmation Section */}
        <div className="bg-[#15192a]/80 backdrop-blur-lg rounded-xl shadow-2xl p-6 text-white mb-6">
          <h3 className="text-xl font-bold mb-4 text-[#f3aacb]">Bestätigung erforderlich</h3>
          <p className="text-gray-300 mb-4">
            Um zu bestätigen, dass Sie Ihr Konto wirklich löschen möchten, geben Sie bitte &ldquo;LÖSCHEN&rdquo; in das Feld unten ein:
          </p>
          <input
            type="text"
            placeholder="LÖSCHEN eingeben"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            className="w-full p-3 border border-gray-600 rounded-lg bg-[#1a1f2e] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button
            onClick={handleDeleteAccount}
            disabled={confirmation !== 'LÖSCHEN'}
            className="w-full mt-4 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Konto löschen bestätigen
          </button>
        </div>

        {/* Final Confirmation Modal */}
        {showFinalConfirmation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-[#15192a] rounded-xl p-6 max-w-md w-full text-white">
              <h3 className="text-xl font-bold mb-4 text-red-400">Letzte Bestätigung</h3>
              <p className="text-gray-300 mb-6">
                Sind Sie sich wirklich sicher? Diese Aktion kann nicht rückgängig gemacht werden.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowFinalConfirmation(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleFinalDelete}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Wird gelöscht...' : 'Endgültig löschen'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contact Information */}
        <div className="bg-[#15192a]/80 backdrop-blur-lg rounded-xl shadow-2xl p-6 text-white mb-6">
          <h3 className="text-xl font-bold mb-4 text-[#f3aacb]">Haben Sie Fragen?</h3>
          <p className="text-gray-300 mb-4">
            Falls Sie Fragen zum Löschen Ihres Kontos haben oder Hilfe benötigen, kontaktieren Sie uns gerne:
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

        {/* Back Button */}
        <div className="text-center">
          <Link
            href="/settings"
            className="inline-block px-6 py-3 bg-[#f3aacb] text-[#334269] font-semibold rounded-lg hover:bg-[#e6ebfc] transition-colors"
          >
            Zurück zu den Einstellungen
          </Link>
        </div>
      </div>
    </div>
  );
}
