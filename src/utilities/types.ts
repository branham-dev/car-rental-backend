export type StatusState<T = unknown> = {
  success: boolean;
  message: string;
  data: T;
};
