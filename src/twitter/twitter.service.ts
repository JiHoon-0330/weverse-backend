import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TwitterApi } from "src/api";
import { Browser } from "src/browser";
import { Cookie } from "src/typeorm/twitter";
import { Repository } from "typeorm";

@Injectable()
export class TwitterService {
  #browser: Browser;

  constructor(
    private readonly twitterApi: TwitterApi,
    @InjectRepository(Cookie, "TWITTER")
    private readonly cookieRepository: Repository<Cookie>,
  ) {
    this.#browser = new Browser();
  }

  async getTwitter(from: string) {}

  async getCookie() {
    return await this.cookieRepository.find();
  }

  async saveCookie() {
    const [cookie, x_csrf_token, x_guest_token] = await this.#browser.getCookie(
      "https://twitter.com/wooah_nv",
      ["ct0", "gt"],
    );

    if (!cookie || !x_csrf_token || !x_guest_token) return;

    const createAt = Date.now();

    const result = await this.cookieRepository.insert({
      cookie,
      x_csrf_token,
      x_guest_token,
      createAt,
    });

    return result;
  }

  async getTest() {
    return await this.cookieRepository.find();
  }
}
