import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/provider/ThemeProvider';

export const metadata: Metadata = {
  title: 'CodeRabbit - AI Code Reviews',
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
        <ThemeProvider defaultTheme="dark" storageKey="coderabbit-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
