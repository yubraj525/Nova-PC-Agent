export interface BrowserTabInfo {
  id: string;
  url: string;
  title: string;
  openerTabId?: string;
  createdAt: number;
  lastUpdatedAt: number;
  isClosed: boolean;
}

import type { Page } from "playwright";

export interface ManagedTab {
  info: BrowserTabInfo;
  page: Page;
}
export type BrowserElementRole =
  | "button"
  | "textbox"
  | "link"
  | "select";

export interface BrowserElement {
  id: string;
  role: BrowserElementRole;
  name: string;
  actions: string[];
  url?: string;
}