import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TwitterApi } from "src/api";
import { Browser } from "src/browser";
import { Cookie } from "src/typeorm/twitter";
import { Repository } from "typeorm";
import { TWITTER } from "utils/database";

@Injectable()
export class TwitterService {
  #browser: Browser;

  constructor(
    private readonly twitterApi: TwitterApi,
    @InjectRepository(Cookie, TWITTER)
    private readonly cookieRepository: Repository<Cookie>,
  ) {
    this.#browser = new Browser();
  }

  async getTwitter(from?: string) {
    const [instructions] = await this.twitterApi.getTwitter(from);

    if (!instructions) return;

    const findIndex = instructions.findIndex(
      ({ type = "" }) => type === "TimelineAddEntries",
    );

    if (findIndex === -1) return;

    const entries = instructions[findIndex].entries;

    const data = entries
      .map((entry: any) => {
        const { sortIndex } = entry;
        const isRt =
          !!entry.content?.itemContent?.tweet_results?.result?.legacy
            ?.retweeted_status_result;

        const isData =
          entry?.content?.itemContent?.tweet_results?.result?.legacy
            ?.retweeted_status_result?.result ||
          entry?.content?.itemContent?.tweet_results?.result;

        if (!isData?.core?.user_results) return;

        const {
          core: {
            user_results: { result },
          },
          legacy,
        } =
          entry?.content?.itemContent?.tweet_results?.result?.legacy
            ?.retweeted_status_result?.result ||
          entry?.content?.itemContent?.tweet_results?.result;

        const { name, screen_name } = result.legacy;
        const { full_text, created_at } = legacy;
        const { hashtags, user_mentions } = legacy.entities;
        const urls = (legacy?.entities?.urls ?? []).map(
          ({ display_url, expanded_url, url }: any) => ({
            display_url,
            expanded_url,
            url,
          }),
        );
        const media = (legacy?.extended_entities?.media ?? []).map(
          (value: any) => {
            if (
              value?.type !== "photo" &&
              value?.type !== "video" &&
              value?.type !== "animated_gif"
            )
              return;

            if (value?.type === "video" || value?.type === "animated_gif") {
              const getBitrate = (bitrate: any) =>
                isNaN(+bitrate) ? 0 : bitrate;
              const {
                video_info: { variants },
                media_url_https,
              } = value;
              const sorted = variants.sort((a: any, b: any) => {
                const aBitrate = getBitrate(a.bitrate);
                const bBitrate = getBitrate(b.bitrate);
                return bBitrate - aBitrate;
              });

              return {
                type: "video",
                url: value?.url,
                src: sorted?.[0]?.url,
                poster: media_url_https,
              };
            }

            const { type, url, media_url_https, sizes } = value;
            const isLarge = !!sizes?.large;
            const isMedium = !!sizes?.medium;
            const isSmall = !!sizes?.small;
            const { w, h } = sizes?.large || sizes?.medium || sizes?.small;
            const splitedUrl = media_url_https?.split(".");
            const format = splitedUrl.pop();
            let name;
            if (isSmall) name = "small";
            if (isMedium) name = "medium";
            if (isLarge) name = "large";
            const src = `${splitedUrl.join(".")}?format=${format}`;
            return {
              src: `${src}&name=${name}`,
              origin: `${src}&name=${"orig"}`,
              width: w,
              height: h,
              type,
              url,
            };
          },
        );
        const meta: any[] = [];

        const returnData = {
          sortIndex,
          isRt,
          name,
          screen_name,
          full_text,
          created_at,
          hashtags: hashtags.map(({ text }: any) => text),
          user_mentions: user_mentions.map(
            ({ screen_name }: any) => screen_name,
          ),
          urls,
          media,
          meta,
        };

        return returnData;
      })
      .filter((v: any) => v);

    return {
      data,
      cursor: entries?.[entries?.length - 1]?.content?.value,
    };
  }

  async getCookie() {
    return await this.twitterApi.getCookie();
  }

  async saveCookie() {
    const [cookie, x_csrf_token, x_guest_token] = await this.#browser.getCookie(
      "https://twitter.com/wooah_nv",
      ["ct0", "gt"],
    );

    if (!cookie || !x_csrf_token || !x_guest_token) return;

    const createAt = Date.now();

    await this.cookieRepository.save({
      cookie,
      x_csrf_token,
      x_guest_token,
      createAt,
      id: 1,
    });
  }

  async getTest() {
    return await this.cookieRepository.find();
  }
}
