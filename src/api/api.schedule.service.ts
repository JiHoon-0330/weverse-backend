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
    super({
      baseURL: "https://cafe.daum.net",
    });
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
    const endYear = endM > 12 ? yyyy + 1 : yyyy;

    const startTime = `${yyyy}-${mm}-01`;
    const endTime = `${endYear}-${endMonth}-01`;

    return await this.api({
      url: `/_c21_/api/schedule?grpid=1Yffm&fldid=AFio&startTime=${startTime}T00%3A00%3A00%2B09%3A00&endTime=${endTime}T00%3A00%3A00%2B09%3A00`,
      headers: {
        accept: "*/*",
        "accept-language": "ko,en;q=0.9,ko-KR;q=0.8,en-US;q=0.7",
        "content-type": "application/json;charset=utf-8",
        "sec-ch-ua":
          '"Google Chrome";v="105", "Not)A;Brand";v="8", "Chromium";v="105"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest",
        cookie: cookie.cookie,
        Referer: `https://cafe.daum.net/_c21_/calendar?grpid=1Yffm&fldid=AFio&date=${yyyy}-${mm}-${formatted(
          nowDate.getDate(),
        )}&viewtype=calendar`,
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
    });
  }
}
