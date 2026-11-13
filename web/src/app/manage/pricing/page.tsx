import { unstable_rethrow } from "next/navigation";
import { Suspense } from "react";
import { ManagerFrame } from "@/components/pricing-admin/manager-frame";
import { PricingManager } from "@/components/pricing-admin/pricing-manager";
import { Eyebrow } from "@/components/ui/eyebrow";
import { getPricingSession, isPricingAdminConfigured, wordpressBase } from "@/lib/pricing-admin/session";
import { WordPressError, getPricingAdminTree } from "@/lib/wordpress";
import { withBase } from "@/lib/base-path";

const PROBLEMS: Record<string, string> = {
  setup: "The pricing manager is not set up on this server yet (PRICING_ADMIN_SECRET, SITE_URL or WORDPRESS_API_URL is missing).",
  declined: "The sign-in was not approved in WordPress.",
  expired: "That sign-in could not be confirmed. Please start again.",
  forbidden: "That WordPress account may not manage the price list. Ask an administrator for the Shop manager role.",
  unreachable: "WordPress could not be reached. Please try again in a moment.",
};

function Panel({ title, text, problem, signIn }: { title: string; text: string; problem?: string; signIn?: boolean }) {
  return (
    <ManagerFrame>
      <div className="w-full max-w-[520px] rounded-[26px] bg-white px-7 py-9 text-center shadow-[0_24px_60px_-30px_rgba(27,36,43,.35)]">
        <Eyebrow>Pricing manager</Eyebrow>
        <h1 className="mt-5 font-aeonik text-[clamp(28px,3vw,36px)] leading-[1.1] tracking-[-0.025em] text-ndm-ink">{title}</h1>
        <p className="mx-auto mt-4 max-w-[40ch] font-inter text-[15px] leading-[1.6] text-ndm-muted">{text}</p>
        {problem && (
          <p role="alert" className="mt-5 rounded-[12px] bg-[#FDECEA] px-4 py-3 font-inter text-[14px] text-[#B42318]">
            {problem}
          </p>
        )}
        {signIn && (
          /* a plain link on purpose: it must be a full request, never prefetched */
          <a href={withBase("/manage/pricing/auth/start")} className="btn btn-ink mt-7">
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
  if (!session) return <Panel title="Sign in to manage prices" text={SIGN_IN_TEXT} problem={known} signIn />;

  let tree;
  try {
    tree = await getPricingAdminTree(session.authorization);
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof WordPressError && error.kind === "http" && (error.status === 401 || error.status === 403)) {
      /* access was revoked in WordPress, or the role changed: the old cookie opens nothing */
      return <Panel title="Sign in to manage prices" text={SIGN_IN_TEXT} problem={error.status === 403 ? PROBLEMS.forbidden : "Your sign-in has ended. Please sign in again."} signIn />;
    }
    return <Panel title="WooCommerce is not answering" text="The price list could not be loaded, so nothing can be changed right now. Please reload this page in a moment." />;
  }

  return <PricingManager tree={tree} user={session.name} csrf={session.csrf} wpAdmin={wordpressBase()} />;
}

export default function PricingManagePage({ searchParams }: PageProps<"/manage/pricing">) {
  return (
    <main id="main" data-shell="inner" className="seamless">
      <Suspense fallback={<Panel title="Loading" text="Checking your sign-in and reading the price list from WooCommerce." />}>
        <Screen searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
