import { AxiosError } from "axios";

export type ApiRetuenType<T, E = any> = Promise<
  [T, undefined] | [undefined, Required<AxiosError<E>>["response"]]
>;

export type Return<T, E = any> = Promise<[T, undefined] | [undefined, E]>;
