import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ElementType, HTMLAttributes, ReactNode, Ref } from "react";
import { IconArrow } from "@/components/ui/icons";
import { withBase } from "@/lib/base-path";

export type ButtonVariant = "ink" | "line" | "light" | "glass" | "book";

interface ButtonStyleProps {
  /** `book` is the Book Free Consultation button: it keeps one size and its arrow dot everywhere. */
  v?: ButtonVariant;
  sm?: boolean;
  block?: boolean;
  /** Amber fill (book only). */
  hot?: boolean;
  /** White fill for dark photos and panels (book only). */
  onDark?: boolean;
  className?: string;
  children: ReactNode;
  /** The underlying element, for moving focus to the button. */
  ref?: Ref<HTMLElement>;
}

type ButtonProps = ButtonStyleProps &
  (
    | ({ as?: "a"; href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children" | "href">)
    | ({ as: "span"; href?: undefined } & Omit<HTMLAttributes<HTMLSpanElement>, "className" | "children">)
    | ({ as?: "button"; href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">)
  );

/** The site's one button. Renders a link when it has an `href`, a `span` inside another link, else a button. */
export function Button({ v = "ink", sm, block, hot, onDark, className = "", children, ...rest }: ButtonProps) {
  const book = v === "book";
  const cls = [
    "btn",
    `btn-${v}`,
    book && hot ? "btn-hot" : "",
    book && onDark ? "btn-on-dark" : "",
    sm && !book ? "btn-sm" : "",
    block ? "btn-block" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const inner = (
    <>
      <span>{children}</span>
      {book && (
        <span className="btn-dot" aria-hidden="true">
          <IconArrow size={13} />
        </span>
      )}
    </>
  );

  const { as, ...p } = rest;
  const Tag = (as ?? (p.href !== undefined ? "a" : "button")) as ElementType;
  /* an address of this site gets the folder the site is served from ("/react") */
  if (typeof p.href === "string") p.href = withBase(p.href);
  return (
    <Tag className={cls} {...p}>
      {inner}
    </Tag>
  );
}
