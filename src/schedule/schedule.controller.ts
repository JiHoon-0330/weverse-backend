import { Controller, Get, UseInterceptors } from "@nestjs/common";
import { ResponseInterceptor } from "src/middleware/response.interseptor.middleware";
import { ScheduleService } from "./schedule.service";

@UseInterceptors(ResponseInterceptor)
@Controller("schedule")
export class TwitterController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  async getSchedule() {
    return await this.scheduleService.getSchedule();
  }
}
