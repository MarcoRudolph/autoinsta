import Link from "next/link";
import { useI18n } from "@/hooks/useI18n";

interface FooterProps {
  locale?: string;
}

export default function Footer({ locale = 'en' }: FooterProps) {
  const { t } = useI18n(locale);

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
              {t('footer.tagline')}
            </p>
            <p className="text-xs text-gray-500">
              {t('footer.developedBy')}{" "}
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
            <h3 className="font-semibold mb-4">{t('footer.service')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/pricing" className="hover:text-[#f3aacb] transition-colors">
                  {t('footer.pricing')}
                </Link>
              </li>
              <li>
                <Link href="/pro" className="hover:text-[#f3aacb] transition-colors">
                  {t('footer.proFeatures')}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#f3aacb] transition-colors">
                  {t('footer.dashboard')}
                </Link>
              </li>
              <li>
                <Link href="/documentation" className="hover:text-[#f3aacb] transition-colors">
                  {t('footer.documentation')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.legal')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/impressum" className="hover:text-[#f3aacb] transition-colors">
                  {t('footer.imprint')}
                </Link>
              </li>
              <li>
                <Link href="/terms-new" className="hover:text-[#f3aacb] transition-colors">
                  {t('footer.termsOfUse')}
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="hover:text-[#f3aacb] transition-colors">
                  {t('footer.cookiePolicy')}
                </Link>
              </li>
              <li>
                <Link href="/privacy-new" className="hover:text-[#f3aacb] transition-colors">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link href="/data-deletion-new" className="hover:text-[#f3aacb] transition-colors">
                  {t('footer.dataDeletion')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} rudolpho-chat. {t('footer.allRightsReserved')}
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="/impressum" className="text-xs text-gray-500 hover:text-[#f3aacb] transition-colors">
              {t('footer.imprint')}
            </Link>
            <Link href="/privacy-new" className="text-xs text-gray-500 hover:text-[#f3aacb] transition-colors">
              {t('footer.privacy')}
            </Link>
            <Link href="/terms-new" className="text-xs text-gray-500 hover:text-[#f3aacb] transition-colors">
              {t('footer.termsOfUse')}
            </Link>
            <Link href="/cookie-policy" className="text-xs text-gray-500 hover:text-[#f3aacb] transition-colors">
              {t('footer.cookiePolicy')}
            </Link>
            <Link href="/data-deletion-new" className="text-xs text-gray-500 hover:text-[#f3aacb] transition-colors">
              {t('footer.dataDeletion')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 