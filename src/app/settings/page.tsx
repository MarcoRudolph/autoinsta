'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  const handleDeleteUserData = async () => {
    try {
      setDeleteLoading(true);
      
      // Get user ID from session
      const { createClient } = await import('@/lib/auth/supabaseClient.client');
      const supabase = createClient();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        alert('Benutzer nicht gefunden. Bitte melden Sie sich erneut an.');
        return;
      }

      // Call API to delete user data
      const response = await fetch('/api/delete-user-data', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        throw new Error('Fehler beim Löschen der Daten');
      }

      // Clear local storage
      localStorage.clear();
      
             // Show success message and redirect with refresh parameter
       alert('Ihre Daten wurden erfolgreich gelöscht. Sie können sich weiterhin mit Ihrem Account anmelden.');
       router.push('/dashboard?refresh=true');
      
    } catch (error) {
      console.error('Error deleting user data:', error);
      alert('Fehler beim Löschen der Daten. Bitte versuchen Sie es erneut.');
    } finally {
      setDeleteLoading(false);
      setShowDeleteDialog(false);
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
                  <h3 className="font-semibold text-orange-400">Benutzerdaten löschen</h3>
                  <p className="text-sm text-gray-400">Löschen Sie alle Ihre Daten, behalten Sie aber Ihr Konto für Login</p>
                </div>
                <button 
                  onClick={() => setShowDeleteDialog(true)}
                  className="px-4 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Daten löschen
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

        {/* Delete User Data Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="bg-white text-black">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-red-600">Benutzerdaten löschen</DialogTitle>
              <DialogDescription className="text-gray-700">
                Sind Sie sicher, dass Sie alle Ihre Daten löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <h4 className="font-semibold text-gray-800 mb-2">Was wird gelöscht:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Alle erstellten AI-Chatbots und Personas</li>
                <li>• Chat-Verläufe und Konversationen</li>
                <li>• Abonnement-Daten und Zahlungsinformationen</li>
                <li>• Alle Einstellungen und Konfigurationen</li>
                <li>• Produkt-Links und andere persönliche Daten</li>
              </ul>
              
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Hinweis:</strong> Ihr Konto bleibt bestehen und Sie können sich weiterhin anmelden. 
                  Nur Ihre persönlichen Daten werden gelöscht.
                </p>
              </div>
            </div>

            <DialogFooter className="flex gap-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleDeleteUserData}
                disabled={deleteLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {deleteLoading ? 'Wird gelöscht...' : 'Daten löschen'}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
