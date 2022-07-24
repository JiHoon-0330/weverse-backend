import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { InstagramApi } from "src/api";
import { Browser } from "src/browser";
import { Cookie } from "src/typeorm/instagram";
import { INSTAGRAM } from "utils/database";
import { InstagramController } from "./instagram.controller";
import { InstagramService } from "./instagram.service";

@Module({
  imports: [TypeOrmModule.forFeature([Cookie], INSTAGRAM)],
  providers: [InstagramService, InstagramApi, Browser],
  controllers: [InstagramController],
})
export class InstagramModule {}
