'use client';

import React from 'react';
import Link from 'next/link';

export default function DeleteAccountPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#15192a] via-[#232946] to-[#334269] text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#f3aacb] via-[#a3bffa] to-[#e6ebfc] bg-clip-text text-transparent">
            Account Deletion Guide
          </h1>
          <p className="text-xl text-gray-300">
            How to permanently delete your AI-Chatbot account and data
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-[#15192a]/80 backdrop-blur-lg rounded-xl shadow-2xl p-8 mb-8">
          <div className="prose prose-invert max-w-none">
            <h2 className="text-2xl font-bold mb-6 text-[#f3aacb]">
              How to Delete Your Account
            </h2>
            
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="bg-[#232946]/60 rounded-lg p-6 border border-[#334269]/30">
                <h3 className="text-xl font-semibold mb-3 text-[#a3bffa]">
                  Step 1: Access Your Account Settings
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-300">
                  <li>Log in to your AI-Chatbot account at <span className="text-[#f3aacb]">rudolpho-chat.de</span></li>
                  <li>Navigate to the Dashboard</li>
                  <li>Click on your profile icon in the top-right corner</li>
                  <li>Select &quot;Settings&quot; from the dropdown menu</li>
                </ol>
              </div>

              {/* Step 2 */}
              <div className="bg-[#232946]/60 rounded-lg p-6 border border-[#334269]/30">
                <h3 className="text-xl font-semibold mb-3 text-[#a3bffa]">
                  Step 2: Find Account Deletion Option
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-300">
                  <li>In the Settings page, scroll down to find &quot;Account Management&quot;</li>
                  <li>Look for the &quot;Delete Account&quot; or &quot;Permanently Delete Account&quot; section</li>
                  <li>Click on the &quot;Delete Account&quot; button</li>
                </ol>
              </div>

              {/* Step 3 */}
              <div className="bg-[#232946]/60 rounded-lg p-6 border border-[#334269]/30">
                <h3 className="text-xl font-semibold mb-3 text-[#a3bffa]">
                  Step 3: Confirm Deletion
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-300">
                  <li>You will be prompted to enter your password for security verification</li>
                  <li>Read the deletion warning carefully - this action is irreversible</li>
                  <li>Type &quot;DELETE&quot; in the confirmation field</li>
                  <li>Click &quot;Permanently Delete My Account&quot;</li>
                </ol>
              </div>

              {/* Step 4 */}
              <div className="bg-[#232946]/60 rounded-lg p-6 border border-[#334269]/30">
                <h3 className="text-xl font-semibold mb-3 text-[#a3bffa]">
                  Step 4: Account Deletion Process
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-300">
                  <li>Your account will be immediately deactivated</li>
                  <li>All your data will be permanently deleted within 30 days</li>
                  <li>You will receive a confirmation email</li>
                  <li>After 30 days, your data cannot be recovered</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* What Gets Deleted */}
        <div className="bg-[#15192a]/80 backdrop-blur-lg rounded-xl shadow-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-[#f3aacb]">
            What Gets Deleted
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#a3bffa]">Account Data</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>Your profile information</li>
                <li>Email address and login credentials</li>
                <li>Account preferences and settings</li>
                <li>Subscription and billing information</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#a3bffa]">AI-Chatbot Data</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>All created AI-Chatbots and personas</li>
                <li>Chat history and conversations</li>
                <li>Instagram connection settings</li>
                <li>Product links and configurations</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Important Information */}
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-red-400">
            ⚠️ Important Information
          </h2>
          <div className="space-y-4 text-gray-300">
            <p>
              <strong className="text-red-400">Account deletion is permanent and irreversible.</strong> 
              Once you delete your account:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>You will lose access to all your AI-Chatbots and data</li>
              <li>Your Instagram connections will be permanently removed</li>
              <li>All subscription payments will be cancelled</li>
              <li>You cannot recover your account after 30 days</li>
            </ul>
            <p className="text-yellow-400">
              <strong>Note:</strong> If you have an active subscription, consider cancelling it before deleting your account to avoid future charges.
            </p>
          </div>
        </div>

        {/* Alternative Options */}
        <div className="bg-[#15192a]/80 backdrop-blur-lg rounded-xl shadow-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-[#f3aacb]">
            Alternative Options
          </h2>
          <div className="space-y-4 text-gray-300">
            <p>
              Before deleting your account, consider these alternatives:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Deactivate account:</strong> Temporarily disable your account instead of permanent deletion</li>
              <li><strong>Export data:</strong> Download your AI-Chatbots and data before deletion</li>
              <li><strong>Contact support:</strong> If you&apos;re experiencing issues, our support team can help</li>
              <li><strong>Change settings:</strong> Adjust privacy settings or remove specific data</li>
            </ul>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-[#15192a]/80 backdrop-blur-lg rounded-xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-[#f3aacb]">
            Need Help?
          </h2>
          <div className="space-y-4 text-gray-300">
            <p>
              If you need assistance with account deletion or have questions, please contact us:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-[#a3bffa] mb-2">Email Support</h3>
                <p>marcorudolph09@proton.me</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#a3bffa] mb-2">Response Time</h3>
                <p>Within 24-48 hours</p>
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
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
