'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      localStorage.clear();
      
      // Only import and create Supabase client on the client side
      const { createClient } = await import('@/lib/auth/supabaseClient.client');
      const supabase = createClient();
      
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ background: 'linear-gradient(135deg, #1b1f2b, #2b2e47, #313c5c)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">
            Einstellungen
          </h1>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-[#f3aacb] text-[#334269] font-semibold rounded-lg hover:bg-[#e6ebfc] transition-colors"
          >
            Zurück zum Dashboard
          </Link>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Account Settings */}
          <div className="bg-[#15192a]/80 backdrop-blur-lg rounded-xl shadow-2xl p-6 text-white">
            <h2 className="text-2xl font-bold mb-4 text-[#f3aacb]">Konto-Einstellungen</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#1a1f2e] rounded-lg">
                <div>
                  <h3 className="font-semibold">E-Mail-Adresse ändern</h3>
                  <p className="text-sm text-gray-400">Ihre E-Mail-Adresse für Login und Benachrichtigungen</p>
                </div>
                <button className="px-4 py-2 bg-[#f3aacb] text-[#334269] font-semibold rounded-lg hover:bg-[#e6ebfc] transition-colors">
                  Ändern
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-[#1a1f2e] rounded-lg">
                <div>
                  <h3 className="font-semibold">Passwort ändern</h3>
                  <p className="text-sm text-gray-400">Sicherheit Ihres Kontos verbessern</p>
                </div>
                <button className="px-4 py-2 bg-[#f3aacb] text-[#334269] font-semibold rounded-lg hover:bg-[#e6ebfc] transition-colors">
                  Ändern
                </button>
              </div>
            </div>
          </div>

          {/* Privacy & Data */}
          <div className="bg-[#15192a]/80 backdrop-blur-lg rounded-xl shadow-2xl p-6 text-white">
            <h2 className="text-2xl font-bold mb-4 text-[#f3aacb]">Datenschutz & Daten</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#1a1f2e] rounded-lg">
                <div>
                  <h3 className="font-semibold">Daten herunterladen</h3>
                  <p className="text-sm text-gray-400">Laden Sie eine Kopie Ihrer gespeicherten Daten herunter</p>
                </div>
                <button className="px-4 py-2 bg-[#f3aacb] text-[#334269] font-semibold rounded-lg hover:bg-[#e6ebfc] transition-colors">
                  Herunterladen
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-[#1a1f2e] rounded-lg">
                <div>
                  <h3 className="font-semibold text-red-400">Konto löschen</h3>
                  <p className="text-sm text-gray-400">Löschen Sie Ihr Konto und alle zugehörigen Daten unwiderruflich</p>
                </div>
                <Link
                  href="/delete-account"
                  className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                >
                  Konto löschen
                </Link>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-[#15192a]/80 backdrop-blur-lg rounded-xl shadow-2xl p-6 text-white">
            <h2 className="text-2xl font-bold mb-4 text-[#f3aacb]">Benachrichtigungen</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#1a1f2e] rounded-lg">
                <div>
                  <h3 className="font-semibold">E-Mail-Benachrichtigungen</h3>
                  <p className="text-sm text-gray-400">Erhalten Sie Updates zu Ihrem Account und dem Service</p>
                </div>
                <button className="px-4 py-2 bg-[#f3aacb] text-[#334269] font-semibold rounded-lg hover:bg-[#e6ebfc] transition-colors">
                  Aktiviert
                </button>
              </div>
            </div>
          </div>

          {/* Logout Section */}
          <div className="bg-[#15192a]/80 backdrop-blur-lg rounded-xl shadow-2xl p-6 text-white">
            <h2 className="text-2xl font-bold mb-4 text-[#f3aacb]">Sitzung</h2>
            <div className="flex items-center justify-between p-4 bg-[#1a1f2e] rounded-lg">
              <div>
                <h3 className="font-semibold">Abmelden</h3>
                <p className="text-sm text-gray-400">Beenden Sie Ihre aktuelle Sitzung</p>
              </div>
              <button
                onClick={handleLogout}
                disabled={loading}
                className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Wird abgemeldet...' : 'Abmelden'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
