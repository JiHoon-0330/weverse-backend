import { Controller, Get, Query, UseInterceptors } from "@nestjs/common";
import { ResponseInterceptor } from "src/middleware/response.interseptor.middleware";
import { WeverseService } from "./weverse.service";

@UseInterceptors(ResponseInterceptor)
@Controller("weverse")
export class WeverseController {
  constructor(private readonly weverseService: WeverseService) {}

  @Get()
  async getWeverse(@Query("from") from?: string) {
    return await this.weverseService.getWeverse(from ?? "");
  }

  @Get("save")
  async saveWeverse(@Query("post-id") postId?: string) {
    return await this.weverseService.saveWeverse(postId);
  }

  @Get("test")
  async getTest() {
    return await this.weverseService.getTest();
  }
}
