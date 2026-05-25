import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Aplikim për licencë | AKKC',
  description: 'Formular aplikimi online – Agjencia Kombëtare e Kontrollit të Cannabis-it',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sq">
      <body>{children}</body>
    </html>
  );
}
