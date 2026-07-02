// ============================================
// ROOT LAYOUT - Wraps every page of the app
// ============================================

import "./globals.css";

// Google Fonts via next/font for optimization
import { Fraunces, JetBrains_Mono, Inter } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Resumeqo — Get your resume reviewed in seconds",
  description:
    "Upload your resume. Our AI marks it up like a recruiter would — line by line — then tells you exactly what to fix.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${jetbrainsMono.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
