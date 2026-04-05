// import {FRONT_END_TYPE} from "./constants.ts";

export const frontBaseUrl = import.meta.env!.BASE_URL.replace(/\/$/, "");

// export const frontEndType = import.meta.env!.VITE_APP_TYPE as keyof typeof FRONT_END_TYPE;

export const enableStrictMode = false;
export const persistentStorage = window.sessionStorage;

export const signUpLink = "https://voramall.com/member/agreement.html";

export const defaultAuthRequire: boolean = true;
export const loginPageUrl: string = `${frontBaseUrl}/login`;