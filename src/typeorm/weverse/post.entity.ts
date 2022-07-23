import { Author, Photo } from "type";
import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Post {
  @PrimaryColumn("varchar")
  postId!: string;

  @Column("text")
  body!: string;

  @Column("bigint")
  createdAt!: number;

  @Column("boolean")
  locked!: boolean;

  @Column("json")
  author!: Author;

  @Column("json")
  photo?: Photo["photo"][""][];

  @Column("text")
  video?: string;

  @Column("text")
  translated?: string;
}
