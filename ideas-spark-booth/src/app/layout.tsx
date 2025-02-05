import type { Metadata } from 'next'
import { Martian_Mono, Sora } from 'next/font/google'
import './globals.css'

const sora = Sora({
  variable: '--font-sora',
  subsets: ['latin'],
})

const martianMono = Martian_Mono({
  variable: '--font-martian-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Ideas Spark Booth',
  description: 'Start exploring activities!',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${sora.variable} ${martianMono.variable}`}>
        {children}
      </body>
    </html>
  )
}
