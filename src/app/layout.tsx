import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "gucduck by Portfolio | Web OS",
  description: "Interactive macOS Web OS Personal Portfolio featuring interactive apps, draggable windows, and desktop cards.",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased w-screen h-screen overflow-hidden select-none bg-[#F5F7FA] text-slate-800">
        {children}
      </body>
    </html>
  );
}
