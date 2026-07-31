import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'MaestroMeets — Search Less. Solve More.',
  description:
    'Turn any project idea into an implementation-ready solution powered by AI. Get idea validation, architecture diagrams, tech stack recommendations, and a full sprint roadmap instantly.',
  keywords: ['AI research', 'project planning', 'innovation', 'architecture', 'roadmap'],
  openGraph: {
    title: 'MaestroMeets — Search Less. Solve More.',
    description: 'AI-powered Research & Innovation Copilot for builders.',
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
