import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'my blog',
  description: 'thoughts, notes, things',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <header className="site-header">
          <div className="container">
            <a className="site-title" href="/">my blog</a>
            <p className="site-desc">thoughts, notes, things</p>
          </div>
        </header>
        <main className="container">
          {children}
        </main>
        <footer className="site-footer">
          <div className="container">akshat&apos;s corner of the internet</div>
        </footer>
      </body>
    </html>
  )
}
