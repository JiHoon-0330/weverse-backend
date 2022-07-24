import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Cookie } from "src/typeorm/daum";
import { Return } from "type";
import { Repository } from "typeorm";
import { DAUM } from "utils/database";
import { Api } from ".";

@Injectable()
export class ScheduleApi extends Api {
  constructor(
    @InjectRepository(Cookie, DAUM)
    private readonly cookieRepository: Repository<Cookie>,
  ) {
    super({ baseURL: "https://cafe.daum.net" });
  }

  async getSchedule(): Return<any> {
    const formatted = (value: number) => (value < 10 ? `0${value}` : value);

    const [cookie] = await this.cookieRepository.find();
    const nowDate = new Date();
    const yyyy = nowDate.getFullYear();
    const m = nowDate.getMonth() + 1;
    const endM = m + 3;
    const mm = formatted(m);
    const endMonth = formatted(endM > 12 ? endM - 12 : endM);
    const endYear = endMonth > 12 ? yyyy + 1 : yyyy;

    const startTime = `${yyyy}-${mm}-01`;
    const endTime = `${endYear}-${endMonth}-01`;
    return await this.api({
      url: `/_c21_/api/schedule?grpid=1Yffm&fldid=AFio&startTime=${startTime}T00%3A00%3A00%2B09%3A00&endTime=${endTime}T00%3A00%3A00%2B09%3A00`,
      headers: {
        "content-type": "application/json;charset=utf-8",
        cookie: cookie.cookie,
      },
    });
  }
}
