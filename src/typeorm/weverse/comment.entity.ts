import { Author } from "type";
import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Comment {
  @PrimaryColumn("varchar")
  commentId!: string;

  @Column("varchar")
  postId!: string;

  @Column("text")
  body!: string;

  @Column("bigint")
  createdAt!: number;

  @Column("json")
  author!: Author;

  @Column("text")
  translated?: string;

  @Column("json")
  parent?: Omit<Comment, "parent" | "postId">;
}
