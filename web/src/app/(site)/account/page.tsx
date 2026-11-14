import type { Metadata } from "next";
import { unstable_rethrow } from "next/navigation";
import { Suspense } from "react";
import { AccountPage } from "@/components/account/account-page";
import { AccountSignIn } from "@/components/account/account-sign-in";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { getAccountSession, isAccountConfigured } from "@/lib/account/session";
import { WordPressError, getAccount } from "@/lib/wordpress";

export const metadata: Metadata = {
  title: "My account, NewDermaMed Toronto",
  description: "Your NewDermaMed account: orders, saved plans and your details.",
  robots: { index: false, follow: false },
};

/**
 * Decided on every request: the signed-in customer's account, read fresh from WooCommerce, or the
 * sign-in. A sign-in WordPress no longer accepts (the password changed, the account is gone) shows the
 * sign-in again; the stale cookie opens nothing and is replaced by the next sign-in.
 */
async function Content() {
  const ready = isAccountConfigured();
  const session = ready ? await getAccountSession() : null;
  if (!session) return <AccountSignIn ready={ready} />;
  let account;
  try {
    account = await getAccount(session);
  } catch (error) {
    unstable_rethrow(error);
    if (!(error instanceof WordPressError)) throw error;
    const ended = error.kind === "http" && error.status === 401 && error.code === "ndm_account_signed_out";
    if (!ended) console.error("[account] the account could not be read:", error.kind, error.status ?? "", error.code ?? "");
    return <AccountSignIn ready={ended} />;
  }
  return <AccountPage account={account} />;
}

export default function Page() {
  return (
    <main id="main" data-shell="inner" data-page="account" className="pt-[176px] xl:pt-[204px]">
      <Breadcrumb items={["My account"]} />
      <Suspense fallback={null}>
        <Content />
      </Suspense>
    </main>
  );
}
