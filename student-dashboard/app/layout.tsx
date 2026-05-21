import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Sidebar from '@/components/ui/Sidebar'

export const metadata: Metadata = {
  title: 'Student Dashboard',
  description: 'Student performance dashboard',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex h-screen overflow-hidden bg-gray-100">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
