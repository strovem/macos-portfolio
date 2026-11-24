import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hüseyin Korumtaş — Lead Creative Producer & Audio Director",
  description:
    "Ideas into experiences. Interactive macOS portfolio showcasing creative production, sound design, original music compositions, and digital experiences by Hüseyin Korumtaş.",
  keywords: [
    "Hüseyin Korumtaş",
    "Creative Producer",
    "Audio Director",
    "Music Producer",
    "Sound Design",
    "macOS Portfolio",
    "Interactive Media",
  ],
  authors: [{ name: "Hüseyin Korumtaş", url: "https://www.linkedin.com/in/h%C3%BCseyin-korumta%C5%9F-05379128a/" }],
  creator: "Hüseyin Korumtaş",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Hüseyin Korumtaş — Lead Creative Producer & Audio Director",
    description: "Ideas into experiences. Interactive macOS portfolio showcasing creative direction, sound design, and original music.",
    siteName: "Hüseyin Korumtaş Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hüseyin Korumtaş — Lead Creative Producer & Audio Director",
    description: "Ideas into experiences. Interactive macOS portfolio.",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/macos/app_finder.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Korumtaş OS",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F7FA" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('korumtas-os-settings');if(s){var p=JSON.parse(s);if(p&&p.state){if(p.state.isDarkMode){document.documentElement.classList.add('dark');}if(p.state.language==='tr'||p.state.language==='en'){document.documentElement.lang=p.state.language;}}}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="antialiased w-screen h-screen h-[100dvh] overflow-hidden select-none bg-[#F5F7FA] dark:bg-black text-slate-800 dark:text-neutral-100">
        {children}
      </body>
    </html>
  );
}
