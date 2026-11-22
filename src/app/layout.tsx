import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hüseyin Korumtaş | Creative Producer",
  description: "Ideas into experiences. Interactive macOS portfolio of Hüseyin Korumtaş.",
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
