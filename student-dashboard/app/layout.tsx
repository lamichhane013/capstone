import type { Metadata } from 'next'
import { Syne, Space_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/components/ui/ThemeProvider'
import Sidebar from '@/components/ui/Sidebar'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'EduPredict — Student Performance Analytics',
  description: 'AI-powered student performance prediction and learning analytics dashboard',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${syne.variable} ${spaceMono.variable} font-sans`}>
        <ThemeProvider>
          <div className="flex h-screen overflow-hidden bg-[var(--bg-primary)] grid-bg">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
              <div className="min-h-full">
                {children}
              </div>
            </main>
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#111827',
                color: '#f1f5f9',
                border: '1px solid #1e293b',
                borderRadius: '10px',
                fontFamily: 'var(--font-syne)',
                fontSize: '14px',
              },
              success: {
                iconTheme: { primary: '#10b981', secondary: '#111827' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#111827' },
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
