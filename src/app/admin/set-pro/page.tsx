'use client';

import { useState } from 'react';

type AdminResult = {
  success: boolean;
  message: string;
};

export default function AdminSetProPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AdminResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState(''); // Remove hardcoded user ID
  const [adminSecret, setAdminSecret] = useState(''); // Remove hardcoded admin secret

  const handleSetPro = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/admin/set-pro-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          adminSecret: adminSecret
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to set user as pro');
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
            Admin: Set User as Pro
          </h1>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User ID
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter user ID"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Secret
              </label>
              <input
                type="password"
                value={adminSecret}
                onChange={(e) => setAdminSecret(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter admin secret"
              />
            </div>
          </div>

          <button
            onClick={handleSetPro}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Setting...' : 'Set User as Pro'}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <h3 className="font-semibold text-green-800 mb-2">Success!</h3>
              <div className="text-sm text-green-700">
                <p><strong>Message:</strong> {result.message}</p>
                <p><strong>User ID:</strong> {userId}</p>
                <p><strong>Status:</strong> Pro user activated</p>
                <p><strong>Plan:</strong> Pro</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
