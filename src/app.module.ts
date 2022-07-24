import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { InstagramModule } from "./instagram/instagram.module";
import { ScheduleModule } from "./schedule/schedule.module";
import { TwitterModule } from "./twitter/twitter.module";
import { TypeormModule } from "./typeorm/typeorm.module";
import { WeverseModule } from "./weverse/weverse.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeormModule,
    WeverseModule,
    TwitterModule,
    InstagramModule,
    ScheduleModule,
  ],
  controllers: [AppController],
  providers: [ConfigService, AppService],
})
export class AppModule {}
