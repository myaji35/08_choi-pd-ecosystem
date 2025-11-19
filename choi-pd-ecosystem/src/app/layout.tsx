import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: '최범희 대표 - 스마트폰 창업 전략가',
    template: '%s | 최범희',
  },
  description: '5060 베이비부머를 위한 스마트폰 창업 교육, 한국환경저널 발행인',
  keywords: ['스마트폰 창업', '5060 교육', '한국환경저널', '최범희'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="ko">
        <body className={inter.className}>
          <Header />
          <MobileMenu />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
