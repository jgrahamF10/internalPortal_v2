import type { Metadata } from "next";
import { Providers } from "./provider";
import { Inter as FontSans } from "next/font/google";
import { DM_Sans } from "next/font/google";
import { Poppins } from "next/font/google";
import "./globals.css";
import SideNav from "@/components/layout/sideNav";
import SearchBar from "@/components/layout/searchBar";
import { Toaster } from "@/components/ui/sonner"

import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";

const fontSans = FontSans({
    subsets: ["latin"],
    variable: "--font-sans",
});

const fontHeading = DM_Sans({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-heading",
});

const fontBody = Poppins({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-body",
    weight: ["400", "700"],
});

export const metadata: Metadata = {
    title: "Form 10 Group - Internal Portal",
    description: "Company Internal Portal",
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={cn(
                    "min-h-screen bg-background font-sans antialiased",
                    fontHeading.variable,
                    fontBody.variable
                )}
            >
                <Providers>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <div className="fixed top-0 left-0 w-full z-50">
                            <SearchBar />
                        </div>
                        <div className="fixed left-0 w-72 h-full z-40">
                            <SideNav />
                        </div>
                        <div className="pt-16 pl-72 pr-2 py-8">
                            {children}
                        </div>
                        <Toaster richColors position="top-right" />
                    </ThemeProvider>
                </Providers>
            </body>
        </html>
    );
}
