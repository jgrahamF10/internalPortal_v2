import type { Metadata } from "next";
import { Providers } from "../provider";
import "../globals.css";


export default function AuthLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <html lang="en">
            <body>
                <Providers>
                    {children}
                </Providers>
            </body>
      </html>
    )
  }