import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";

const getConfig = (
  configService: ConfigService,
  database: string,
): TypeOrmModuleOptions | Promise<TypeOrmModuleOptions> => ({
  type: "mysql",
  host: configService.get("HOST"),
  port: configService.get("PORT"),
  username: configService.get("NAME"),
  password: configService.get("PASSWORD"),
  database: configService.get(database),
  entities: [__dirname + "/**/*.entity{.ts,.js}"],
  synchronize: false,
  logging: true,
  charset: "utf8mb4",
  keepConnectionAlive: true,
});

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        getConfig(configService, "DATABASE_WEVERSE"),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        getConfig(configService, "DATABASE_TWITTER"),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        getConfig(configService, "DATABASE_INSTAGRAM"),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        getConfig(configService, "DATABASE_DAUM"),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        getConfig(configService, "DATABASE_FCM"),
    }),
  ],
})
export class TypeormModule {}
