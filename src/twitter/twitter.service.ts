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

    const getHashtag = (hashtags: any[]) =>
      hashtags?.map(({ text }: any) => text);

    const getUserMentions = (user_mentions: any[]) =>
      user_mentions?.map(({ screen_name }: any) => screen_name);

    const getUrls = (urls: any[]) =>
      (urls ?? [])?.map(({ display_url, expanded_url, url }: any) => ({
        display_url,
        expanded_url,
        url,
      }));

    const getMedia = (media: any[]) =>
      (media ?? [])?.map((value: any) => {
        if (
          value?.type !== "photo" &&
          value?.type !== "video" &&
          value?.type !== "animated_gif"
        )
          return;

        if (value?.type === "video" || value?.type === "animated_gif") {
          const getBitrate = (bitrate: any) => (isNaN(+bitrate) ? 0 : bitrate);
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
        // if (isLarge) name = "large";
        const src = `${splitedUrl.join(".")}?format=${format}`;
        return {
          src: `${src}&name=${name}`,
          origin: `${src}&name=${"orig"}`,
          width: w,
          height: h,
          type,
          url,
        };
      });

    const quotedFormatter = (quoted_status_result: any) => {
      if (!quoted_status_result?.result?.core?.user_results) return;

      const { name, screen_name } =
        quoted_status_result?.result?.core?.user_results?.result?.legacy;
      const {
        conversation_id_str,
        full_text,
        entities,
        created_at,
        extended_entities,
      } = quoted_status_result?.result?.legacy;

      const { hashtags, user_mentions, urls } = entities;

      return {
        sortIndex: conversation_id_str,
        name,
        screen_name,
        full_text,
        created_at,
        hashtags: getHashtag(hashtags),
        user_mentions: getUserMentions(user_mentions),
        urls: getUrls(urls),
        media: getMedia(extended_entities?.media),
        meta: [],
      };
    };

    const getData = (itemContent: any) => {
      console.log(itemContent);
      const isRt =
        !!itemContent?.tweet_results?.result?.legacy?.retweeted_status_result;

      const isData =
        itemContent?.tweet_results?.result?.legacy?.retweeted_status_result
          ?.result || itemContent?.tweet_results?.result;

      if (!isData?.core?.user_results) return;

      const quoted = quotedFormatter(
        itemContent?.tweet_results?.result?.quoted_status_result,
      );

      const {
        core: {
          user_results: { result },
        },
        legacy,
      } =
        itemContent?.tweet_results?.result?.legacy?.retweeted_status_result
          ?.result || itemContent?.tweet_results?.result;

      const { name, screen_name } = result.legacy;
      const { full_text, created_at } = legacy;
      const { hashtags, user_mentions } = legacy.entities;

      const urls = getUrls(legacy?.entities?.urls);

      const meta: any[] = [];

      const media = getMedia(legacy?.extended_entities?.media);

      const returnData = {
        isRt,
        name,
        screen_name,
        full_text: media?.[0]?.url
          ? full_text?.replace(media?.[0]?.url, "")
          : full_text,
        created_at,
        hashtags: getHashtag(hashtags),
        user_mentions: getUserMentions(user_mentions),
        urls,
        media,
        meta,
        quoted,
      };

      return returnData;
    };

    const data = entries
      .map((entry: any) => {
        const { sortIndex } = entry;

        if ((entry?.entryId ?? "").startsWith("cursor")) return null;

        const result = entry.content?.items?.length
          ? entry.content?.items.map((value: any) =>
              getData(value?.item?.itemContent),
            )
          : getData(entry.content?.itemContent);

        if (Array.isArray(result)) {
          const itemsResult = result.reduce((result, item, index) => {
            Object.entries(item ?? {}).forEach(([key, value]) => {
              if (index === 0) {
                result[key] = value;
              } else {
                if (key === "full_text") {
                  result[key] += value;
                }

                if (Array.isArray(value)) {
                  result[key] = [...(result?.[key] ?? []), ...(value ?? [])];
                }
              }
            });

            return result;
          }, {});

          return {
            sortIndex,
            ...itemsResult,
          };
        }

        return {
          sortIndex,
          ...result,
        };
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
