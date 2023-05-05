import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Cookie } from "src/typeorm/twitter";
import { Repository } from "typeorm";
import { TWITTER } from "utils/database";
import { Api } from ".";

const variables = {
  userId: "1227412479363338241",
  count: 10,
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
// const variables = {
//   userId: "1227412479363338241",
//   count: 5,
//   includePromotedContent: true,
//   withCommunity: true,
//   withSuperFollowsUserFields: true,
//   withDownvotePerspective: false,
//   withReactionsMetadata: false,
//   withReactionsPerspective: false,
//   withSuperFollowsTweetFields: true,
//   withVoice: true,
//   withV2Timeline: true,
// };

const features = {
  responsive_web_twitter_blue_verified_badge_is_enabled: true,
  verified_phone_label_enabled: false,
  responsive_web_graphql_timeline_navigation_enabled: true,
  view_counts_public_visibility_enabled: false,
  view_counts_everywhere_api_enabled: false,
  tweetypie_unmention_optimization_enabled: true,
  responsive_web_uc_gql_enabled: true,
  vibe_api_enabled: true,
  responsive_web_edit_tweet_api_enabled: true,
  graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
  standardized_nudges_misinfo: true,
  tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled:
    false,
  interactive_text_enabled: true,
  responsive_web_text_conversations_enabled: false,
  responsive_web_enhance_cards_enabled: true,
};
// const features = {
//   dont_mention_me_view_api_enabled: true,
//   interactive_text_enabled: true,
//   responsive_web_uc_gql_enabled: false,
//   vibe_tweet_context_enabled: false,
//   responsive_web_edit_tweet_api_enabled: false,
//   standardized_nudges_for_misinfo_nudges_enabled: false,
//   responsive_web_enhance_cards_enabled: false,
// };

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
        accept: "*/*",
        "accept-language": "ko,en;q=0.9,ko-KR;q=0.8,en-US;q=0.7",
        authorization:
          "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA",
        "content-type": "application/json",
        "sec-ch-ua":
          '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-csrf-token":
          "d7dbc9036685db9c61eeafc127bd1ff567e715480a49118c40e806335a7e3551c8b3362a1c37703241f5f6addd95d9a4ded5693ce90878ef8988d2982c425cf0fa7fa42904e44f29b7f495fdbb651504",
        "x-twitter-active-user": "yes",
        "x-twitter-auth-type": "OAuth2Session",
        "x-twitter-client-language": "ko",
        cookie:
          "auth_token=f39745c67b01fd26ea863ecbff160a546160c9ec; ct0=d7dbc9036685db9c61eeafc127bd1ff567e715480a49118c40e806335a7e3551c8b3362a1c37703241f5f6addd95d9a4ded5693ce90878ef8988d2982c425cf0fa7fa42904e44f29b7f495fdbb651504;",
        Referer: "https://twitter.com/wooah_nv/with_replies",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Accept-Encoding": "gzip",
        "Content-Encoding": "gzip",
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
    // const cookies = await this.getCookie();

    const [data, error] = await this.api<any>({
      // url: `/i/api/graphql/U80qWAN-Rot-rSZsLcyqRQ/UserTweetsAndReplies?variables=${encodeURIComponent(
      //   JSON.stringify({ ...variables, cursor }),
      // )}&features=${encodeURIComponent(JSON.stringify(features))}`,
      url: `/i/api/graphql/HMDNer3bNC9hzw6-bq89HQ/UserTweetsAndReplies?variables=${encodeURIComponent(
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
    if (this.#cookie.time && this.#cookie.time > Date.now() - 1000 * 60 * 30) {
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
