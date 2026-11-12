"use client";

import { IconArrow, IconSearch } from "@/components/ui/icons";
import { openSearch } from "@/lib/site-events";

/** The wide "Search treatments" field in the section header: a button that opens the site search. */
export function StartSearch() {
  return (
    <button
      type="button"
      onClick={openSearch}
      className="rv group flex h-[60px] w-full max-w-[440px] items-center gap-3 rounded-full border border-ndm-line bg-white pr-2 pl-5 text-left shadow-[0_18px_40px_-30px_rgba(27,36,43,.45)] transition-colors hover:border-ndm-ink/30"
      style={{ transitionDelay: ".1s" }}
    >
      <IconSearch className="shrink-0 text-ndm-muted" />
      <span className="flex-1 font-inter text-[16px] text-ndm-muted">Search treatments</span>
      <span className="grid size-11 place-items-center rounded-full bg-ndm-deep text-white transition-[translate,background-color] group-hover:translate-x-0.5 group-hover:bg-[#0A4F7A]" aria-hidden="true">
        <IconArrow />
      </span>
    </button>
  );
}
