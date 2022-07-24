import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/typeorm/user";
import { Repository } from "typeorm";
import { USER } from "utils/database";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User, USER)
    private readonly userRepository: Repository<User>,
  ) {}

  async saveUser(userId: string, userAgent: string, count: number) {
    const user = await this.userRepository.save({
      userId,
      userAgent,
      count,
    });

    return user;
  }

  async getTest() {}
}
