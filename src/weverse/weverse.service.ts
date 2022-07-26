import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { WeverseApiV2 } from "src/api";
import { Comment, Media, Noti, Password, Post } from "src/typeorm/weverse";
import { Raw, Repository } from "typeorm";
import { WEVERSE } from "utils/database";

@Injectable()
export class WeverseService {
  #cache: { data: any; time: number };

  constructor(
    private readonly weverseApi: WeverseApiV2,
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
    this.#cache = {
      data: {},
      time: 0,
    };
  }

  async saveWeverse() {
    const [notifications] = await this.weverseApi.saveNotifications();

    const data = await this.weverseApi.saveData(notifications ?? []);

    return data;
  }

  async getWeverse(from: string) {
    if (this.#cache.time && this.#cache.time > Date.now() - 1000 * 60 * 3) {
      return { ...this.#cache.data, cacheTime: this.#cache.time };
    }

    const take = 11;
    const notiList = await this.notiRepository.find({
      where: {
        activityId: Raw((activityId) =>
          from ? `${activityId} < ${from}` : "",
        ),
      },
      order: {
        activityId: "DESC",
      },
      take,
    });

    const isValidMessageId = (messageId: string) => {
      return [
        "ARTIST_POST",
        "ARTIST_COMMENT:post",
        "ARTIST_MOMENT",
        "MOMENT_COMMENT:post",
        "T_FEED_COMMENT:post",
      ].reduce((isValid, type) => {
        return isValid || messageId.includes(type);
      }, false);
    };

    const useList = [...notiList]?.slice(0, take - 1);
    const checkList = <string[]>[];
    const data = await Promise.all(
      useList.map(async (noti) => {
        const { postId, messageId } = noti;
        const isValid = isValidMessageId(messageId);

        if (!isValid || checkList.includes(postId)) return null;

        const [post, comments] = await Promise.all([
          (async () => {
            return await this.postRepository.findOne({
              where: {
                postId,
              },
            });
          })(),
          (async () => {
            const comments = await this.commentRepository.find({
              where: {
                postId,
              },
              order: {
                createdAt: "ASC",
              },
            });
            const commentObj = <
              {
                [key: string]: [Comment["parent"], Omit<Comment, "parent">[]];
              }
            >{};
            comments.map((comment) => {
              if (comment?.parent) {
                const { parent, ...commentData } = comment;
                const parentCommentId = parent.commentId;
                if (commentObj?.[parentCommentId]) {
                  commentObj[parentCommentId][1].push(commentData);
                } else {
                  commentObj[parentCommentId] = [parent, [commentData]];
                }
              } else {
                const { parent, ...commentData } = comment;
                commentObj[commentData.commentId] = [commentData, []];
              }
            });
            return Object.values(commentObj);
          })(),
        ]);

        return { ...post, comments };
      }),
    );

    const response = {
      data: data.filter((v) => !!v),
      lastId: useList.at(-1)?.activityId,
      hasMore: notiList.length === take,
    };

    if (response.data.length) {
      this.#cache = {
        data: response,
        time: Date.now(),
      };
    }

    return response;
  }

  async getTest() {
    const noti = await this.notiRepository.find({
      order: {
        activityId: "DESC",
      },
      where: {
        activityId: "1549799874988417025",
      },
    });

    const data = await this.weverseApi.saveData(noti ?? []);

    return data;
  }
}
