"use client";

import { useRef, useState } from "react";
import { BlurTitle } from "@/components/blog/blur-title";
import { StoryCard } from "@/components/blog/story";
import { useRevealLive } from "@/components/blog/use-reveal-live";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { BLOG_STEP } from "@/config/blog";
import { useReveal } from "@/hooks/use-reveal";
import type { Story } from "@/types/blog";

/** Latest stories: topic filters with counts, a three-up grid, and "Load more". */
export function LatestStories({ posts, topics }: { posts: Story[]; topics: string[] }) {
  const section = useRef<HTMLElement>(null);
  const grid = useRef<HTMLUListElement>(null);
  const [topic, setTopic] = useState("All");
  const [shown, setShown] = useState(BLOG_STEP);
  const list = topic === "All" ? posts : posts.filter((p) => p.topic === topic);
  const view = list.slice(0, shown);
  useReveal(section);
  useRevealLive(grid, `${topic}:${shown}`);
  return (
    <section ref={section} id="stories" aria-labelledby="stories-title" className="relative z-10 scroll-mt-[100px] bg-ndm-paper px-[var(--gx)] py-[clamp(80px,9vw,128px)]">
      <div className="mx-auto max-w-[1320px]">
        <Eyebrow className="rv">Latest stories</Eyebrow>
        <BlurTitle id="stories-title" className="mt-5 max-w-[18ch]" lead="Ideas for healthier," strong="more confident skin." />
        <div className="rv no-scrollbar -mx-[var(--gx)] mt-9 flex gap-2 overflow-x-auto px-[var(--gx)] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0" role="group" aria-label="Filter by topic" style={{ transitionDelay: ".15s" }}>
          {topics.map((t) => {
            const count = t === "All" ? posts.length : posts.filter((p) => p.topic === t).length;
            const on = t === topic;
            return (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTopic(t);
                  setShown(BLOG_STEP);
                }}
                aria-pressed={on}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 font-inter text-[14px] transition-colors ${on ? "bg-ndm-ink text-white" : "bg-white text-ndm-ink ring-1 ring-ndm-ink/10 hover:ring-ndm-ink/30"}`}
              >
                {t}
                <span className={`text-[12px] tabular-nums ${on ? "text-white/60" : "text-ndm-muted"}`}>{count}</span>
              </button>
            );
          })}
        </div>
        <ul ref={grid} key={topic} className="mt-[clamp(36px,4vw,56px)] grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list" aria-live="polite">
          {view.map((p, i) => (
            <StoryCard key={p.slug} p={p} i={i} />
          ))}
        </ul>
        {list.length > shown && (
          <div className="mt-[clamp(48px,5vw,72px)] flex flex-col items-center gap-3">
            <p className="font-inter text-[13.5px] text-ndm-muted">
              Showing {view.length} of {list.length} stories
            </p>
            <Button v="line" onClick={() => setShown((s) => s + BLOG_STEP)}>
              Load more stories
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
