/**
 * npx ts-node --project bin/tsconfig.bin.json bin/get-stores.ts
 */

import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer-core';
import urlcat from 'urlcat';

class ChofuGift {
  page: puppeteer.Page | undefined;

  async init() {
    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/google-chrome',
    });
    const page = await browser.newPage();
    await page.setViewport({
      width: 1640,
      height: 5800,
      deviceScaleFactor: 1,
    });
    this.page = page;
  }

  async start() {
    for (let page = 15; page < 100; page++) {
      const isLast = await this.getPages(page);
      if (isLast) {
        break;
      }
    }
  }

  async getPages(page: number) {
    await this.page?.goto(
      urlcat('https://premium-gift.jp', 'chofu/use_store', {
        events: 'page',
        id: page,
      })
    );
    const cards =
      (await this.page?.$$eval('a.store-card__button', (hrefs) =>
        hrefs.map((a) => a.getAttribute('href'))
      )) || [];

    const pagenationTexts = await this.page?.$$eval(
      '.store-card__pagenation a',
      (anchors) => anchors.map((a) => a.textContent)
    );

    // 最後のページであるかの確認
    const isLastPage =
      // 次ページを含んでいる
      !pagenationTexts?.includes(`${page + 1}`) &&
      // "次へ" がない
      !pagenationTexts?.includes('次へ');

    for (let idx = 0; idx < cards.length; idx++) {
      console.log('PAGE:', page, 'CARD:', idx);

      const storeURL = cards[idx] || '';
      // お店詳細ページに移動
      await Promise.all([
        this.page?.waitForNavigation(),
        this.page?.goto(storeURL),
      ]);
      await sleep(3000);

      const store = await this.getStore();

      const url = new URL(storeURL);
      const storeId = url.searchParams.get('id') || '';
      if (!storeId) {
        this.errorlog(`storeURL ${storeURL} is empty`);
      }

      console.log(store);
      this.saveStore({
        id: storeId,
        ...store,
      });
    }

    return isLastPage;
  }

  async saveStore(store: { id: string }) {
    const storePath = path.resolve(
      __dirname,
      '..',
      'static',
      'stores',
      `${store.id}.json`
    );
    fs.writeFileSync(storePath, JSON.stringify(store, null, '  '));
  }

  async getStore() {
    const page = this.page;
    if (!page) {
      return page;
    }

    const nameItem = await page.$('.common-title__lead');
    const name = await (
      await nameItem?.getProperty('textContent')
    )?.jsonValue();

    const categoryItem = await page.$('.common-table tr:nth-child(1) td');
    const category = await (
      await categoryItem?.getProperty('textContent')
    )?.jsonValue();

    const addressItem = await page.$('.common-table tr:nth-child(2) td');
    const address = await (
      await addressItem?.getProperty('textContent')
    )?.jsonValue();

    const phoneItem = await page.$('.common-table tr:nth-child(3) td');
    const phone = await (
      await phoneItem?.getProperty('textContent')
    )?.jsonValue();

    const websiteItem = await page.$('.common-table tr:nth-child(4) td');
    const website = await (
      await websiteItem?.getProperty('textContent')
    )?.jsonValue();

    const location = await this.getLocation();

    return {
      name: name,
      category: category,
      address: address,
      phone: phone,
      website: `${website}`.trim(),
      location: location,
    };
  }

  errorlog(error: string) {
    fs.appendFileSync('error.log', error);
    fs.appendFileSync('error.log', '\n');
  }

  async getLocation() {
    const page = this.page;
    if (!page) {
      return;
    }

    const frame = page
      .frames()
      .find((f) => f.url().startsWith('https://www.google.com/maps/embed'));

    let googleMapURL = await frame?.$$eval('.google-maps-link a', (hrefs) =>
      hrefs
        .map((a) => a.getAttribute('href') || '')
        .find((href) => href.startsWith('https://maps.google.com/maps'))
    );
    if (!googleMapURL) {
      googleMapURL = await frame?.$$eval('.default-card a', (hrefs) =>
        hrefs
          .map((a) => a.getAttribute('href') || '')
          .find((href) => href.startsWith('https://maps.google.com/maps'))
      );
    }
    if (!googleMapURL) {
      throw new Error('googleMapURL is empty');
    }
    return this.parseLL(googleMapURL);
  }

  parseLL(mapurl: string) {
    const url = new URL(mapurl);
    const ll = url.searchParams.get('ll') || '';
    const location = ll.split(',').map((loc) => parseFloat(loc));
    if (location.length !== 2) {
      throw new Error('parseLL error');
    }
    return {
      lat: location[0],
      lng: location[1],
    };
  }
}

function sleep(timeout: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeout);
  });
}

(async () => {
  try {
    const chofu = new ChofuGift();
    await chofu.init();
    chofu.start();
  } catch (error) {
    console.log(error);
  }
})();
