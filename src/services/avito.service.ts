import * as cheerio from 'cheerio';
import { ScrapeService } from '../core/scraper';

export class AvitoScrapperService extends ScrapeService {
  protected getContainer(): cheerio.Cheerio<cheerio.Element> | null {
    if (!this.$) {
      return null;
    }
    return this.$('div[data-marker="item"]');
  }

  protected getId(el: cheerio.AnyNode): string {
    if (!this.$) {
      return '';
    }
    return this.$(el).attr('data-item-id') || '';
  }

  protected getSubway(el: cheerio.AnyNode): string {
    return this.getText(el, '[data-marker="item-address"]>div>p:nth-child(2)>span:nth-child(2)');
  }

  protected getTitle(el: cheerio.AnyNode): string {
    return this.getText(el, 'h3[itemprop="name"]');
  }

  protected getUrl(el: cheerio.AnyNode): string {
    return this.getAttribute(el, 'a[itemprop="url"]', 'href');
  }

  protected getImage(el: cheerio.AnyNode): string {
    return this.getAttribute(el, '[data-marker="item-photo"] li', 'data-marker').slice(19);
  }

  protected getAddress(el: cheerio.AnyNode): string {
    return this.getText(el, '[data-marker="item-address"] > div > p:nth-child(1) > span');
  }

  protected getTimeToSubway(el: cheerio.AnyNode): string {
    return this.getText(el, '[data-marker="item-address"]>div>p:nth-child(2)>span:nth-child(3)');
  }

  protected getComission(el: cheerio.AnyNode): string {
    return this.getText(el, '[data-marker="item-specific-params"]').split('·')[1].trim();
  }

  protected getPrice(el: cheerio.AnyNode): string {
    return this.getAttribute(el, '[itemprop="price"]', 'content');
  }
}
