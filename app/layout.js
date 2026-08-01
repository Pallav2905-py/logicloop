import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'IntelliGrade AI — Think Bigger. Research Faster. Innovate Smarter.',
  description:
    'An AI platform that accelerates research, project planning, technical documentation, pitch creation, and innovation.',
  keywords: ['AI research', 'project planning', 'innovation', 'architecture', 'roadmap'],
  openGraph: {
    title: 'IntelliGrade AI — Think Bigger. Research Faster. Innovate Smarter.',
    description:
      'An AI platform that accelerates research, project planning, technical documentation, pitch creation, and innovation.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-[#F8FAFC] antialiased">{children}</body>
    </html>
  );
}
