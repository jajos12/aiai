import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import { ThemeProvider } from '@/hooks/useTheme';
import { TopNav } from '@/components/layout/TopNav';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['500', '600', '700', '800'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['400', '500', '600'],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ai-playground.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'AI Playground — Learn AI Through Interactive Visualizations',
    template: '%s | AI Playground',
  },
  description:
    'Master AI concepts from the ground up through interactive visualizations. Vectors, matrices, neural networks — no prerequisites, just curiosity.',
  keywords: [
    'AI learning', 'machine learning', 'interactive visualizations', 'linear algebra',
    'vectors', 'matrices', 'deep learning', 'math education', 'visual learning',
    'neural networks', 'data science', 'STEM education',
  ],
  authors: [{ name: 'AI Playground' }],
  creator: 'AI Playground',
  publisher: 'AI Playground',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'AI Playground',
    title: 'AI Playground — Learn AI Through Interactive Visualizations',
    description:
      'Master AI concepts from the ground up through interactive visualizations. Vectors, matrices, neural networks — no prerequisites, just curiosity.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI Playground — interactive visual learning platform for AI and math',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Playground — Learn AI Through Interactive Visualizations',
    description:
      'Master AI concepts visually. Drag vectors, transform matrices, explore neural networks. No prerequisites.',
    images: ['/og-image.png'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  other: {
    'theme-color': '#0f1117',
    'color-scheme': 'dark light',
    'msapplication-TileColor': '#0f1117',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${plusJakarta.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider>
          <TopNav />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
