import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { WeverseModule } from "./weverse/weverse.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeormModule } from "./typeorm/typeorm.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeormModule,
    WeverseModule,
  ],
  controllers: [AppController],
  providers: [ConfigService, AppService],
})
export class AppModule {}
