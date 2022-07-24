import {
  Controller,
  Get,
  Query,
  Response,
  UseInterceptors,
} from "@nestjs/common";
import { ResponseInterceptor } from "src/middleware/response.interseptor.middleware";
import { InstagramService } from "./instagram.service";

@UseInterceptors(ResponseInterceptor)
@Controller("instagram")
export class TwitterController {
  constructor(private readonly instagramService: InstagramService) {}

  @Get("reels")
  async getReels(@Query("from") from?: string) {
    return await this.instagramService.getReels(from);
  }

  @Get("/video")
  async video(
    @Query("createdAt") createdAt: string,
    @Query("url") url: string,
    @Response() res: any,
  ) {
    return await this.instagramService.video(url, createdAt, res);
  }

  @Get("cookie")
  async getCookie() {
    return await this.instagramService.getCookie();
  }

  @Get("save-cookie")
  async saveCookie() {
    return await this.instagramService.saveCookie();
  }

  @Get("test")
  async getTest() {
    return await this.instagramService.getTest();
  }
}
