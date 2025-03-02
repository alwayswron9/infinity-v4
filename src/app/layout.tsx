import "./globals.css";
import "@/styles/calendar.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Infinity",
  description: "Your data is infinite.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Hardcode the initial color mode since we know we're using dark mode
  // This prevents the server component from trying to import the client-side theme
  const initialColorMode = "dark";
  
  return (
    <html 
      lang="en" 
      data-theme={initialColorMode}
      style={{ colorScheme: initialColorMode }}
    >
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}