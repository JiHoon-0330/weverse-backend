import axios, { AxiosError, AxiosRequestConfig } from "axios";
import merge from "lodash.merge";
import { ApiRetuenType } from "type";
export class Api {
  #config: AxiosRequestConfig;

  constructor(config?: AxiosRequestConfig) {
    this.#config = config ?? {};
  }

  protected set setConfig(config: AxiosRequestConfig) {
    this.#config = merge(this.#config, config);
  }

  protected async api<T, E = any>(
    config: AxiosRequestConfig,
  ): ApiRetuenType<T, E> {
    try {
      const { data } = await axios({
        ...this.#config,
        ...config,
      });

      return [data, undefined];
    } catch (error) {
      const { response } = error as Required<AxiosError<E>>;
      console.error(response);
      return [undefined, response];
    }
  }
}
