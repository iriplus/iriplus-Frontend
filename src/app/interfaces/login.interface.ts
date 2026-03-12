export interface Login {
    email: string;
    password: string;
    captcha?: string | null;
}

export interface LoginResponse {
  access_token: string;
}