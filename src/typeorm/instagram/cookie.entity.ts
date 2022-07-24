import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Cookie {
  @PrimaryColumn("int")
  id!: number;

  @Column("bigint")
  createAt!: number;

  @Column("text")
  cookie!: string;

  @Column("text")
  csrftoken!: string;

  @Column("text")
  mid!: string;

  @Column("text")
  ig_did!: string;
}
