'use client';

import { useState } from 'react';

type SyncResponse = {
  success: boolean;
  totalAuthUsers: number;
  synced: number;
  skipped: number;
  errors: number;
};

export default function SyncUsersPage() {
  const [result, setResult] = useState<SyncResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSync = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sync-users', {
        method: 'POST',
      });
      const data: SyncResponse = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error syncing users:', error);
      setResult({ success: false, totalAuthUsers: 0, synced: 0, skipped: 0, errors: 1 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Sync Users</h1>
      <button
        onClick={handleSync}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {loading ? 'Syncing...' : 'Sync Users'}
      </button>
      
      {result && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h2 className="font-semibold mb-2">Sync Results:</h2>
          <p>Total Auth Users: {result.totalAuthUsers}</p>
          <p>Synced: {result.synced}</p>
          <p>Skipped: {result.skipped}</p>
          <p>Errors: {result.errors}</p>
        </div>
      )}
    </div>
  );
}
