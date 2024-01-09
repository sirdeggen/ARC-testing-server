export const metadata = {
  title: 'ARC TIC',
  description: 'For Externally Monitoring ARC Responses and Success Rates',
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
