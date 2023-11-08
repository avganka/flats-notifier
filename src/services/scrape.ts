import puppeteerExtra, { PuppeteerExtra } from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import * as cheerio from 'cheerio';
import { Browser, Page } from 'puppeteer';
import { getLargestImageFromSrcset } from '../utils/getLargestImageFromSrcset';

interface Options {
  headless?: 'new' | false;
  viewport?: Viewport;
}

interface Viewport {
  width: number;
  height: number;
}

interface Selectors {
  adSel: string;
  idSel: string;
  titleSel: string;
  subwaySel: string;
  imgSel: string;
  urlSel: string;
}

export interface Flat {
  id: string;
  title: string;
  url: string;
  img: string;
  subway: string;
}

type ScrapeServiceHost = 'avito.ru';

export class ScrapeService {
  protected host: string;
  public blockingResourcesList: string[];
  protected browser: Browser | null;
  protected page: Page | null;
  protected puppeteer: PuppeteerExtra;
  protected options: Options;

  constructor(host: ScrapeServiceHost, options?: Options) {
    this.host = host;
    this.blockingResourcesList = [
      //'image',
      'font',
      'media',
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
    this.puppeteer = puppeteerExtra;
    this.browser = null;
    this.page = null;
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

  protected async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  public async scrape(urlToScrape: string, selectors: Selectors) {
    const { adSel, idSel, titleSel, subwaySel, imgSel, urlSel } = selectors;
    this.page = await this.initBrowser();
    await this.setupPage();

    await this.page.goto(urlToScrape, {
      waitUntil: 'domcontentloaded',
    });

    let html = '';
    try {
      html = await this.page.evaluate(() => document.body?.outerHTML);
    } catch (error) {
      this.handleError(error);
    }

    await this.closeBrowser();

    const $ = cheerio.load(html);

    const data: Flat[] = [];

    const flats = $(adSel);
    flats.each((i, el) => {
      const id = $(el).attr(idSel);
      const title = $(el).find(titleSel).text();
      const subway = $(el).find(subwaySel).text();
      const url = $(el).find(urlSel).attr('href');
      const img = getLargestImageFromSrcset($(el).find(imgSel).attr('srcset'));

      if (id) {
        data.push({
          id,
          title,
          img,
          subway,
          url: url ? this.constructURL(url) : '',
        });
      }
    });

    return data;
  }

  protected constructURL(url: string) {
    return `https://${this.host}${url}?utm_campaign=native&utm_medium=item_page_ios&utm_source=soc_sharing`;
  }

  protected async handleError(error: unknown) {
    if (error instanceof Error) {
      // eslint-disable-next-line no-console
      console.log(error.message);
    }
    await this.closeBrowser();
  }
}
