import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ScheduleApi } from "src/api";
import { Cookie } from "src/typeorm/daum";
import { Repository } from "typeorm";
import { DAUM } from "utils/database";

@Injectable()
export class ScheduleService {
  constructor(
    private readonly scheduleApi: ScheduleApi,
    @InjectRepository(Cookie, DAUM)
    private readonly cookieRepository: Repository<Cookie>,
  ) {}

  async getSchedule() {
    const getTime = (date: any) => new Date(date).getTime();

    const [schedule, error] = await this.scheduleApi.getSchedule();

    if (!schedule) return;

    const { scheduleList } = schedule;

    return scheduleList.map((list: any) => {
      const { scheduleId, title, startTime, endTime, description, category } =
        list;
      return {
        scheduleId,
        title,
        startTime: getTime(startTime),
        endTime: getTime(endTime),
        description: description,
        category: category?.name,
      };
    });
  }

  async getTest() {
    return await this.cookieRepository.find();
  }
}
