import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Providers } from "./providers"
import { UpdateNotification } from "@/components/update-notification"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CLPDash - Server Management",
  description: "A modern web-based server management application",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </Providers>
        <UpdateNotification />
      </body>
    </html>
  )
}

import './globals.css'