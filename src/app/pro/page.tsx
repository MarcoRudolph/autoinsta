"use client";
import React, { useState } from "react";
import Navbar from "@/components/Navbar";

const ProPage = () => {
  const [loading, setLoading] = useState(false);
  const handleGetPro = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/create-checkout-session", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setLoading(false);
        alert("Could not start checkout. Please try again.");
      }
    } catch {
      setLoading(false);
      alert("Could not start checkout. Please try again.");
    }
  };
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white flex flex-col items-center pt-16 px-4">
        <div className="flex items-center gap-4 mb-8">
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-sky-700 to-cyan-500 bg-clip-text text-transparent font-satoshi" style={{ fontFamily: 'Satoshi, sans-serif' }}>
            AutoInsta
          </h1>
          <span className="text-3xl md:text-4xl font-bold text-cyan-600 font-satoshi" style={{ fontFamily: 'Satoshi, sans-serif' }}>
            Pro
          </span>
        </div>
        <div className="max-w-4xl text-center space-y-6 text-xl md:text-2xl text-gray-700 font-satoshi" style={{ fontFamily: 'Satoshi, sans-serif' }}>
          <p>AutoInsta is a powerful way to let the AI do the job for you.</p>
          <p>Successful conversations can lead the chatbot to offer products after establishing a basic level of trust through a pleasing, customizable conversational mentality.</p>
          <p>It builds customer loyalty and never applies pressure, as it has plenty of time to engage with each customer individually.</p>
        </div>
        {/* Pro Card */}
        <div className="mt-12 w-full flex justify-center">
          <div className="bg-white border border-cyan-200 rounded-2xl shadow-lg p-10 max-w-lg w-full flex flex-col items-start font-satoshi" style={{ fontFamily: 'Satoshi, sans-serif' }}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl font-bold text-gray-800">Pro</span>
              <span className="px-3 py-1 text-xs font-semibold bg-cyan-100 text-cyan-700 rounded-full">Popular</span>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-extrabold text-cyan-700">€10</span>
              <span className="text-lg text-gray-600">/ month</span>
            </div>
            <div className="text-sm text-gray-500 mb-4">€8.33 with annual billing</div>
            <div className="mb-6 text-base text-gray-700 font-medium">Boost your productivity and learning with additional access.</div>
            <button className="w-full bg-gradient-to-r from-cyan-400 to-sky-600 text-white font-semibold py-3 rounded-lg text-lg shadow hover:from-cyan-500 hover:to-sky-700 transition mb-6" onClick={handleGetPro} disabled={loading}>
              {loading ? "Redirecting..." : "Get Pro"}
            </button>
            <ul className="space-y-2 text-gray-700 text-base">
              <li className="flex items-center gap-2"><span className="text-cyan-500">✓</span>10x more citations in answers</li>
              <li className="flex items-center gap-2"><span className="text-cyan-500">✓</span>Access to AutoInsta Labs</li>
              <li className="flex items-center gap-2"><span className="text-cyan-500">✓</span>Unlimited access to AutoInsta Research</li>
              <li className="flex items-center gap-2"><span className="text-cyan-500">✓</span>Unlimited file uploads</li>
              <li className="flex items-center gap-2"><span className="text-cyan-500">✓</span>Enhanced image generation access</li>
              <li className="flex items-center gap-2"><span className="text-cyan-500">✓</span>Subscription to all latest AI models</li>
              <li className="flex items-center gap-2"><span className="text-cyan-500">✓</span>Exclusive access to Pro features</li>
              <li className="flex items-center gap-2"><span className="text-cyan-500">✓</span>And much more</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProPage; 