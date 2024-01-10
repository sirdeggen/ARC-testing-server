import './global.css'
export const metadata = {
  title: 'ARC TIC',
  description: 'For Externally Monitoring ARC Responses and Success Rates',
  image: '/favicon.png',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" />
      </head>
      <body>{children}</body>
    </html>
  )
}
