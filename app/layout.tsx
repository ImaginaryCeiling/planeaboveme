import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Plane Above Me - Real-time Aircraft Tracking',
  description: 'See what planes are flying overhead in real-time',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
