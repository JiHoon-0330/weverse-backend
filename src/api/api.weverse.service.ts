import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { AxiosRequestConfig } from "axios";
import { Browser } from "src/browser";
import { Comment, Media, Noti, Password, Post } from "src/typeorm/weverse";
import { ArtistComment, ArtistPost, MediaPost, Return, Videos } from "type";
import { Repository } from "typeorm";
import { WEVERSE } from "utils/database";
import { Api } from ".";

function weverseConfig(weverseToken: string): AxiosRequestConfig {
  return {
    baseURL: "",
    headers: {
      Authorization: `Bearer ${weverseToken}`,
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Access-Control-Allow-Origin": "*",
    },
  };
}

@Injectable()
export class WeverseApiV2 extends Api {
  #browser: Browser;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Password, WEVERSE)
    private readonly passwordRepository: Repository<Password>,
    @InjectRepository(Noti, WEVERSE)
    private readonly notiRepository: Repository<Noti>,
    @InjectRepository(Post, WEVERSE)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Comment, WEVERSE)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Media, WEVERSE)
    private readonly mediaRepository: Repository<Media>,
  ) {
    super();
    const token = this.configService.get<string>("WEVERSE_TOKEN");
    if (token) {
      this.setConfig = weverseConfig(token);
      this.#browser = new Browser(token);
    } else {
      throw Error("WEVERSE_TOKEN is undefined");
    }
  }

  async saveNotifications(): Return<Noti[]> {
    const checkIsSameCount = (
      activityId: string,
      currentCount: number,
      dbCount: number,
    ): boolean => {
      if (currentCount === dbCount) return true;

      this.notiRepository.update(activityId, {
        count: currentCount,
      });

      return false;
    };

    try {
      const [response] = await this.#browser.getResponseByApiUrl<{
        noti: {
          data: Noti[];
        };
      }>(
        "/wooah/feed",
        {
          noti: "https://apis.naver.com/weverse/wevweb/noti/feed/v1.0/activities?",
        },
        ".HeaderNotificationWrapperView_notification_button__7mtrz",
      );

      if (!response) {
        return [undefined, "error: saveNotifications: getResponseByApiUrl"];
      }

      const newNotiList = (
        await Promise.all(
          response.noti.data.map(async (value) => {
            const { activityId, count, webUrl } = value;
            const splitWebUrl = webUrl?.split("?")?.[0];
            const postId = (
              splitWebUrl.includes("/comment/")
                ? splitWebUrl.split("/comment/")[0].split("/").at(-1)
                : splitWebUrl.split("/").at(-1)
            ) as string;

            const formattedValue = {
              ...value,
              postId,
              webUrl: splitWebUrl,
            };
            const findOne = await this.notiRepository.findOne({
              where: {
                activityId,
              },
            });
            if (findOne) {
              const isSameCount = checkIsSameCount(
                activityId,
                count,
                findOne.count,
              );
              if (!isSameCount) return formattedValue;

              return null;
            }

            this.notiRepository.insert(formattedValue);
            return formattedValue;
          }),
        )
      ).filter((value: Noti | null): value is Noti => value !== null);

      return [newNotiList, undefined];
    } catch (error) {
      return [undefined, error];
    }
  }

  async saveData(notiList: Noti[]) {
    const isMatchMessageIdByString =
      (messageId: string) =>
      (...match: string[]) => {
        return match.reduce((isMatch, match) => {
          return isMatch || messageId.includes(match);
        }, false);
      };

    const getMessageIdType = (messageId: string) => {
      const isMatchMessageId = isMatchMessageIdByString(messageId);

      switch (true) {
        case isMatchMessageId("ARTIST_POST", "ARTIST_COMMENT:post"):
          return "POST";

        case isMatchMessageId("ARTIST_MOMENT", "MOMENT_COMMENT:post"):
          return "MOMENT";

        case isMatchMessageId("T_FEED_COMMENT:post"):
          return "FAM_POST";

        case isMatchMessageId("COMMUNITY_MEDIA"):
          return "MEDIA";

        case isMatchMessageId("NOTICE"):
          return "NOTICE";

        default:
          return "UNKNOWN";
      }
    };

    const getApiUrl = (
      type: ReturnType<typeof getMessageIdType>,
      webUrl: string,
    ) => {
      switch (type) {
        case "POST":
        case "FAM_POST":
        case "MEDIA": {
          const postId = webUrl.split("/").at(-1);
          return {
            post: `https://apis.naver.com/weverse/wevweb/post/v1.0/post-${postId}?fieldSet=postV1`,
            comments: `https://apis.naver.com/weverse/wevweb/comment/v1.0/post-${postId}/artistComments?`,
          };
        }

        case "MOMENT": {
          const postId = webUrl.split("/comment/")[0].split("/").at(-1);

          return {
            post: `https://apis.naver.com/weverse/wevweb/post/v1.0/post-${postId}?fieldSet=postV1`,
            comments: `https://apis.naver.com/weverse/wevweb/comment/v1.0/post-${postId}/artistComments?`,
          };
        }

        case "NOTICE":
        case "UNKNOWN":
          return {
            post: " ",
            comments: " ",
          };

        default:
          const check: never = type;
          return {
            post: " ",
            comments: " ",
          };
      }
    };

    const getVideo = async (
      webUrl: string,
      videoId: string,
      clickSelector?: string,
    ) => {
      const [response] = await this.#browser.getResponseByApiUrl<{
        video: Videos;
      }>(
        webUrl,
        {
          video: `https://apis.naver.com/rmcnmv/rmcnmv/vod/play/v2.0/${videoId}`,
        },
        clickSelector,
      );
      if (!response) return undefined;
      return response.video.videos.list.sort((a, b) => b.size - a.size).at(0)
        ?.source;
    };

    const getFormattedPost = async (post: ArtistPost, webUrl: string) => {
      const { author, plainBody, publishedAt, locked, postId, attachment } =
        post;

      const postObj: Post = {
        body: plainBody,
        createdAt: publishedAt,
        author: {
          memberId: author.memberId,
          profileName: author.profileName,
          profileType: author.profileType,
        },
        locked,
        postId,
      };

      if ("photo" in attachment) {
        postObj["photo"] = Object.entries(attachment.photo)
          .sort(([a], [b]) => (a < b ? -1 : 1))
          .map(([_, { width, height, url }]) => ({
            width,
            height,
            url,
          }));
      }

      if ("video" in attachment) {
        const videos = await Promise.all(
          Object.entries(attachment.video)
            .map(async ([key, { uploadInfo }]) => {
              const { imageUrl, videoId } = uploadInfo;
              return await getVideo(
                webUrl,
                videoId,
                ".WidgetMedia.WidgetVideo > *",
              );
            })
            .filter((value): value is Promise<string> => !!value),
        );
        postObj["video"] = videos?.[0];
      }

      return postObj;
    };

    const getFormattedComments = (
      comments: ArtistComment[],
      postId: string,
    ) => {
      if (!comments?.length) return [];

      return comments.map((comment) => {
        const { author, body, commentId, createdAt, parent } = comment;
        const commentObj: Comment = {
          author: {
            memberId: author.memberId,
            profileName: author.profileName,
            profileType: author.profileType,
          },
          body,
          commentId,
          createdAt,
          postId,
        };

        if (parent.type === "COMMENT") {
          const {
            data: { author, body, commentId, createdAt },
          } = parent;
          commentObj["parent"] = { author, body, commentId, createdAt };
        }

        return commentObj;
      });
    };

    const getFormattedMedia = async (post: MediaPost, webUrl: string) => {
      const { extension, plainBody, postId, postType, publishedAt, title } =
        post;

      const mediaObj: Media = {
        postId,
        title,
        body: plainBody,
        createdAt: publishedAt,
      };

      if (postType === "IMAGE") {
        mediaObj["photo"] = extension.image.map(({ width, height, url }) => ({
          width,
          height,
          url,
        }));
      }

      if (postType === "VIDEO") {
        mediaObj["video"] = await getVideo(
          webUrl,
          extension.video.infraVideoId,
        );
      }

      if (postType === "YOUTUBE") {
        mediaObj["youtube"] = extension.videoPath;
      }

      return mediaObj;
    };

    const isCheckList = <string[]>[];
    const responseList = [];
    const len = notiList.length;

    for (let i = 0; i < len; i++) {
      const { messageId, webUrl, activityId } = notiList[i];
      const type = getMessageIdType(messageId);
      if (type === "NOTICE" || type === "UNKNOWN") continue;

      type ResponseType = {
        post: ArtistPost;
        comments: { data: ArtistComment[] };
      };
      // type ResponseType<T extends typeof type> = T extends "MEDIA"
      //   ? { post: MediaPost; comments: { data: ArtistComment[] } }
      //   : { post: ArtistPost; comments: { data: ArtistComment[] } };

      const apiUrlObj = getApiUrl(type, webUrl);

      switch (type) {
        case "POST":
        case "MOMENT":
        case "FAM_POST":
          {
            if (isCheckList.includes(webUrl)) break;

            const [response] =
              await this.#browser.getResponseByApiUrl<ResponseType>(
                webUrl,
                apiUrlObj,
              );
            console.log(
              JSON.stringify({ type, webUrl, apiUrlObj, response }, null, 2),
            );
            if (!response) break;

            isCheckList.push(webUrl);
            const { post, comments } = response;

            const formattedPost = await getFormattedPost(post, webUrl);
            const formattedComments = getFormattedComments(
              comments?.data,
              post.postId,
            );

            await Promise.all([
              await this.postRepository.save(formattedPost),
              ...formattedComments.map(async (comment) => {
                return await this.commentRepository.save(comment);
              }),
            ]);

            responseList.push({
              post: formattedPost,
              comments: formattedComments,
            });
          }
          break;

        case "MEDIA":
          {
            // if (isCheckList.includes(webUrl)) break;
            // try {
            //   const [response] =
            //     await this.#browser.getResponseByApiUrl<ResponseType>(
            //       webUrl,
            //       apiUrlObj,
            //     );
            //   console.log(response);
            //   if (!response) break;
            //   isCheckList.push(webUrl);
            //   const { post, comments } = response;
            //   const formattedMedia = await getFormattedMedia(post, webUrl);
            //   const formattedComments = await getFormattedComments(
            //     comments?.data,
            //     post.postId,
            //   );
            //   await Promise.all([
            //     await this.mediaRepository.save(formattedMedia),
            //     ...formattedComments.map(async (comment) => {
            //       return await this.commentRepository.save(comment);
            //     }),
            //   ]);
            //   responseList.push({
            //     post: formattedMedia,
            //     comments: formattedComments,
            //   });
            // } catch (error) {
            //   console.log(error);
            // }
          }
          break;

        default:
          const check: never = type;
          break;
      }
    }

    return responseList;
  }
}
