export type LoginMethod = "email" | "id" | "phone";

export type EmailLoginPayload = { email: string; password: string };
export type IdLoginPayload = { loginId: string; password: string };
export type PhoneLoginPayload = { phoneNumber: string; password: string };

export type EmailSignupPayload = { email: string; password: string; name?: string };
export type IdSignupPayload = { loginId: string; password: string; name?: string };
export type PhoneSignupPayload = { phoneNumber: string; password: string; name?: string };

export type OAuthProvider = "google" | "naver" | "kakao" | string;

export type TokenResponse = {
  accessToken: string;
  refreshToken: string;
  accessExpiresInSec?: number;
  refreshExpiresInSec?: number;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt?: number;
  refreshTokenExpiresAt?: number;
  deviceId: string;
};
