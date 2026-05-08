import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Daily Translator – Traduction vocale instantanée',
  description: 'Traduisez instantanément à la voix dans 15 langues. Fonctionne sur mobile, tablette et ordinateur.',
  keywords: ['traducteur', 'traduction vocale', 'vocal', 'mobile', 'multilingue'],
  authors: [{ name: 'Jérémy Gonin', url: 'https://www.jeremyai.fr' }],
  openGraph: {
    title: 'Daily Translator',
    description: 'Traduction vocale instantanée dans 15 langues',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563eb',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
