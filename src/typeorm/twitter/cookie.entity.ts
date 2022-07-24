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
  x_csrf_token!: string;

  @Column("text")
  x_guest_token!: string;
}
