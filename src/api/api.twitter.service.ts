import { Injectable } from "@nestjs/common";
import { Api } from ".";

@Injectable()
export class TwitterApi extends Api {
  constructor() {
    super();
  }
}
