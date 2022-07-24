import { Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Cookie {
  @PrimaryColumn("text")
  cookie!: number;
}
