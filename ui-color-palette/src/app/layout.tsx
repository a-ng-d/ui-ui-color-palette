import type { Metadata } from 'next'
import { Martian_Mono, Lexend } from 'next/font/google'
import './globals.css'

const lexend = Lexend({
  variable: '--font-lexend',
  subsets: ['latin'],
})

const martianMono = Martian_Mono({
  variable: '--font-martian-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'UI Color Palette',
  description: 'Start exploring palettes!',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${lexend.variable} ${martianMono.variable}`}>
        {children}
      </body>
    </html>
  )
}
