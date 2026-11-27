import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { IconArrow } from "@/components/ui/icons";
import { TwoTone } from "@/components/ui/two-tone";
import { ACTIONS } from "@/config/routes";

/** One group of an index page: a procedure list ("Injectables"), or every concern. */
export interface PostIndexGroup {
  /** The section's id: links open it ("/procedures#skin"). */
  id: string;
  title: string;
  items: { title: string; path: string }[];
}

interface PostIndexProps {
  crumb: string;
  tag: string;
  lead: string;
  strong: string;
  intro: string;
  /** What one entry is called in a group's count: "treatment", "concern". */
  noun: string;
  groups: PostIndexGroup[];
  /** Shown when WordPress holds no page yet, or cannot be reached. */
  empty: string;
}

/**
 * An index page: every page of one kind that WordPress holds, as a list of links, in groups. It is where
 * "All treatments", "See all concerns", the footer's Procedures and Concerns links and the breadcrumbs lead.
 */
export function PostIndex({ crumb, tag, lead, strong, intro, noun, groups, empty }: PostIndexProps) {
  const shown = groups.filter((g) => g.items.length);
  return (
    <main id="main" data-shell="inner" data-page="index" className="pt-[176px] xl:pt-[204px]">
      <Breadcrumb items={[crumb]} />
      <section aria-labelledby="ix-title" className="px-[var(--gx)] pt-[clamp(28px,3vw,44px)]">
        <Eyebrow>{tag}</Eyebrow>
        <TwoTone
          as="h1"
          id="ix-title"
          className="mt-5"
          size="text-[clamp(40px,4.6vw,64px)]"
          lead={
            <>
              {lead}
              <br />
            </>
          }
          strong={strong}
        />
        <p className="mt-5 max-w-[60ch] font-inter text-[16px] leading-[1.6] text-ndm-muted">{intro}</p>
        {shown.length > 1 && (
          <nav aria-label={`${crumb} by group`} className="no-scrollbar -mx-[var(--gx)] mt-7 overflow-x-auto px-[var(--gx)]">
            <ul role="list" className="flex w-max gap-1 rounded-full bg-white p-1 shadow-[inset_0_0_0_1px_rgba(27,36,43,.08)]">
              {shown.map((g) => (
                <li key={g.id}>
                  <a href={`#${g.id}`} className="block rounded-full px-4 py-2.5 font-inter text-[14px] whitespace-nowrap text-ndm-muted transition-colors hover:bg-ndm-mist hover:text-ndm-ink">
                    {g.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </section>

      {shown.length === 0 && <p className="px-[var(--gx)] pt-10 font-inter text-[15.5px] leading-[1.6] text-ndm-muted">{empty}</p>}

      {shown.map((g) => (
        <section key={g.id} id={g.id} aria-labelledby={`ix-${g.id}`} className="scroll-mt-[130px] px-[var(--gx)] pt-[clamp(44px,5vw,72px)]">
          <TwoTone
            id={`ix-${g.id}`}
            size="text-[clamp(26px,2.6vw,36px)]"
            lead={
              <>
                {g.title}
                <br />
              </>
            }
            strong={`${g.items.length} ${g.items.length === 1 ? noun : `${noun}s`}`}
          />
          <ul role="list" className="mt-6 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {g.items.map((it) => (
              <li key={it.path}>
                <Link
                  href={it.path}
                  className="group flex h-full items-center justify-between gap-3 rounded-[16px] bg-white px-5 py-4 font-inter text-[15.5px] text-ndm-ink ring-1 ring-ndm-ink/[.06] transition-shadow hover:shadow-[0_24px_50px_-30px_rgba(27,36,43,.45)]"
                >
                  <span className="min-w-0">{it.title}</span>
                  <IconArrow size={13} className="shrink-0 text-ndm-deep transition-transform group-hover:translate-x-1" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section aria-label="Book a free consultation" className="px-[var(--gx)] pt-[clamp(44px,5vw,72px)] pb-[clamp(64px,7vw,110px)]">
        <p className="max-w-[60ch] font-inter text-[15.5px] leading-[1.6] text-ndm-muted">Not sure where to start? Your provider confirms which treatment may suit you at a free consultation. Individual results may vary.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button href={ACTIONS.book} v="book">
            Book Free Consultation
          </Button>
          <Link href="/pricing" className="btn btn-line">
            <span>All treatment prices</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
