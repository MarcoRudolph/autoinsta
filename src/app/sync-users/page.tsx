'use client';

import { useState } from 'react';

export default function SyncUsersPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/sync-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync users');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Sync Supabase Auth Users
          </h1>
          
          <p className="text-gray-600 mb-6">
            This will sync all users from Supabase Auth to your custom users table.
          </p>

          <button
            onClick={handleSync}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Syncing...' : 'Sync Users'}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <h3 className="font-semibold text-green-800 mb-2">Sync Results:</h3>
              <div className="text-sm text-green-700">
                <p><strong>Total Auth Users:</strong> {result.stats.totalAuthUsers}</p>
                <p><strong>Synced:</strong> {result.stats.synced}</p>
                <p><strong>Skipped:</strong> {result.stats.skipped}</p>
                <p><strong>Errors:</strong> {result.stats.errors}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
