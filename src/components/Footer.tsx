import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#15192a] text-[#a3bffa] py-8 mt-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl font-bold bg-gradient-to-r from-sky-700 to-cyan-500 bg-clip-text text-transparent">
                rudolpho-chat
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              KI-gestützte Automatisierung für Ihre Instagram-Interaktionen. 
              Lassen Sie den Bot die Arbeit für Sie erledigen.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Service</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/pricing" className="hover:text-[#f3aacb] transition-colors">
                  Preise
                </Link>
              </li>
              <li>
                <Link href="/pro" className="hover:text-[#f3aacb] transition-colors">
                  Pro Features
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#f3aacb] transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold mb-4">Rechtliches</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="hover:text-[#f3aacb] transition-colors">
                  Nutzungsbedingungen
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="hover:text-[#f3aacb] transition-colors">
                  Cookie-Richtlinie
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#f3aacb] transition-colors">
                  Datenschutz
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} rudolpho-chat. Alle Rechte vorbehalten.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="/terms" className="text-xs text-gray-500 hover:text-[#f3aacb] transition-colors">
              Nutzungsbedingungen
            </Link>
            <Link href="/cookie-policy" className="text-xs text-gray-500 hover:text-[#f3aacb] transition-colors">
              Cookie-Richtlinie
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 