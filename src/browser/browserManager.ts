import { chromium, Browser, BrowserContext, Page } from "playwright";
import crypto from "crypto";

import type {
  BrowserElement,
  BrowserTabInfo,
  ManagedTab,
} from "../cofig/types";

export class BrowserManager {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;

  private tabs = new Map<string, ManagedTab>();
  private activeTabId: string | null = null;

  async start(): Promise<void> {
    if (this.browser) {
      return;
    }

   this.browser = await chromium.launch({
    executablePath: "/usr/bin/brave-browser",
    headless: false,
});

    this.context = await this.browser.newContext();

    this.context.on("page", (page) => {
      void this.registerPage(page);
    });

    const page = await this.context.newPage();

    await this.registerPage(page);

    console.log("Browser started");
  }

  async stop(): Promise<void> {
    if (!this.browser) {
      return;
    }

    await this.browser.close();

    this.tabs.clear();

    this.browser = null;
    this.context = null;

    console.log("Browser stopped");
  }

  private async registerPage(
    page: Page,
    openerTabId?: string,
  ): Promise<string> {
    const existing = this.findTabByPage(page);

    if (existing) {
      return existing.info.id;
    }

    const id = crypto.randomUUID();

    const info: BrowserTabInfo = {
      id,
      url: page.url(),
      title: await this.getPageTitle(page),
      openerTabId,
      createdAt: Date.now(),
      lastUpdatedAt: Date.now(),
      isClosed: false,
    };

    const tab: ManagedTab = {
      info,
      page,
    };

    this.tabs.set(id, tab);

    this.attachPageListeners(id, page);

    console.log(`[Browser] registered tab ${id} | ${info.url}`);

    return id;
  }

  private attachPageListeners(tabId: string, page: Page): void {
    page.on("framenavigated", async (frame) => {
      if (frame !== page.mainFrame()) {
        return;
      }

      await this.updateTabInfo(tabId);
    });

    page.on("close", () => {
      const tab = this.tabs.get(tabId);

      if (!tab) {
        return;
      }

      tab.info.isClosed = true;

      this.tabs.delete(tabId);

      console.log(`[Browser] tab closed ${tabId}`);
    });
  }

  private async updateTabInfo(tabId: string): Promise<void> {
    const tab = this.tabs.get(tabId);

    if (!tab) {
      return;
    }

    tab.info.url = tab.page.url();
    tab.info.title = await this.getPageTitle(tab.page);
    tab.info.lastUpdatedAt = Date.now();
  }

  private async getPageTitle(page: Page): Promise<string> {
    try {
      return await page.title();
    } catch {
      return "";
    }
  }

  private findTabByPage(page: Page): ManagedTab | undefined {
    for (const tab of this.tabs.values()) {
      if (tab.page === page) {
        return tab;
      }
    }

    return undefined;
  }

  private getTab(tabId: string): ManagedTab {
    const tab = this.tabs.get(tabId);

    if (!tab) {
      throw new Error(`Unknown tab: ${tabId}`);
    }

    if (tab.page.isClosed()) {
      throw new Error(`Tab ${tabId} is already closed`);
    }

    return tab;
  }

  async openTab(url?: string): Promise<BrowserTabInfo> {
    if (!this.context) {
      throw new Error("Browser is not started");
    }

    const page = await this.context.newPage();

    const tabId = await this.registerPage(page);

    if (url) {
      await page.goto(url, {
        waitUntil: "domcontentloaded",
      });

      await this.updateTabInfo(tabId);
    }

    return this.getTab(tabId).info;
  }
  async navigateTab(tabId: string, url: string): Promise<BrowserTabInfo> {
    const tab = this.getTab(tabId);

    await tab.page.goto(url, {
      waitUntil: "domcontentloaded",
    });

    await this.updateTabInfo(tabId);

    return tab.info;
  }

  async fillInput(
    tabId: string,
    elementId: string,
    value: string,
  ): Promise<void> {
    const tab = this.getTab(tabId);

    const input = tab.page.locator(`[data-nova-element-id="${elementId}"]`);

    await input.waitFor({
      state: "visible",
    });

    await input.fill(value);
  }

  async pressKeyOn(
    tabId: string,
    elementId: string,
    key: string,
  ): Promise<void> {
    const tab = this.getTab(tabId);

    const element = tab.page.locator(`[data-nova-element-id="${elementId}"]`);

    await element.waitFor({
      state: "visible",
    });

    await element.press(key);
  }

  async click(tabId: string, elementId: string): Promise<void> {
    const tab = this.getTab(tabId);

    const element = tab.page.locator(`[data-nova-element-id="${elementId}"]`);

    await element.waitFor({
      state: "visible",
    });

    await element.click();
  }

  async getPageText(tabId: string): Promise<string> {
    const tab = this.getTab(tabId);

    return await tab.page.locator("body").innerText();
  }
  async getVideoResults(
    tabId: string,
    limit: number = 20,
  ): Promise<
    Array<{
      title: string;
      url: string;
    }>
  > {
    const tab = this.getTab(tabId);

    const results = await tab.page
      .locator('a[href^="/watch"]')
      .evaluateAll((links) => {
        return links.map((link) => ({
          title: (link.textContent ?? "").trim(),
          url: (link as HTMLAnchorElement).href,
        }));
      });

    const unique = new Map<
      string,
      {
        title: string;
        url: string;
      }
    >();

    for (const result of results) {
      if (!result.title) {
        continue;
      }

      if (!unique.has(result.url)) {
        unique.set(result.url, result);
      }
    }

    return Array.from(unique.values()).slice(0, limit);
  }

  async openVideoResult(
    tabId: string,
    results: Array<{
      title: string;
      url: string;
    }>,
    index: number,
  ): Promise<BrowserTabInfo> {
    if (index < 0 || index >= results.length) {
      throw new Error(`Invalid result index: ${index}`);
    }

    const result = results[index];

    console.log(`[Browser] Opening result ${index + 1}: ${result.title}`);

    return await this.navigateTab(tabId, result.url);
  }
  async getInteractiveElements(
    tabId: string,
    role?: BrowserElement["role"],
    limit: number = 5,
  ): Promise<BrowserElement[]> {
    const tab = this.getTab(tabId);

    return await tab.page
      .locator("a, button, input, textarea, select")
      .evaluateAll(
        (elements, options) => {
          const results: BrowserElement[] = [];

          for (const element of elements) {
            const rect = element.getBoundingClientRect();
            const style = window.getComputedStyle(element);

            // 1. Ignore invisible elements
            const visible =
              rect.width > 0 &&
              rect.height > 0 &&
              style.display !== "none" &&
              style.visibility !== "hidden" &&
              style.opacity !== "0";

            if (!visible) continue;

            // 2. Ignore disabled elements
            const disabled =
              element instanceof HTMLButtonElement ||
              element instanceof HTMLInputElement ||
              element instanceof HTMLSelectElement ||
              element instanceof HTMLTextAreaElement
                ? element.disabled
                : false;

            if (disabled) continue;

            const tag = element.tagName.toLowerCase();

            // 3. Ignore file inputs
            if (
              element instanceof HTMLInputElement &&
              element.type === "file"
            ) {
              continue;
            }

            // 4. Determine role
            let currentRole: BrowserElement["role"];
            let actions: string[];

            switch (tag) {
              case "a":
                currentRole = "link";
                actions = ["click"];
                break;

              case "button":
                currentRole = "button";
                actions = ["click"];
                break;

              case "input":
              case "textarea":
                currentRole = "textbox";
                actions = ["fill", "press"];
                break;

              case "select":
                currentRole = "select";
                actions = ["select"];
                break;

              default:
                continue;
            }

            // 5. Filter by requested role
            if (options.role && currentRole !== options.role) {
              continue;
            }

            // 6. Get useful identifying information
            const ariaLabel = element.getAttribute("aria-label")?.trim() || "";

            const placeholder =
              element.getAttribute("placeholder")?.trim() || "";

            const title = element.getAttribute("title")?.trim() || "";

            const nameAttribute = element.getAttribute("name")?.trim() || "";

            const text = (element.textContent ?? "")
              .replace(/\s+/g, " ")
              .trim()
              .slice(0, 100);

            // 7. Reject garbage-looking text
            const looksLikeCode =
              text.includes("{") ||
              text.includes("}") ||
              text.includes("display:") ||
              text.includes("position:") ||
              text.includes("var(--") ||
              text.includes("cubic-bezier") ||
              text.length > 100;

            const cleanText = looksLikeCode ? "" : text;

            // 8. Choose name
            const name =
              ariaLabel || placeholder || title || cleanText || nameAttribute;

            if (!name) continue;

            // 9. Create element ID
            const elementId = `e${results.length + 1}`;

            element.setAttribute("data-nova-element-id", elementId);

            const browserElement: BrowserElement = {
              id: elementId,
              role: currentRole,
              name,
              actions,
            };

            // 10. Add URL for links
            if (element instanceof HTMLAnchorElement) {
              browserElement.url = element.href;
            }

            results.push(browserElement);

            // 11. Stop once limit is reached
            if (results.length >= options.limit) {
              break;
            }
          }

          return results;
        },
        {
          role,
          limit,
        },
      );
  }
  async goBack(tabId: string): Promise<void> {
    const tab = this.getTab(tabId);

    await tab.page.goBack();
  }
  async switchTab(tabId: string): Promise<void> {
    const tab = this.getTab(tabId);

    await tab.page.bringToFront();

    this.activeTabId = tabId;
  }
  async closeTab(tabId: string): Promise<void> {
    const tab = this.getTab(tabId);

    await tab.page.close();

    this.tabs.delete(tabId);

    if (this.activeTabId === tabId) {
      this.activeTabId = null;
    }
  }
}
