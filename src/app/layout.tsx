import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import "./globals.css";

const kanit = Kanit({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Thai PBS Sci & Tech — แม่แบบภาพ",
  description: "สร้างภาพโซเชียลและเว็บไซต์ Sci & Tech ในเบราว์เซอร์",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={kanit.variable}>
      <body className={kanit.className}>{children}</body>
    </html>
  );
}
