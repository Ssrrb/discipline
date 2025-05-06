import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { SignedIn } from "@clerk/nextjs";
import "./globals.css";
import { ModalProvider } from "@/providers/store-provider";
import { ToastProvider } from "@/providers/toast-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Admin dashboard",
  description: "Admin dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.variable} font-sans`}>
          <ToastProvider />
          {children}
          <ModalProvider />
        </body>
      </html>
    </ClerkProvider>
  );
}
