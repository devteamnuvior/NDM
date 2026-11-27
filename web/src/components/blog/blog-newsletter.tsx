"use client";

import { useRef, useState } from "react";
import { BlurTitle } from "@/components/blog/blur-title";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { IconCheckBadge } from "@/components/ui/icons";
import { useReveal } from "@/hooks/use-reveal";

const FIELD = "block h-12 w-full rounded-[10px] border border-ndm-ink/15 bg-white px-3.5 font-inter text-[14.5px] text-ndm-ink placeholder:text-[#7D868D] outline-hidden transition focus:border-ndm-blue focus:ring-4 focus:ring-ndm-blue/15";

/** Newsletter band. There is no backend yet: subscribing shows the thank-you note only, as in the prototype. */
export function BlogNewsletter() {
  const section = useRef<HTMLElement>(null);
  useReveal(section);
  const [sent, setSent] = useState(false);
  return (
    <section ref={section} aria-labelledby="news-title" className="relative z-10 bg-ndm-mist px-[var(--gx)] py-[clamp(80px,9vw,128px)] text-center">
      <Eyebrow className="rv">Newsletter</Eyebrow>
      <BlurTitle id="news-title" className="mx-auto mt-5 max-w-[20ch]" lead="Skin notes from our team," strong="every now and then." />
      <p className="rv mx-auto mt-5 max-w-[48ch] font-inter text-[15.5px] leading-[1.6] text-ndm-muted" style={{ transitionDelay: ".2s" }}>
        Occasional skin care tips, new treatment guides and clinic news. No spam, and you can unsubscribe at any time.
      </p>
      {sent ? (
        <p role="status" className="mx-auto mt-9 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-inter text-[14.5px] text-ndm-ink ring-1 ring-ndm-ink/10">
          <IconCheckBadge className="text-ndm-deep" />
          Thank you, you are on the list.
        </p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
          className="rv mx-auto mt-9 flex max-w-[520px] flex-col gap-2.5 sm:flex-row"
          style={{ transitionDelay: ".26s" }}
        >
          <label className="min-w-0 flex-1">
            <span className="sr-only">Email address</span>
            <input required type="email" autoComplete="email" placeholder="Your email address" className={FIELD} />
          </label>
          <Button v="ink" type="submit">
            Subscribe
          </Button>
        </form>
      )}
      <p className="mt-4 font-inter text-[12.5px] text-ndm-muted">By subscribing you agree to receive emails from NewDermaMed.</p>
    </section>
  );
}
