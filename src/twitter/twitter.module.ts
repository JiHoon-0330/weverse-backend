import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TwitterApi } from "src/api";
import { Browser } from "src/browser";
import { Cookie } from "src/typeorm/twitter";
import { TwitterController } from "./twitter.controller";
import { TwitterService } from "./twitter.service";

@Module({
  imports: [TypeOrmModule.forFeature([Cookie], "TWITTER")],
  providers: [TwitterService, TwitterApi, Browser],
  controllers: [TwitterController],
})
export class TwitterModule {}
