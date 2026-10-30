import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { cn } from "@/lib/utils"
import MyMap from "./map/page"
import React from "react"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        geist.variable
      )}
    >
      <body>
        <MyMap />
      </body>
    </html>
  )
}
