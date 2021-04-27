import * as fs from "fs";
import * as path from "path";
import { chromium, ChromiumBrowser, ChromiumBrowserContext, Page } from "playwright-chromium";
import { exit } from "process";

export default class CorpusBuilder {
  readonly sessionPath = "corpus_builder_session.json";

  readonly loginUrl = "https://data.stackexchange.com/account/login";
  readonly startUrl = "https://data.stackexchange.com/sports/query/new";
  readonly corpus_CSVs = "corpus_CSVs";
  readonly blockedResourcesOnSubmit: Set<string> = new Set(["image", "font"]);

  getSession(): Array<{
    name: string;
    value: string;
    url?: string;
    domain?: string;
    path?: string;
    expires?: number;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "Strict" | "Lax" | "None";
  }> {
    const sessionString = fs.readFileSync(this.sessionPath).toString();
    const parsedSession = JSON.parse(sessionString);
    return parsedSession;
  }

  async restoreSession(browser: ChromiumBrowser): Promise<ChromiumBrowserContext> {
    const previousSession = fs.existsSync(this.sessionPath);
    const context = await browser.newContext({
      userAgent: "chrome",
      viewport: null,
      acceptDownloads: true
    });
    if (previousSession) {
      context.addCookies(this.getSession());
    }
    return context;
  }

  async saveSession(context: ChromiumBrowserContext): Promise<void> {
    const cookies = await context.cookies();
    fs.writeFile(this.sessionPath, JSON.stringify(cookies, null, 2), async (err) => {
      if (err) {
        console.log("Session information could not be written in", this.sessionPath);
      }
    });
  }

  async closeAllOtherTabs(context: ChromiumBrowserContext): Promise<void> {
    const pages = context.pages();
    for (let i = 1; i < pages.length; i++) {
      pages[i].close();
    }
  }

  async isLoggedIn(page: Page): Promise<boolean> {
    const querySelector = "a[href*=logout]";
    return (await page.$(querySelector)) !== null;
  }

  async login(): Promise<void> {
    let browser = await chromium.launch({ headless: false });
    const context = await this.restoreSession(browser);

    context.on("page", (_) => this.closeAllOtherTabs(context));
    const pages = context.pages();
    let page = pages.length > 0 ? pages[0] : await context.newPage();

    try {
      await page.goto(this.loginUrl);

      while (!(await this.isLoggedIn(page))) {
        await page.waitForNavigation({ timeout: 0 });
      }

      console.log("Succesful login!");
      await this.saveSession(context);
      await browser.close();
    } catch (e) {
      console.log("Unsuccesful login!");
      exit(0); // this helps to avoid printing any further errors
    }
  }

  async downloadAllCSVs(siteNames: string[]) {
    console.log("corpus recopilation started");
    let browser = await chromium.launch({ headless: true });
    const context = await this.restoreSession(browser);
    try {
      for (let i = 27; i < siteNames.length; i++) {
        const siteName = siteNames[i];
        await this.downloadSiteCSV(siteName, context);
      }
      await this.saveSession(context);
      await browser.close();
    } catch (e) {
      console.log(e);
      exit(0);
    }
  }

  async downloadSiteCSV(
    siteName: string,
    context: ChromiumBrowserContext,
    rowsCount: number = 5000
  ) {
    const pages = context.pages();
    let page = pages.length > 0 ? pages[0] : await context.newPage();

    await page.route("**/*", (route) => {
      if (this.blockedResourcesOnSubmit.has(route.request().resourceType())) {
        route.abort();
      } else {
        route.continue();
      }
    });

    const siteUrl = `https://data.stackexchange.com/${siteName}/query/new`;

    await page.goto(siteUrl);

    if (!(await this.isLoggedIn(page))) {
      await this.login();
      await context.clearCookies();
      await context.addCookies(this.getSession());
      await page.goto(siteUrl);
    }

    try {
      let editorPanelElem = await page.$(".CodeMirror-lines");
      await editorPanelElem.click();
      await page.keyboard.type(
        `select top(${rowsCount}) title, tags from posts where title is not null;`
      );
      let submitElem = await page.$("#submit-query");
      await submitElem.click();
      const [download] = await Promise.all([
        page.waitForEvent("download"), // wait for download to start
        page.click("#resultSetsButton")
      ]);

      if (!fs.existsSync(this.corpus_CSVs)) {
        fs.mkdirSync(this.corpus_CSVs, { recursive: true });
      }

      await download.saveAs(path.join(this.corpus_CSVs, `${siteName}.csv`));
      console.log(download.url());
    } catch (e) {
      console.log(`Could not process ${siteName}`);
    }
  }
}
