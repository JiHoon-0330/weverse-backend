import { MediaImage } from "type";
import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Media {
  @PrimaryColumn("varchar")
  postId!: string;

  @Column("text")
  title!: string;

  @Column("text")
  body!: string;

  @Column("bigint")
  createdAt!: number;

  @Column("json")
  photo?: MediaImage["image"];

  @Column("text")
  video?: string;

  @Column("text")
  youtube?: string;
}
