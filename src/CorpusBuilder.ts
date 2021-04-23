import { chromium, Page } from "playwright-chromium";
import { exit } from "process";

export default class CorpusBuilder {
  readonly sessionPath = "corpus_builder_session.json";

  readonly loginUrl = "https://data.stackexchange.com/account/login";
  readonly startUrl = "https://data.stackexchange.com/sports/query/new";

  page: Page;

  async init() {
    let browser = await chromium.connectOverCDP({
      wsEndpoint: "ws://127.0.0.1:4000/devtools/browser/d252f4a9-2bc8-4aeb-9173-02b41dc42767",
      slowMo: 500
    });

    let contexts = browser.contexts();
    let context = contexts[0];

    this.page = await context.newPage();
  }

  async isLoggedIn(page: Page): Promise<boolean> {
    const querySelector = "a[href*=logout]";
    return (await page.$(querySelector)) !== null;
  }

  async login(): Promise<void> {
    try {
      await this.page.goto(this.loginUrl);

      while (!(await this.isLoggedIn(this.page))) {
        await this.page.waitForNavigation({ timeout: 0 });
      }

      console.log("Succesful login!");
    } catch (e) {
      console.log("Unsuccesful login!");
      exit(0); // this helps to avoid printing any further errors
    }
  }

  async downloadCSVs(): Promise<void> {
    await this.page.goto(this.startUrl);
    if (!(await this.isLoggedIn(this.page))) {
      await this.login();
      await this.page.goto(this.startUrl);
    }
  }
}
