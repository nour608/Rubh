import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { Providers } from '@/components/layout/providers'
import '@/app/globals.css'

export const metadata: Metadata = {
  title: 'Rubh | Institutional Sharia-Certified RWA Marketplace',
  description:
    'Fractional SME inventory and capital asset financing starting from $10. Cryptographically verified by Chainlink CRE.',
  icons: {
    icon: '/rubh-mark.svg',
    shortcut: '/rubh-mark.svg',
    apple: '/rubh-mark.svg',
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  // Add script to prevent flash of wrong theme before hydration
  const themeScript = `
    (function() {
      try {
        var localTheme = window.localStorage.getItem('theme');
        var theme = localTheme ? localTheme : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        }
      } catch (e) {}
    })();
  `;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-[#F8F9FB] text-slate-900 antialiased selection:bg-[#133359]/10 selection:text-[#133359]">
        <Providers>
          <div className="min-h-screen flex flex-col">{children}</div>
        </Providers>
      </body>
    </html>
  )
}
