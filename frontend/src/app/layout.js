import '../styles/globals.css'

export const metadata = {
  title: 'TradeSense AI - Prop Trading Platform',
  description: 'Africa\'s First AI-Powered Proprietary Trading Firm',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
