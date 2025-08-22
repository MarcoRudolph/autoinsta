"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

interface Consent {
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

const CONSENT_KEY = "cookieConsent";
const CONSENT_LOG_KEY = "cookieConsentLog";

export default function CookieBanner() {
  const [open, setOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) {
      setOpen(true);
    }
  }, []);

  const saveConsent = (consent: Consent, action: string) => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    const existing = localStorage.getItem(CONSENT_LOG_KEY);
    const log = existing ? JSON.parse(existing) : [];
    log.push({ ...consent, action });
    localStorage.setItem(CONSENT_LOG_KEY, JSON.stringify(log));
  };

  const handleAccept = () => {
    const consent = {
      functional: true,
      analytics,
      marketing,
      timestamp: new Date().toISOString(),
    };
    saveConsent(consent, "accept");
    setOpen(false);
  };

  const handleDecline = () => {
    const consent = {
      functional: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    };
    saveConsent(consent, "decline");
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <div className="bg-[#15192a]/90 text-[#a3bffa] p-4 rounded-lg shadow-xl text-sm">
        <h3 className="font-bold mb-2 text-base">Cookie Nutzung</h3>
        <p className="mb-3">Wir verwenden funktionale, analytische und Marketing Cookies.</p>
        <div className="flex flex-col gap-1 mb-3">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked disabled className="accent-blue-500" />
            Funktionale Cookies (erforderlich)
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={analytics}
              onChange={(e) => setAnalytics(e.target.checked)}
              className="accent-blue-500"
            />
            Analytische Cookies
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={marketing}
              onChange={(e) => setMarketing(e.target.checked)}
              className="accent-blue-500"
            />
            Marketing Cookies
          </label>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={handleDecline}
            className="px-3 py-1 rounded-md bg-gray-700/40 hover:bg-gray-700"
          >
            Ablehnen
          </button>
          <button
            onClick={handleAccept}
            className="px-3 py-1 rounded-md bg-[#a3bffa] text-[#334269] font-semibold hover:bg-[#f3aacb]"
          >
            Akzeptieren
          </button>
        </div>
        <p className="mt-2 text-xs text-right space-x-2">
          <Link href="/cookie-policy" className="underline">Cookie-Richtlinie</Link>
          <span>•</span>
          <Link href="/terms-new" className="underline">Terms of use</Link>
        </p>
      </div>
    </div>
  );
}
