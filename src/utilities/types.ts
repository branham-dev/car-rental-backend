export type StatusState<T = unknown> = {
  success: boolean;
  message: string;
  code?: string;
  data: T;
};
