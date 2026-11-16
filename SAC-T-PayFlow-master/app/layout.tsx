import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'IPM SAC Treasury',
  description: 'IPM Student Activities Council Treasury Payment Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#111113] text-zinc-100 min-h-screen">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#18181b',
              border: '1px solid #3f3f46',
              color: '#f4f4f5',
            },
          }}
        />
      </body>
    </html>
  )
}
