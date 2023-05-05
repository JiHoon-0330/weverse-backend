import { NestFactory } from "@nestjs/core";
import compression from "compression";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./middleware/http.exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.getHttpAdapter().getInstance().set("etag", false);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.use(compression());

  await app.listen(3000);
}
bootstrap();
