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
    <html lang="en">
      <body className="antialiased bg-[#fcfbf9] text-[#171717] min-h-screen">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#ffffff',
              border: '1px solid #e5e5e5',
              color: '#171717',
            },
          }}
        />
      </body>
    </html>
  )
}
