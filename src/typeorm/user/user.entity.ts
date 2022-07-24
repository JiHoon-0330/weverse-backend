import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class User {
  @PrimaryColumn("text")
  userId!: string;

  @Column("text")
  userAgent!: string;

  @Column("bigint")
  count!: number;
}
