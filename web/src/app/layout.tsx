import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, Manrope } from "next/font/google";
import { BookPopup } from "@/components/booking/book-popup";
import { EarlyReveal } from "@/components/layout/early-reveal";
import { SmoothScroll } from "@/components/layout/smooth-scroll";
import "./globals.css";

/* Fraunces: headings. Manrope: text. Inter: the fallback behind Helvetica Neue for menus, buttons and fields.
   The font stacks themselves are written in globals.css (see the note there); the `variable` classes on
   <html> are what make next/font emit and preload the font files. */
const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--ff-fraunces",
  display: "swap",
});
const manrope = Manrope({ subsets: ["latin"], variable: "--ff-manrope", display: "swap" });
/* only downloaded on devices without Helvetica Neue, so it is not preloaded */
const inter = Inter({ subsets: ["latin"], axes: ["opsz"], variable: "--ff-inter", display: "swap", preload: false });

export const metadata: Metadata = {
  title: "NewDermaMed, Cosmetic & Laser Clinic, Toronto",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0B0F13",
};

/** Every page: fonts, smooth scroll and the Book Free Consultation pop-up. The site header and footer are in (site)/layout.tsx. */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    /* The Black Friday sale page adds its `bfs` class to <html> with an inline script before React starts,
       so the class list can differ from the server's: that difference is expected (this tag only). */
    <html
      lang="en"
      className={`font-change ${fraunces.variable} ${manrope.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body>
        <SmoothScroll />
        {children}
        <BookPopup />
        <EarlyReveal />
      </body>
    </html>
  );
}
