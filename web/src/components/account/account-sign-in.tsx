"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent, type ReactNode } from "react";
import { registerAction, requestResetAction, resetPasswordAction, signInAction, type AccountResult } from "@/app/(site)/account/actions";
import { FIELD } from "@/components/checkout/shared";
import { Button } from "@/components/ui/button";
import { SiteLink } from "@/components/ui/site-link";
import { pageLink } from "@/lib/routes";

/**
 * The door of "My account": sign in, create an account, or ask for a link to choose a new password.
 * The account is a WooCommerce customer; the forms send to server actions, never to WordPress directly.
 */

const LABEL = "mb-1 block font-inter text-[12.5px] font-medium text-ndm-ink/80";
const FLD = `${FIELD} co-fld`;
const CARD = "rounded-[24px] bg-white p-[clamp(18px,2.2vw,28px)] ring-1 ring-ndm-ink/[.06] shadow-[0_24px_50px_-42px_rgba(27,36,43,.45)]";
const LINK = "font-medium text-ndm-deep hover:underline";

/** A short answer under a form: green when it worked, red when it did not. */
export function AccNote({ result }: { result: AccountResult | null }) {
  if (!result || !("message" in result) || !result.message) return null;
  return (
    <p role={result.ok ? "status" : "alert"} className={`mt-4 rounded-[12px] px-4 py-3 font-inter text-[13.5px] leading-[1.5] ${result.ok ? "bg-[#ECF8F1] text-[#14532D]" : "bg-[#FDECEC] text-[#7F1D1D]"}`}>
      {result.message}
    </p>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className={LABEL}>{label}</span>
      {children}
    </label>
  );
}

type Mode = "signin" | "register" | "forgot";

export function AccountSignIn({ ready }: { ready: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [result, setResult] = useState<AccountResult | null>(null);
  const [busy, start] = useTransition();
  const pick = (m: Mode) => {
    setMode(m);
    setResult(null);
  };

  const send = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const v = (k: string) => String(f.get(k) ?? "");
    start(async () => {
      const answer =
        mode === "signin"
          ? await signInAction({ email: v("email"), password: v("password") })
          : mode === "register"
            ? await registerAction({ first: v("first"), last: v("last"), email: v("email"), password: v("password"), agree: f.get("agree") === "on", company: v("company") })
            : await requestResetAction({ email: v("email") });
      setResult(answer);
      if (answer.ok && mode !== "forgot") router.refresh();
    });
  };

  const title = mode === "signin" ? "Sign in" : mode === "register" ? "Create your account" : "Choose a new password";
  const lead =
    mode === "signin"
      ? "See your orders and saved plans, and keep your details up to date."
      : mode === "register"
        ? "One account for your order requests, saved plans and details."
        : "Enter the email address of your account. We will send a link to choose a new password.";

  return (
    <section aria-labelledby="acc-title" className="px-[var(--gx)] pb-[clamp(72px,8vw,120px)] pt-[clamp(8px,1.4vw,20px)]">
      <h1 id="acc-title" className="font-aeonik text-[clamp(36px,4vw,56px)] font-normal leading-[1.05] tracking-[-0.03em] text-ndm-ink">
        My account
      </h1>
      <div className={`${CARD} mt-[clamp(20px,2.6vw,32px)] max-w-[560px]`}>
        {mode !== "forgot" && (
          <div role="tablist" aria-label="Account" className="mb-6 inline-flex gap-1 rounded-full bg-ndm-mist p-1">
            {(
              [
                ["signin", "Sign in"],
                ["register", "Create account"],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={mode === k}
                onClick={() => pick(k)}
                className={`rounded-full px-4 py-2 font-inter text-[14px] transition-colors ${mode === k ? "bg-ndm-deep font-medium text-white" : "text-ndm-ink/80 hover:text-ndm-ink"}`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
        <h2 className="font-aeonik text-[clamp(26px,2.4vw,34px)] font-normal leading-[1.1] tracking-[-0.025em] text-ndm-ink">{title}</h2>
        <p className="mt-2 font-inter text-[15px] leading-[1.6] text-ndm-muted">{lead}</p>

        {!ready ? (
          <p role="status" className="mt-5 rounded-[12px] bg-[#FFF6E6] px-4 py-3 font-inter text-[13.5px] leading-[1.5] text-[#713F12]">
            Accounts are not available right now. Please try again later, or call the clinic.
          </p>
        ) : (
          <form key={mode} onSubmit={send} className="mt-5 grid gap-3">
            {mode === "register" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="First name">
                  <input name="first" required maxLength={60} autoComplete="given-name" className={FLD} />
                </Field>
                <Field label="Last name">
                  <input name="last" required maxLength={60} autoComplete="family-name" className={FLD} />
                </Field>
              </div>
            )}
            <Field label="Email">
              <input name="email" type="email" required maxLength={120} autoComplete="email" className={FLD} />
            </Field>
            {mode !== "forgot" && (
              <Field label={mode === "register" ? "Password (at least 8 characters)" : "Password"}>
                <input name="password" type="password" required minLength={mode === "register" ? 8 : undefined} maxLength={128} autoComplete={mode === "register" ? "new-password" : "current-password"} className={FLD} />
              </Field>
            )}
            {mode === "register" && (
              <>
                {/* left empty by people; filled in by form-filling robots */}
                <input name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
                <label className="mt-1 flex items-start gap-2.5 font-inter text-[13.5px] leading-[1.5] text-ndm-muted">
                  <input name="agree" type="checkbox" required className="mt-0.5 size-4 shrink-0 accent-[#0F80C3]" />
                  <span>
                    I agree to the{" "}
                    <SiteLink to={pageLink("terms")} className={LINK}>
                      Terms
                    </SiteLink>{" "}
                    and the{" "}
                    <SiteLink to={pageLink("privacy")} className={LINK}>
                      Privacy Policy
                    </SiteLink>
                    .
                  </span>
                </label>
              </>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Button as="button" type="submit" v="ink" sm disabled={busy}>
                {busy ? "One moment" : mode === "signin" ? "Sign in" : mode === "register" ? "Create account" : "Send the link"}
              </Button>
              {mode === "signin" && (
                <button type="button" onClick={() => pick("forgot")} className={`font-inter text-[14px] ${LINK}`}>
                  Forgot your password?
                </button>
              )}
              {mode === "forgot" && (
                <button type="button" onClick={() => pick("signin")} className={`font-inter text-[14px] ${LINK}`}>
                  Back to sign in
                </button>
              )}
            </div>
          </form>
        )}
        <AccNote result={result} />
      </div>
    </section>
  );
}

/** The page a reset link opens: choose the new password, then sign in with it. */
export function AccountReset({ login, resetKey }: { login: string; resetKey: string }) {
  const [result, setResult] = useState<AccountResult | null>(null);
  const [busy, start] = useTransition();
  const usable = Boolean(login && resetKey);
  const send = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    start(async () => setResult(await resetPasswordAction({ login, key: resetKey, password: String(f.get("password") ?? ""), again: String(f.get("again") ?? "") })));
  };
  return (
    <section aria-labelledby="acc-title" className="px-[var(--gx)] pb-[clamp(72px,8vw,120px)] pt-[clamp(8px,1.4vw,20px)]">
      <h1 id="acc-title" className="font-aeonik text-[clamp(36px,4vw,56px)] font-normal leading-[1.05] tracking-[-0.03em] text-ndm-ink">
        Choose a new password
      </h1>
      <div className={`${CARD} mt-[clamp(20px,2.6vw,32px)] max-w-[560px]`}>
        {!usable ? (
          <p className="font-inter text-[15px] leading-[1.6] text-ndm-muted">This link is not complete. Please open the link from your email again, or ask for a new one.</p>
        ) : result?.ok ? null : (
          <form onSubmit={send} className="grid gap-3">
            <Field label="New password (at least 8 characters)">
              <input name="password" type="password" required minLength={8} maxLength={128} autoComplete="new-password" className={FLD} />
            </Field>
            <Field label="Confirm new password">
              <input name="again" type="password" required minLength={8} maxLength={128} autoComplete="new-password" className={FLD} />
            </Field>
            <div className="mt-2">
              <Button as="button" type="submit" v="ink" sm disabled={busy}>
                {busy ? "One moment" : "Save new password"}
              </Button>
            </div>
          </form>
        )}
        <AccNote result={result} />
        {(result?.ok || !usable) && (
          <p className="mt-5">
            <Button href={pageLink("account").href} v="ink" sm>
              Go to sign in
            </Button>
          </p>
        )}
      </div>
    </section>
  );
}
