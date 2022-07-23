import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { map, Observable } from "rxjs";
import { Request, Response } from "express";

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const httpArgumentsHost = context.switchToHttp();
    const request = httpArgumentsHost.getRequest<Request>();
    const response = httpArgumentsHost.getResponse<Response>();

    return next.handle().pipe(
      map((data) => {
        if (!data) {
          response.statusCode = 500;
          return;
        }

        response.setHeader(
          "Cache-Control",
          "no-cache, no-store, must-revalidate",
        );
        response.setHeader("Content-Type", "application/json; charset=utf-8");

        return data;
      }),
    );
  }
}
