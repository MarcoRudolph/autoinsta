import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "rudolpho-chat",
  description: "Let the bot do the chat for you",
  icons: {
    icon: [
      { url: '/images/appicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/appicon.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/images/appicon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/images/appicon.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'rudolpho-chat',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/appicon.png" />
        <link rel="apple-touch-icon" href="/images/appicon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
