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
  title: "Thai PBS Sci & Tech — Image templates",
  description: "Create Sci & Tech social and website images in the browser",
  openGraph: {
    title: "Thai PBS Sci & Tech — Image templates",
    description: "Create Sci & Tech social and website images in the browser",
    type: "website",
    images: [
      {
        url: "https://sci-and-tech.template.spaceth.co/opengraph-image.jpg",
        width: 1195,
        height: 685,
        alt: "Thai PBS Sci & Tech — Image templates",
        type: "image/jpeg",
      },
    ],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={kanit.variable}>
      <body className={kanit.className}>{children}</body>
    </html>
  );
}
