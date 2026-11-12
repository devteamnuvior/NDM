import type { Metadata } from "next";
import { BfSalePage } from "@/components/bf-sale/bf-sale";
import { BfsClass } from "@/components/bf-sale/bfs-class";

export const metadata: Metadata = {
  title: "Black Friday 2026: Up to 60% Off Treatments | NewDermaMed Toronto",
  description: "NewDermaMed Black Friday, November 27 to 30: offers on laser, skin, injectable and body treatments at our Uptown and Downtown Toronto clinics. Build your plan and book a free consultation.",
};

/** The Black Friday sale page. It has its own header and footer, so it sits outside the (site) layout. */
export default function BlackFridaySalePage() {
  return (
    <>
      {/* the page's look hangs on a class on <html>: set it before the first paint */}
      <script dangerouslySetInnerHTML={{ __html: 'document.documentElement.classList.add("bfs")' }} />
      <BfsClass />
      <BfSalePage />
    </>
  );
}
