import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity()
export class Password {
  @PrimaryColumn("bigint")
  id!: number;

  @Column("text")
  lock_password!: string;
}
