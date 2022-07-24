import { Controller, Get, Query, UseInterceptors } from "@nestjs/common";
import { ResponseInterceptor } from "src/middleware/response.interseptor.middleware";
import { UserService } from "./user.service";

@UseInterceptors(ResponseInterceptor)
@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async saveUser(
    @Query("userId") userId: string,
    @Query("count") count: number,
    @Query("userAgent") userAgent: string,
  ) {
    return await this.userService.saveUser(userId, userAgent, count);
  }

  @Get("test")
  async getTest() {
    return await this.userService.getTest();
  }
}
