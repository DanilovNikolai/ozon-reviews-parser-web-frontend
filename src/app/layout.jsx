import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import Header from '@/components/Header';
import PageWrapper from '@/components/PageWrapper';
import { getCurrentUser } from '@/utils/getCurrentUser';
import { AuthProvider } from './context/AuthContext';
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

export default async function RootLayout({ children }) {
  // Инициализация юзера до загрузки страницы
  const user = await getCurrentUser();

  return (
    <html lang="ru">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider initialUser={user}>
          <Toaster position="top-right" toastOptions={{ duration: 2500 }} />
          <PageWrapper>
            <Header className="mb-3 sm:mb-6" />
            {children}
          </PageWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
