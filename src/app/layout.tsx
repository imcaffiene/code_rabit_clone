import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/provider/ThemeProvider';
import { Toaster } from 'react-hot-toast';
import { QueryProvider } from '@/provider/query-provider';


export const metadata: Metadata = {
  title: 'CodeGuardian - AI Code Reviews',
  description: 'AI-powered code reviews for your team',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <QueryProvider>
          <ThemeProvider defaultTheme="dark" storageKey="coderabbit-theme">
            {children}
            <Toaster />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
