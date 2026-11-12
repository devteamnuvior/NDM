import type { Metadata } from "next";
import { unstable_rethrow } from "next/navigation";
import { Suspense } from "react";
import { ManagerFrame } from "@/components/pricing-admin/manager-frame";
import { PromotionsManager } from "@/components/promotions-admin/promotions-manager";
import { Eyebrow } from "@/components/ui/eyebrow";
import { offerPriceChoices } from "@/lib/offers";
import { getPricingSession, isPricingAdminConfigured } from "@/lib/pricing-admin/session";
import { WordPressError, getAdminPromotions, getPricingTree } from "@/lib/wordpress";

export const metadata: Metadata = { title: "Promotions manager, NewDermaMed" };

const PROBLEMS: Record<string, string> = {
  setup: "The management screens are not set up on this server yet (PRICING_ADMIN_SECRET, SITE_URL or WORDPRESS_API_URL is missing).",
  declined: "The sign-in was not approved in WordPress.",
  expired: "That sign-in could not be confirmed. Please start again.",
  forbidden: "That WordPress account may not manage the offers. Ask an administrator for the Shop manager role.",
  unreachable: "WordPress could not be reached. Please try again in a moment.",
};

function Panel({ title, text, problem, signIn }: { title: string; text: string; problem?: string; signIn?: boolean }) {
  return (
    <ManagerFrame>
      <div className="w-full max-w-[520px] rounded-[26px] bg-white px-7 py-9 text-center shadow-[0_24px_60px_-30px_rgba(27,36,43,.35)]">
        <Eyebrow>Promotions manager</Eyebrow>
        <h1 className="mt-5 font-aeonik text-[clamp(28px,3vw,36px)] leading-[1.1] tracking-[-0.025em] text-ndm-ink">{title}</h1>
        <p className="mx-auto mt-4 max-w-[40ch] font-inter text-[15px] leading-[1.6] text-ndm-muted">{text}</p>
        {problem && (
          <p role="alert" className="mt-5 rounded-[12px] bg-[#FDECEA] px-4 py-3 font-inter text-[14px] text-[#B42318]">
            {problem}
          </p>
        )}
        {signIn && (
          /* a plain link on purpose: it must be a full request, never prefetched */
          <a href="/manage/pricing/auth/start?to=promotions" className="btn btn-ink mt-7">
            <span>Sign in with WordPress</span>
          </a>
        )}
      </div>
    </ManagerFrame>
  );
}

const SIGN_IN_TEXT = "For NewDermaMed administrators. You sign in on WordPress itself and approve access; your password is never entered on this site.";

/** Decides, on every request, what this visitor may see: the sign-in, or the manager with fresh WooCommerce data. */
async function Screen({ searchParams }: { searchParams: Promise<{ problem?: string | string[] }> }) {
  const { problem } = await searchParams;
  const known = typeof problem === "string" ? PROBLEMS[problem] : undefined;

  if (!isPricingAdminConfigured()) return <Panel title="Not set up yet" text={PROBLEMS.setup} />;

  const session = await getPricingSession();
  if (!session) return <Panel title="Sign in to manage offers" text={SIGN_IN_TEXT} problem={known} signIn />;

  let offers;
  let tree;
  try {
    /* the offers with this person's own credentials (WordPress decides); the prices are the public list's */
    [offers, tree] = await Promise.all([getAdminPromotions(session.authorization), getPricingTree()]);
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof WordPressError && error.kind === "http" && (error.status === 401 || error.status === 403)) {
      return <Panel title="Sign in to manage offers" text={SIGN_IN_TEXT} problem={error.status === 403 ? PROBLEMS.forbidden : "Your sign-in has ended. Please sign in again."} signIn />;
    }
    return <Panel title="WooCommerce is not answering" text="The offers could not be loaded, so nothing can be changed right now. Please reload this page in a moment." />;
  }

  return <PromotionsManager offers={offers} prices={Object.fromEntries(offerPriceChoices(tree))} user={session.name} csrf={session.csrf} />;
}

export default function PromotionsManagePage({ searchParams }: PageProps<"/manage/promotions">) {
  return (
    <main id="main" data-shell="inner" className="seamless">
      <Suspense fallback={<Panel title="Loading" text="Checking your sign-in and reading the offers from WooCommerce." />}>
        <Screen searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
