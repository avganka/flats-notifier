import puppeteerExtra, { PuppeteerExtra } from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import * as cheerio from 'cheerio';
import { Browser, Page } from 'puppeteer';
import { URL } from 'url';
import { Flat } from '@prisma/client';

interface Options {
  headless?: 'new' | false;
  viewport?: Viewport;
}

interface Viewport {
  width: number;
  height: number;
}

interface ScrapeOptions {
  query: string;
}

export type FlatWithoutTimestamps = Omit<Flat, 'createdAt' | 'updatedAt'>;

export abstract class ScrapeService {
  protected host: string;
  public blockingResourcesList: string[];
  protected browser: Browser | null;
  protected page: Page | null;
  protected puppeteer: PuppeteerExtra;
  protected options: Options;
  protected $: cheerio.CheerioAPI | null;

  constructor(options?: Options) {
    this.blockingResourcesList = [
      //'image',
      'font',
      //'media',
      //'script',
      'stylesheet',
      //'texttrack',
      //'xhr',
      //'fetch',
      'prefetch',
      'eventsource',
      'websocket',
      'manifest',
      'signedexchange',
      'ping',
      'cspviolationreport',
      'preflight',
      //'other',
    ];
    this.options = options || {
      headless: 'new',
    };
    this.host = '';
    this.puppeteer = puppeteerExtra;
    this.browser = null;
    this.page = null;
    this.$ = null;
  }

  protected async initBrowser() {
    this.puppeteer.use(StealthPlugin());

    if (this.browser) {
      this.browser.close();
    }

    this.browser = await this.puppeteer.launch({
      headless: this.options.headless,
      defaultViewport: null,
      userDataDir: './tmp',
      args: ['--no-sandbox', '--disabled-setupid-sandbox'],
    });

    return this.browser.newPage();
  }

  protected async setupPage() {
    if (this.page) {
      if (this.options.viewport) {
        await this.page.setViewport(this.options.viewport);
      }
      await this.page.setRequestInterception(true);
      this.page.on('request', async (req) => {
        if (this.blockingResourcesList.indexOf(req.resourceType()) !== -1) {
          await req.abort();
        } else {
          await req.continue();
        }
      });
    }
  }

  //protected getRandomDistance(min: number, max: number) {
  //  const rand = min + Math.random() * (max + 1 - min);
  //  return Math.floor(rand);
  //}

  //protected async autoScroll(maxScrolls: number = 50) {
  //  if (this.page) {
  //    // eslint-disable-next-line @typescript-eslint/no-shadow
  //    await this.page.evaluate(async (maxScrolls: number) => {
  //      await new Promise<void>((resolve) => {
  //        let totalHeight = 0;
  //        const distance = 500;
  //        let scrolls = 0;
  //        const timer = setInterval(() => {
  //          const scrollHeight = document.body.scrollHeight;
  //          window.scrollBy(0, distance);
  //          totalHeight = totalHeight + distance;
  //          scrolls = scrolls + 1;

  //          if (totalHeight >= scrollHeight - window.innerHeight || scrolls >= maxScrolls) {
  //            clearInterval(timer);
  //            resolve();
  //          }
  //        }, 100);
  //      });
  //    }, maxScrolls);
  //  }
  //}

  protected async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  public async scrape(urlToScrape: string, options?: ScrapeOptions) {
    const { host } = new URL(urlToScrape);
    this.host = host.slice(4);

    const html = await this.fetchHtml(urlToScrape);

    if (!html) {
      return [];
    }

    const $ = cheerio.load(html);
    this.$ = $;

    const flats = this.getContainer();

    if (!flats) {
      return [];
    }

    const data: FlatWithoutTimestamps[] = [];

    flats.each((i, el) => {
      const id = this.getId(el);
      const title = this.getTitle(el);
      const subway = this.getSubway(el);
      const url = this.getUrl(el);
      const img = this.getImage(el);
      const address = this.getAddress(el);
      const timeToSubway = this.getTimeToSubway(el);
      const price = this.getPrice(el);
      const comission = this.getComission(el);

      if (id) {
        data.push({
          id,
          host: this.host,
          title,
          img,
          subway,
          url: url ? this.constructURL(url, options?.query) : '',
          address,
          timeToSubway,
          comission,
          price,
        });
      }
    });

    return data;
  }

  protected async fetchHtml(url: string) {
    try {
      this.page = await this.initBrowser();
      await this.setupPage();

      await this.page.goto(url, {
        waitUntil: 'domcontentloaded',
      });

      //await this.autoScroll();

      return await this.page.evaluate(() => document.body?.outerHTML);
    } catch (error) {
      this.handleError(error);
    } finally {
      await this.closeBrowser();
    }
  }

  protected getText(el: cheerio.AnyNode, selector: string) {
    if (!this.$) {
      return '';
    }
    return this.$(el).find(selector).text() || '';
  }

  protected getAttribute(el: cheerio.AnyNode, selector: string, attr: string) {
    if (!this.$) {
      return '';
    }
    return this.$(el).find(selector).attr(attr) || '';
  }

  protected abstract getContainer(): cheerio.Cheerio<cheerio.Element> | null;

  protected abstract getId(el: cheerio.AnyNode): string;
  protected abstract getSubway(el: cheerio.AnyNode): string;
  protected abstract getTitle(el: cheerio.AnyNode): string;
  protected abstract getUrl(el: cheerio.AnyNode): string;
  protected abstract getImage(el: cheerio.AnyNode): string;
  protected abstract getAddress(el: cheerio.AnyNode): string;
  protected abstract getTimeToSubway(el: cheerio.AnyNode): string;
  protected abstract getComission(el: cheerio.AnyNode): string;
  protected abstract getPrice(el: cheerio.AnyNode): string;

  protected constructURL(url: string, query?: string) {
    if (query) {
      return `https://${this.host}${url}${query}`;
    }
    return `https://${this.host}${url}`;
  }

  protected async handleError(error: unknown) {
    if (error instanceof Error) {
      // eslint-disable-next-line no-console
      console.log(error.message);
    }
    await this.closeBrowser();
  }
}
