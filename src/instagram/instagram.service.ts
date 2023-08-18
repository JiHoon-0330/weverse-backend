import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { InstagramApi } from "src/api";
import { Browser } from "src/browser";
import { Cookie } from "src/typeorm/instagram";
import { Repository } from "typeorm";
import { INSTAGRAM } from "utils/database";

import axios from "axios";
import { createReadStream, existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";

@Injectable()
export class InstagramService {
  #browser: Browser;
  #cache: { [key in string]: { data: any; time: number } };

  constructor(
    private readonly instagramApi: InstagramApi,
    @InjectRepository(Cookie, INSTAGRAM)
    private readonly cookieRepository: Repository<Cookie>,
  ) {
    this.#browser = new Browser();
    this.#cache = {
      [""]: {
        data: {},
        time: 0,
      },
    };
  }

  async getReels(from?: string) {
    const cacheByFrom = this.#cache?.[from ?? ""];

    if (cacheByFrom?.time && cacheByFrom?.time > Date.now() - 1000 * 60 * 60) {
      return {
        ...cacheByFrom?.data,
        cacheTime: cacheByFrom?.time,
      };
    }

    const [reels, error] = await this.instagramApi.getReels(from);

    if (!reels) return;

    const { items, paging_info } = reels;

    const data = items.map(({ media }: any) => {
      return {
        body: media.caption.text,
        createdAt: media.caption.created_at,
        poster: media.image_versions2.candidates[0].url,
        src: media.video_versions[0].url,
      };
    });

    return { data, ...paging_info };
  }

  async video(url: string, createdAt: string, res: any) {
    const dirPath = join(process.cwd(), "/videos");
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath);
    }

    const videoPath = join(process.cwd(), `/videos/${createdAt}.mp4`);
    if (existsSync(videoPath)) {
      return createReadStream(videoPath).pipe(res);
    }

    const result = await axios({
      url,
      method: "GET",
      responseType: "arraybuffer",
    });
    const base64 = Buffer.from(result.data as string, "binary").toString(
      "base64",
    );
    await writeFileSync(videoPath, base64, "base64");

    return createReadStream(videoPath).pipe(res);
  }

  async getCookie() {
    return await this.instagramApi.getCookie();
  }

  async saveCookie() {
    const [cookie, csrftoken, mid, ig_did] = await this.#browser.getCookie(
      "https://www.instagram.com/wooah_nv/reels/",
      ["csrftoken", "mid", "ig_did"],
    );

    if (!cookie || !csrftoken || !mid || !ig_did) return;

    const createAt = Date.now();

    await this.cookieRepository.save({
      cookie,
      csrftoken,
      ig_did,
      mid,
      createAt,
      id: 1,
    });
  }

  async getTest() {
    return await this.cookieRepository.find();
  }
}
