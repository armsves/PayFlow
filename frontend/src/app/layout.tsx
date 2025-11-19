import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PayFlow - Cross-Chain Payroll',
  description: 'Decentralized payroll platform for Web3 companies',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
