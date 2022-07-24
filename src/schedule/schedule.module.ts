import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ScheduleApi } from "src/api";
import { Cookie } from "src/typeorm/daum";
import { DAUM } from "utils/database";
import { TwitterController } from "./schedule.controller";
import { ScheduleService } from "./schedule.service";

@Module({
  imports: [TypeOrmModule.forFeature([Cookie], DAUM)],
  providers: [ScheduleService, ScheduleApi],
  controllers: [TwitterController],
})
export class ScheduleModule {}
