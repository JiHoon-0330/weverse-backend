import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Cookie } from "src/typeorm/instagram";
import { Return } from "type";
import { Repository } from "typeorm";
import { INSTAGRAM } from "utils/database";
import { Api } from ".";

const TARGET_USER_ID = 7994033945;
const PAGE_SIZE = 5;

@Injectable()
export class InstagramApi extends Api {
  constructor(
    @InjectRepository(Cookie, INSTAGRAM)
    private readonly cookieRepository: Repository<Cookie>,
  ) {
    super({
      baseURL: "https://i.instagram.com",
      headers: {
        accept: "*/*",
        "accept-language": "ko-KR,ko;q=0.9",
        "content-type": "application/x-www-form-urlencoded",
        "sec-ch-ua": '"Whale";v="3", " Not;A Brand";v="99", "Chromium";v="96"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "x-asbd-id": "198387",
        "x-ig-app-id": "936619743392459",
        "x-ig-www-claim": "0",
        "x-instagram-ajax": "a7cad12d2eb7",
        Referer: "https://www.instagram.com/",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
    });
  }

  async getReels(from?: string): Return<any> {
    const [cookies] = await this.cookieRepository.find();
    const csrftoken = cookies?.csrftoken || "rL27XHqGJq8MoncY6N1q0cDpch6jfWlV";
    const mid = cookies?.mid || "YbVj3QALAAELhlVXbD-6mfsAmPZ_";
    const ig_did = cookies?.ig_did || "21DB40C4-3684-4A57-8AE6-30A3609EDC94";
    const max_id = from ?? "";
    this.setConfig = {
      headers: {
        "x-csrftoken": `${csrftoken}`,
        cookie: `csrftoken=${csrftoken}; mid=${mid}; ig_did=${ig_did};`,
      },
    };
    const [data, error] = await this.api({
      url: "/api/v1/clips/user/",
      data: `target_user_id=${TARGET_USER_ID}&page_size=${PAGE_SIZE}&max_id=${max_id}`,
      method: "POST",
    });

    if (!data) return [undefined, error];

    return [data, undefined];
  }
}
