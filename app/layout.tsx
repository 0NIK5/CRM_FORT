import type { Metadata } from 'next';
import { Inter, Inter_Tight } from 'next/font/google';
import { LangProvider } from '@/lib/i18n-context';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-inter' });
const interTight = Inter_Tight({ subsets: ['latin', 'cyrillic'], variable: '--font-inter-tight', weight: ['500','600','700','800'] });

export const metadata: Metadata = {
  title: 'Fortitude CRM',
  description: 'Fortitude CRM + Donor Portal — концепт',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" className={`${inter.variable} ${interTight.variable}`}>
      <body><LangProvider>{children}</LangProvider></body>
    </html>
  );
}
