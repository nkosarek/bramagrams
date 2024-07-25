import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { ThemeProvider } from "@mui/material";
import { theme } from "@/ui/theme";
import "./globals.css";
import { BaseLayout } from "@/ui/BaseLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bramagrams",
  description:
    "Kinda like Bananagrams except Emily changed it so she always wins.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <BaseLayout>{children}</BaseLayout>
      </body>
    </html>
  );
}
