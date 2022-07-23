import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Noti {
  @PrimaryColumn("varchar")
  activityId!: string;

  @Column("varchar")
  postId!: string;

  @Column("text")
  messageId!: string;

  @Column("text")
  scheme!: string;

  @Column("text")
  webUrl!: string;

  @Column("bigint")
  time!: number;

  @Column("int")
  count!: number;
}
