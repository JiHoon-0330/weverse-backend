import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import axios from "axios";
import { Request, Response } from "express";
import { Observable, map } from "rxjs";

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const httpArgumentsHost = context.switchToHttp();
    const request = httpArgumentsHost.getRequest<Request>();
    const response = httpArgumentsHost.getResponse<Response>();

    const userAgent = request.headers?.["user-agent"];
    const ip = request?.headers?.["x-forwarded-for"];

    if (
      userAgent !== "wooah.dlwlrma.app/vercel" &&
      userAgent !== "localhost:3000" &&
      ip !== "36.39.116.39"
    ) {
      axios({
        method: "POST",
        baseURL: "https://hooks.slack.com",
        url: "/services/T03LZ2Q53V2/B057PQYRUBB/VRGe2lYR5MGrtTijvEIGIp3V",
        headers: {
          "Content-type": "application/json",
        },
        data: {
          text: JSON.stringify(request.headers, null, 2),
        },
      });
    }

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
