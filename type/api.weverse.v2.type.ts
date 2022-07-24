export type ContentType =
  | "ARTIST_COMMENT"
  | "ARTIST_MOMENT"
  | "T_FEED_COMMENT"
  | "ARTIST_POST"
  | "MOMENT_COMMENT"
  | "COMMUNITY_MEDIA"
  | "NOTICE";

export type MessageIdType = `${ContentType}:${string}`;

export type UserIdType = 20989738 | 20989746 | 20989750 | 20989759 | 20989763;

export type MemberIdType =
  | "287797a9070d1c7b9276b68aa2aae940"
  | "ce731ac8ed27380b2a1c134ab0f16928"
  | "1a0790fc97ab2226299e0be040d37131"
  | "406ce8cdf0321afb462da0f782e9c15e"
  | "578c28ecd0cd9a2d20c8c0badaa09e23";

export type NotificationV2Type = {
  messageId: MessageIdType;
  activityId: string;
  scheme: string;
  webUrl: string;
  time: number;
  count: number;
};

export type Photo = {
  photo: {
    [key: string]: {
      width: number;
      height: number;
      url: string;
    };
  };
};

export type Video = {
  video: {
    [key: string]: {
      videoId: typeof key;
      uploadInfo: {
        imageUrl: string;
        videoId: string;
      };
    };
  };
};

export type Videos = {
  videos: {
    list: {
      id: string;
      size: number;
      source: string;
    }[];
  };
};

export type Author = {
  memberId: string;
  profileName: string;
  profileType: "ARTIST" | "FAN";
};

export type ArtistPost = {
  postId: string;
  attachment: Photo | Video;
  author: Author;
  plainBody: string;
  publishedAt: number;
  locked: boolean;
};

export type Parent = {
  data: Omit<ArtistComment, "parent">;
  type: "POST" | "COMMENT";
};

export type ArtistComment = {
  commentId: string;
  author: Author;
  body: string;
  createdAt: number;
  parent: Parent;
};

export type MediaVideo = {
  video: {
    infraVideoId: string;
    thumb: string;
    type: "VOD";
  };
};

export type MediaYoutube = {
  videoPath: string;
};

export type MediaImage = {
  image: {
    url: string;
    width: number;
    height: number;
  }[];
};

export type MediaType = "VIDEO" | "YOUTUBE" | "IMAGE";
type MediaDefault = {
  postId: string;
  title: string;
  plainBody: string;
  publishedAt: number;
};
export type MediaPost = MediaDefault &
  (
    | {
        postType: "VIDEO";
        extension: MediaVideo;
      }
    | {
        postType: "YOUTUBE";
        extension: MediaYoutube;
      }
    | {
        postType: "IMAGE";
        extension: MediaImage;
      }
  );
