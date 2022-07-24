import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { WeverseApiV2 } from "src/api";
import { Comment, Media, Noti, Password, Post } from "src/typeorm/weverse";
import { Raw, Repository } from "typeorm";
import { WEVERSE } from "utils/database";

@Injectable()
export class WeverseService {
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
  ) {}

  async saveWeverse() {
    const [notifications] = await this.weverseApi.saveNotifications();

    // const noti = await this.notiRepository.find({
    //   order: {
    //     activityId: "DESC",
    //   },
    //   take: 30,
    // });

    // const data = await this.weverseApi.saveData(
    //   notifications?.length ? notifications : noti,
    // );

    const data = await this.weverseApi.saveData(notifications ?? []);

    return data;
  }

  async getWeverse(from: string) {
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

    const useList = [...notiList]?.slice(0, take - 1);

    const data = await Promise.all(
      useList.map(async (noti) => {
        const { postId, messageId } = noti;
        const isMedia = messageId.includes("COMMUNITY_MEDIA");

        const [post, comments] = await Promise.all(
          [
            (async () => {
              if (isMedia) {
                return null;
                return await this.mediaRepository.findOne({
                  where: {
                    postId,
                  },
                });
              } else {
                return await this.postRepository.findOne({
                  where: {
                    postId,
                  },
                });
              }
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
          ].filter((v) => v),
        );
        return { ...post, comments };
      }),
    );

    return {
      data,
      lastId: useList.at(-1)?.activityId,
      hasMore: notiList.length === take,
    };
  }

  async getTest() {
    const noti = await this.notiRepository.find({
      order: {
        activityId: "DESC",
      },
      where: {
        activityId: Raw((activityId) => `${activityId} <= 1550073116374405743`),
      },
    });

    const data = await this.weverseApi.saveData(noti ?? []);

    return data;
  }
}
