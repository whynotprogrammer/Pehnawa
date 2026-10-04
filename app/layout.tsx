import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pehnawa - A kinder closet for a brighter tomorrow',
  description: 'Wear. Rewear. Redefine. A sustainable online thrift-fashion platform.',
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
