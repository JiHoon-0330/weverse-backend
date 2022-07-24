import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WeverseApiV2 } from "src/api";
import { Comment, Media, Noti, Password, Post } from "src/typeorm/weverse";
import { WeverseController } from "./weverse.controller";
import { WeverseService } from "./weverse.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Password, Noti, Post, Comment, Media], "WEVERSE"),
  ],
  providers: [WeverseService, WeverseApiV2],
  controllers: [WeverseController],
})
export class WeverseModule {}
