import { Controller, Get, Query, UseInterceptors } from "@nestjs/common";
import { ResponseInterceptor } from "src/middleware/response.interseptor.middleware";
import { TwitterService } from "./twitter.service";

@UseInterceptors(ResponseInterceptor)
@Controller("twitter")
export class TwitterController {
  constructor(private readonly twitterService: TwitterService) {}

  @Get()
  async getTwitter(@Query("from") from?: string) {
    return await this.twitterService.getTwitter(from ?? "");
  }

  @Get("cookie")
  async getCookie() {
    return await this.twitterService.getCookie();
  }

  @Get("save-cookie")
  async saveCookie() {
    return await this.twitterService.saveCookie();
  }

  @Get("test")
  async getTest() {
    return await this.twitterService.getTest();
  }
}
