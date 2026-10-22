export type JWTPayloadType = {
  id: number;
  userType: string;
};

export type AccessTokenType = {
  accessToken: string;
};

declare module 'express' {
  interface Request {
    user?: JWTPayloadType;
  }
}
