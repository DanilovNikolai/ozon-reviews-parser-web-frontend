import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import Header from '@/components/Header';
import PageWrapper from '@/components/PageWrapper';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: 'Ozon-reviews-parser-online',
  description: 'Parser for reviews from ozon.ru',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Toaster position="top-right" toastOptions={{ duration: 2500 }} />
        <PageWrapper>
          <Header className="mb-3 sm:mb-6" />
          {children}
        </PageWrapper>
      </body>
    </html>
  );
}
