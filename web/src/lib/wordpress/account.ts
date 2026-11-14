import "server-only";
import { wpFetch } from "./client";

/**
 * Customer accounts: WooCommerce customers, through the ndm-pricing plugin's `ndm/v1/account/*`
 * routes. Every call is made with the site's own WordPress account and is never cached. `who` is the
 * signed-in customer (ID and stamp from the session cookie); WordPress answers 401 when that sign-in
 * has ended (the password changed, or the account is gone).
 */

export interface AccountWho {
  id: number;
  stamp: string;
}

export interface AccountNotify {
  offers: boolean;
  news: boolean;
  events: boolean;
}

export interface AccountOrder {
  /** WooCommerce order number. */
  number: string;
  /** ISO 8601. */
  date: string;
  /** WooCommerce status: "on-hold", "processing", "completed"... and its name as WooCommerce shows it. */
  status: string;
  statusName: string;
  /** "NewDermaMed Uptown", empty for an order that names no clinic. */
  clinic: string;
  items: { name: string; qty: number }[];
  /** The order's own total in WooCommerce. */
  total: number;
}

export interface AccountData extends AccountWho {
  first: string;
  last: string;
  email: string;
  phone: string;
  /** "Uptown", "Downtown" or empty. */
  clinic: string;
  notify: AccountNotify;
  since: string;
  orders: AccountOrder[];
}

export interface AccountProfileInput {
  first: string;
  last: string;
  email: string;
  phone: string;
  clinic: string;
}

const call = async <T>(path: string, body: unknown): Promise<T> => (await wpFetch<T>(`ndm/v1/account/${path}`, { auth: true, body, timeoutMs: 15_000 })).data;

export const accountSignIn = (email: string, password: string) => call<AccountWho>("sign-in", { email, password });
export const accountRegister = (input: { first: string; last: string; email: string; password: string }) => call<AccountWho>("register", input);
export const getAccount = (who: AccountWho) => call<AccountData>("view", who);
export const saveAccountProfile = (who: AccountWho, input: AccountProfileInput) => call<AccountData>("profile", { ...who, ...input });
export const saveAccountNotify = (who: AccountWho, notify: AccountNotify) => call<{ notify: AccountNotify }>("notifications", { ...who, notify });
export const changeAccountPassword = (who: AccountWho, current: string, password: string) => call<{ stamp: string }>("password", { ...who, current, password });
export const requestAccountReset = (email: string) => call<{ sent: boolean }>("reset-request", { email });
export const resetAccountPassword = (login: string, key: string, password: string) => call<{ done: boolean }>("reset", { login, key, password });
