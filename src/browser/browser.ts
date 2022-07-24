import puppeteer from "puppeteer";
import { Return } from "type";

const WEVERSE_BASE_URL = "https://www.weverse.io";

type Config = {
  cookie: [
    {
      domain: ".weverse.io";
      name: "we_access_token";
      value: string;
    },
    {
      domain: ".weverse.io";
      name: "we2_access_token";
      value: string;
    },
  ];
};

export class Browser {
  #config?: Config;

  constructor(config?: string) {
    if (config) {
      this.#config = {
        cookie: [
          {
            domain: ".weverse.io",
            name: "we_access_token",
            value: config,
          },
          {
            domain: ".weverse.io",
            name: "we2_access_token",
            value: config,
          },
        ],
      };
    }
  }

  async getResponseByApiUrl<T extends Object>(
    pageUrl: string,
    apiUrlObj: { [key in keyof T]: string },
    clickSelector?: string,
  ): Return<{ [key in keyof T]: T[key] }> {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const checkList = <string[]>[];
    const apiUrlObjKeys = Object.keys(apiUrlObj) as (keyof T)[];
    const apiUrlObjvalues = Object.values(apiUrlObj) as string[];

    const isValidApiUrl = (requestUrl: string): number => {
      return apiUrlObjvalues.findIndex((apiUrl) => requestUrl.includes(apiUrl));
    };

    try {
      const responseObj = <{ [key in keyof T]: T[key] }>{};

      const page = await browser.newPage();

      if (this.#config) {
        page.setCookie(...this.#config.cookie);
      }

      await page.goto(`${WEVERSE_BASE_URL}${pageUrl}`);

      if (clickSelector) {
        await page.waitForSelector(clickSelector, {
          visible: true,
        });
        console.log("clickSelector: ", clickSelector);
        await page.click(clickSelector);
      }

      await Promise.all(
        apiUrlObjvalues.map(async (apiUrl) => {
          const result = await page.waitForResponse(async (response) => {
            const currentUrl = response.url();
            const status = response.status();
            const findIndex = isValidApiUrl(currentUrl);
            const isValidUrl = currentUrl.includes(apiUrl);

            if (!isValidUrl) return false;

            const isChecked = checkList.includes(apiUrl);

            if (!isChecked) {
              checkList.push(apiUrl);
              return false;
            }

            if (400 <= status && status < 600) {
              throw `error: getResponseByApiUrl: api error
              \npageUrl: ${pageUrl}
              \napiUrlObj: ${JSON.stringify(apiUrlObj, null, 2)}`;
            }
            console.log("currentUrl: ", currentUrl);
            const buffer = await response.buffer();
            const toString = await buffer.toString();
            responseObj[apiUrlObjKeys[findIndex]] = JSON.parse(
              toString,
            ) as T[keyof T];
            return true;
          });

          return result;
        }),
      );

      return [responseObj, undefined];
    } catch (error) {
      console.log("catch error: getResponseByApiUrl: ", error);
      return [undefined, error];
    } finally {
      if (clickSelector) browser.close();
      browser.close();
    }
  }

  async getCookie(pageUrl: string, cookieNames: string[]) {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: false,
    });
    const page = await browser.newPage();
    await page.goto(pageUrl);

    const cookies = await page.cookies();

    await browser.close();

    const cookie = cookies
      .map((item, index) => {
        return `${item.name}=${item.value}`;
      })
      .join(";");

    const cookieValues = cookieNames.map((cookieName) => {
      return cookies.filter((item) => item.name === cookieName)?.[0]?.value;
    });
    return [cookie, ...cookieValues];
  }
}
