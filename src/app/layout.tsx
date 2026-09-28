import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MediKiosk — AI Clinical History Platform',
  description: 'Ministry of Ayush · Smart India Hackathon 2026 · Patient Case-Taking Software',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
