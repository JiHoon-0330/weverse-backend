import { Controller, Get, Query, UseInterceptors } from "@nestjs/common";
import { ResponseInterceptor } from "src/middleware/response.interseptor.middleware";
import { WeverseService } from "./weverse.v2.service";

@UseInterceptors(ResponseInterceptor)
@Controller("weverse")
export class WeverseController {
  constructor(private readonly weverseService: WeverseService) {}

  @Get()
  async getWeverse(@Query("from") from?: string) {
    return await this.weverseService.getWeverse(from ?? "");
  }

  @Get("save")
  async saveWeverse() {
    return await this.weverseService.saveWeverse();
  }

  @Get("test")
  async getTest() {
    return await this.weverseService.getTest();
  }
}
