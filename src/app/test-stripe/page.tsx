'use client';

import { useState } from 'react';
import { createSubscriptionCheckout, createBillingPortal } from '@/app/actions/stripe';

export default function TestStripePage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Use a mock user ID for testing (you can change this)
  const mockUserId = '550e8400-e29b-41d4-a716-446655440000';

  const handleSubscribe = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const { url } = await createSubscriptionCheckout(mockUserId);
      setMessage(`Checkout URL created: ${url}`);
      
      // Optionally redirect to Stripe
      // window.location.href = url;
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBillingPortal = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const { url } = await createBillingPortal(mockUserId);
      setMessage(`Billing portal URL created: ${url}`);
      
      // Optionally redirect to billing portal
      // window.location.href = url;
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Stripe Integration Test</h1>
        
        <div className="mb-4 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-700">
            <strong>Mock User ID:</strong> {mockUserId}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            This is a test user ID. In production, use real authenticated users.
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Test Checkout Session'}
          </button>
          
          <button
            onClick={handleBillingPortal}
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Test Billing Portal'}
          </button>
        </div>
        
        {message && (
          <div className="mt-6 p-4 bg-gray-100 rounded-md">
            <p className="text-sm text-gray-700 break-all">{message}</p>
          </div>
        )}
        
        <div className="mt-6 text-xs text-gray-500">
          <p>This page tests the Stripe integration locally.</p>
          <p>Check the console for any errors.</p>
          <p>Use Stripe CLI for webhook testing:</p>
          <code className="block mt-2 p-2 bg-gray-200 rounded">
            stripe listen --forward-to localhost:3000/api/stripe/webhook
          </code>
        </div>
      </div>
    </div>
  );
}
