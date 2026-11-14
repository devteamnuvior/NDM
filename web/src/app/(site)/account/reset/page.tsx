import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountReset } from "@/components/account/account-sign-in";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export const metadata: Metadata = {
  title: "Choose a new password, NewDermaMed Toronto",
  robots: { index: false, follow: false },
  /* the link's key must not travel on to other sites */
  referrer: "no-referrer",
};

const one = (value: string | string[] | undefined): string => (typeof value === "string" ? value : "");

async function Content({ searchParams }: { searchParams: Promise<{ key?: string | string[]; login?: string | string[] }> }) {
  const { key, login } = await searchParams;
  return <AccountReset login={one(login)} resetKey={one(key)} />;
}

/** The page the "choose a new password" email opens. */
export default function Page({ searchParams }: { searchParams: Promise<{ key?: string | string[]; login?: string | string[] }> }) {
  return (
    <main id="main" data-shell="inner" data-page="account" className="pt-[176px] xl:pt-[204px]">
      <Breadcrumb items={["My account", "New password"]} />
      <Suspense fallback={null}>
        <Content searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
