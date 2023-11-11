import * as cheerio from 'cheerio';
import { ScrapeService } from '../core/scraper';

export class YaRealtyScrapperService extends ScrapeService {
  protected getContainer(): cheerio.Cheerio<cheerio.Element> | null {
    if (!this.$) {
      return null;
    }
    return this.$('ol:contains("list")');
  }

  protected getId(el: cheerio.AnyNode): string {
    return this.getAttribute(el, 'a.Link', 'href').split('/')[2];
  }

  protected getSubway(el: cheerio.AnyNode): string {
    return this.getText(el, 'span.MetroStation__title');
  }

  protected getTitle(el: cheerio.AnyNode): string {
    return this.getText(el, 'div:contains("generalInfoInnerContainer") > a > span');
  }

  protected getUrl(el: cheerio.AnyNode): string {
    return this.getAttribute(el, 'a.Link', 'href');
  }

  protected getImage(el: cheerio.AnyNode): string {
    return this.getAttribute(el, 'img.Gallery__activeImg', 'src');
  }

  protected getAddress(el: cheerio.AnyNode): string {
    const city = this.getText(el, 'div:contains("AddressWithGeoLinks") > a:nth-child(1)');
    const street = this.getText(el, 'div:contains("AddressWithGeoLinks") > a:nth-child(2)');
    const house = this.getText(el, 'div:contains("AddressWithGeoLinks") > a:nth-child(3)');
    return `${city} ${street} ${house}`;
  }

  protected getTimeToSubway(el: cheerio.AnyNode): string {
    return this.getText(el, 'span.MetroWithTime__distance > span');
  }

  protected getComission(el: cheerio.AnyNode): string {
    if (!this.$) {
      return '';
    }
    const badges = this.$(el).find('div:contains("dealInfo") div[data-test="Badge"] > div');
    let comissionText = '';
    badges.each((i, badge) => {
      if (this.$) {
        const badgeText = this.$(badge).text();
        if (badgeText.includes('комис')) {
          comissionText = badgeText[0].toUpperCase() + badgeText.slice(1);
        }
        comissionText = 'Без комиссии';
      }
    });

    return comissionText;
  }

  protected getPrice(el: cheerio.AnyNode): string {
    const rawText = this.getText(el, 'span.price');
    return rawText.replace(/\D/g, '');
  }
}
