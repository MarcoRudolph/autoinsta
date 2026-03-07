import Link from "next/link";
import { useI18n } from "@/hooks/useI18n";

interface FooterProps {
  locale?: string;
}

export default function Footer({ locale = 'en' }: FooterProps) {
  const { t } = useI18n(locale);
  const tf = (key: string, fallback: string): string => {
    const value = t(key);
    if (typeof value === 'string' && value && !value.startsWith('footer.')) {
      return value;
    }
    return fallback;
  };

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
              {tf('footer.tagline', 'AI-powered automation for your Instagram interactions. Let the bot do the work for you.')}
            </p>
            <p className="text-xs text-gray-500">
              {tf('footer.developedBy', 'Developed by')}{" "}
              <a 
                href="https://rudolpho-ai.de" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#a3bffa] hover:text-[#f3aacb] transition-colors underline"
              >
                rudolpho-ai.de
              </a>
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">{tf('footer.service', 'Service')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/pricing" className="hover:text-[#f3aacb] transition-colors">
                  {tf('footer.pricing', 'Pricing')}
                </Link>
              </li>
              <li>
                <Link href="/pro" className="hover:text-[#f3aacb] transition-colors">
                  {tf('footer.proFeatures', 'Pro Features')}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#f3aacb] transition-colors">
                  {tf('footer.dashboard', 'Dashboard')}
                </Link>
              </li>
              <li>
                <Link href="/documentation" className="hover:text-[#f3aacb] transition-colors">
                  {tf('footer.documentation', 'Documentation')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold mb-4">{tf('footer.legal', 'Legal')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/impressum" className="hover:text-[#f3aacb] transition-colors">
                  {tf('footer.imprint', 'Imprint')}
                </Link>
              </li>
              <li>
                <Link href="/terms-new" className="hover:text-[#f3aacb] transition-colors">
                  {tf('footer.termsOfUse', 'Terms of Use')}
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="hover:text-[#f3aacb] transition-colors">
                  {tf('footer.cookiePolicy', 'Cookie Policy')}
                </Link>
              </li>
              <li>
                <Link href="/privacy-new" className="hover:text-[#f3aacb] transition-colors">
                  {tf('footer.privacy', 'Privacy')}
                </Link>
              </li>
              <li>
                <Link href="/data-deletion-new" className="hover:text-[#f3aacb] transition-colors">
                  {tf('footer.dataDeletion', 'Data Deletion')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} rudolpho-chat. {tf('footer.allRightsReserved', 'All rights reserved')}
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="/impressum" className="text-xs text-gray-500 hover:text-[#f3aacb] transition-colors">
              {tf('footer.imprint', 'Imprint')}
            </Link>
            <Link href="/privacy-new" className="text-xs text-gray-500 hover:text-[#f3aacb] transition-colors">
              {tf('footer.privacy', 'Privacy')}
            </Link>
            <Link href="/terms-new" className="text-xs text-gray-500 hover:text-[#f3aacb] transition-colors">
              {tf('footer.termsOfUse', 'Terms of Use')}
            </Link>
            <Link href="/cookie-policy" className="text-xs text-gray-500 hover:text-[#f3aacb] transition-colors">
              {tf('footer.cookiePolicy', 'Cookie Policy')}
            </Link>
            <Link href="/data-deletion-new" className="text-xs text-gray-500 hover:text-[#f3aacb] transition-colors">
              {tf('footer.dataDeletion', 'Data Deletion')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 