interface _JWTPayload {
  id: string;
  username: string;
  timestamp: number;
}
export type JWTPayload<R extends boolean = false> = _JWTPayload & {
  refresh?: R;
} & (R extends true
    ? {
        access_token: string;
      }
    : Record<string, never>);
