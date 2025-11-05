import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-provider";
import { AuthProvider } from "@/lib/auth/providers";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "SWORD Intelligence | Web3 & Cyber Intelligence",
  description: "Adversaries don't play fair. We do what's lawful—and effective. SWORD Intelligence helps funds, founders, and enterprises prevent loss, hunt threat actors, and respond fast across Web3 and traditional infrastructure.",
  keywords: "Web3 security, cyber intelligence, threat actor hunting, blockchain forensics, UHNWI protection, crypto investigations",
  authors: [{ name: "SWORD Intelligence" }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "SWORD Intelligence",
    title: "SWORD Intelligence | Web3 & Cyber Intelligence",
    description: "Lawful, effective intelligence and response for Web3 and cyber threats.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        <AuthProvider>
          <ThemeProvider>
            <Navigation />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
