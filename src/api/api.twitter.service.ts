import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Cookie } from "src/typeorm/twitter";
import { Repository } from "typeorm";
import { TWITTER } from "utils/database";
import { Api } from ".";

const variables = {
  userId: "1227412479363338241",
  count: 40,
  includePromotedContent: true,
  withCommunity: true,
  withSuperFollowsUserFields: true,
  withDownvotePerspective: false,
  withReactionsMetadata: false,
  withReactionsPerspective: false,
  withSuperFollowsTweetFields: true,
  withVoice: true,
  withV2Timeline: true,
};

const features = {
  dont_mention_me_view_api_enabled: true,
  interactive_text_enabled: true,
  responsive_web_uc_gql_enabled: false,
  vibe_tweet_context_enabled: false,
  responsive_web_edit_tweet_api_enabled: false,
  standardized_nudges_for_misinfo_nudges_enabled: false,
  responsive_web_enhance_cards_enabled: false,
};

@Injectable()
export class TwitterApi extends Api {
  #cookie: {
    data: Cookie;
    time: number;
  };
  constructor(
    @InjectRepository(Cookie, TWITTER)
    private readonly cookieRepository: Repository<Cookie>,
  ) {
    super({
      baseURL: "https://twitter.com/",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Access-Control-Allow-Origin": "*",
        Accept: "*/*",
        "Accept-Language": "ko-KR,ko;q=0.9",
        Authorization:
          "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA",
        "Content-Type": "application/json",
        Referer: "https://twitter.com/wooah_nv",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "sec-ch-ua":
          '"Google Chrome";v="95", "Chromium";v="95", ";Not A Brand";v="99"',
        "x-twitter-active-user": "yes",
        "x-twitter-client-language": "ko",
      },
    });
    this.#cookie = {
      data: {
        cookie: "",
        createAt: 0,
        id: 1,
        x_csrf_token: "",
        x_guest_token: "",
      },
      time: 0,
    };
  }

  async getTwitter(cursor?: string) {
    const cookies = await this.getCookie();
    this.setConfig = {
      headers: {
        cookie: cookies.cookie,
        "x-csrf-token": cookies.x_csrf_token,
        "x-guest-token": cookies.x_guest_token,
      },
    };
    const [data, error] = await this.api<any>({
      url: `/i/api/graphql/U80qWAN-Rot-rSZsLcyqRQ/UserTweetsAndReplies?variables=${encodeURIComponent(
        JSON.stringify({ ...variables, cursor }),
      )}&features=${encodeURIComponent(JSON.stringify(features))}`,
      method: "GET",
    });

    if (!data) return [undefined, error];

    const instructions =
      data?.data?.user?.result?.timeline_v2?.timeline?.instructions;

    if (!instructions?.length) {
      return [undefined, "instructions is empty"];
    }

    return [instructions, undefined];
  }

  async getCookie() {
    if (this.#cookie.time && this.#cookie.time > Date.now() - 1000 * 60 * 90) {
      return { ...this.#cookie.data, cacheTime: this.#cookie.time };
    }

    const [response] = await this.cookieRepository.find();

    if (response.cookie && response.x_csrf_token && response.x_guest_token) {
      this.#cookie = {
        data: response,
        time: Date.now(),
      };
    }

    return response;
  }
}
