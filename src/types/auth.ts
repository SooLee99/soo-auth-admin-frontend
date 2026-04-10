export type AdminLoginPayload = { email: string; password: string };

export type OAuthProvider = "google" | "naver" | "kakao" | string;

export type TokenResponse = {
  accessToken: string;
  refreshToken: string;
  accessExpiresInSec?: number;
  refreshExpiresInSec?: number;
  role?: string;
  roles?: string[];
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt?: number;
  refreshTokenExpiresAt?: number;
  deviceId: string;
  role?: string;
  roles?: string[];
};
