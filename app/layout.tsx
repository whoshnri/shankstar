import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { CartProvider } from '@/lib/cart-context'
import { ToastProvider } from '@/lib/toast-context'
import { SearchProvider } from '@/lib/search-context'
import { ToastDisplay } from '@/components/toast-display'
import { SearchOverlay } from '@/components/search-overlay'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'SUPERVILLAIN',
  description: 'Premium curated collection of luxury goods',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-background text-foreground">
        <ToastProvider>
          <SearchProvider>
            <CartProvider>
              {children}
              <ToastDisplay />
              <SearchOverlay />
            </CartProvider>
          </SearchProvider>
        </ToastProvider>
        <Analytics />
      </body>
    </html>
  )
}
