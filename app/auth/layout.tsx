import "./globals.css"
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { Inter as FontSans } from "next/font/google";
import { DM_Sans } from "next/font/google";
import { Poppins } from "next/font/google";

const fontSans = FontSans({
    subsets: ["latin"],
    variable: "--font-sans",
});

export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <html lang="en">
        <body className={cn(
          "min-screen-h bg-black font-sans antialiased",
            fontSans.variable
          )}>
            {children}
        </body>
      </html>
    );
  }
  