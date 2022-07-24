import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/typeorm/user";
import { USER } from "utils/database";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

@Module({
  imports: [TypeOrmModule.forFeature([User], USER)],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
