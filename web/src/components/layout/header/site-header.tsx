"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useEffectEvent, useState } from "react";
import { AnnouncementBar } from "@/components/layout/header/announcement-bar";
import { FloatSearch } from "@/components/layout/header/float-search";
import { HeaderBar } from "@/components/layout/header/header-bar";
import { CartPill } from "@/components/cart/cart-pill";
import { DARK_START_PAGES } from "@/config/navigation";
import { useCart } from "@/hooks/use-cart";
import { useNavTone } from "@/hooks/use-nav-tone";
import { lockScroll } from "@/lib/scroll-lock";
import { OPEN_SEARCH_EVENT } from "@/lib/site-events";
import { pageFromPathname } from "@/lib/routes";

/* The overlays are only needed once someone opens them: their code is split out of the page's first load. */
const MobileDrawer = dynamic(() => import("@/components/layout/header/mobile-drawer").then((m) => m.MobileDrawer), { ssr: false });
/* the chat only exists in the browser: it is fetched after the page is interactive */
const ChatBot = dynamic(() => import("@/components/chat/chat-bot").then((m) => m.ChatBot), { ssr: false });
/* the Black Friday tab reads the clock, so it too only exists in the browser */
const BfDock = dynamic(() => import("@/components/black-friday/bf-dock").then((m) => m.BfDock), { ssr: false });
const CartDrawer = dynamic(() => import("@/components/cart/cart-drawer").then((m) => m.CartDrawer), { ssr: false });
const SearchOverlay = dynamic(() => import("@/components/layout/header/search-overlay").then((m) => m.SearchOverlay), { ssr: false });

/** Height of the announcement bar: the header sits right below it. */
const ANNOUNCEMENT_HEIGHT = 36;

/**
 * Everything fixed to the top of every page: the announcement bar, the header with its menus, the phone
 * menu, search, the cart drawer and the floating cart bar. It owns the small amount of state they share (which overlay is open, header tone).
 */
export function SiteHeader() {
  const pathname = usePathname();
  const current = pageFromPathname(pathname);
  /* a page that opens on a dark hero starts with the dark header */
  const dark = useNavTone(!!current && DARK_START_PAGES.includes(current), pathname);
  const cart = useCart();
  const [search, setSearch] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  /* mount each overlay the first time it is needed, and keep it mounted so it can animate out */
  const [used, setUsed] = useState({ search: false, drawer: false, cart: false });

  useEffect(() => {
    lockScroll(search || drawer || cartOpen);
  }, [search, drawer, cartOpen]);

  const openSearch = () => {
    setUsed((u) => ({ ...u, search: true }));
    setSearch(true);
  };
  /* any section can ask for search (see lib/site-events) */
  const onOpenSearch = useEffectEvent(openSearch);
  useEffect(() => {
    const on = () => onOpenSearch();
    window.addEventListener(OPEN_SEARCH_EVENT, on);
    return () => window.removeEventListener(OPEN_SEARCH_EVENT, on);
  }, []);
  const openCart = () => {
    setUsed((u) => ({ ...u, cart: true }));
    setCartOpen(true);
  };
  const openDrawer = () => {
    setUsed((u) => ({ ...u, drawer: true }));
    setDrawer(true);
  };

  return (
    <>
      <AnnouncementBar />
      <HeaderBar
        dark={dark}
        current={current}
        top={ANNOUNCEMENT_HEIGHT}
        cartCount={cart.count}
        onSearch={openSearch}
        onDrawer={openDrawer}
        onCart={openCart}
      />
      {used.search && <SearchOverlay open={search} onClose={() => setSearch(false)} />}
      {used.drawer && <MobileDrawer open={drawer} current={current} onClose={() => setDrawer(false)} />}
      {used.cart && <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />}
      <CartPill onOpen={openCart} hidden={cartOpen || drawer || search} />
      <FloatSearch onOpen={openSearch} hidden={search || drawer || cartOpen} />
      <ChatBot hidden={cartOpen || drawer || search} />
      <BfDock />
    </>
  );
}
