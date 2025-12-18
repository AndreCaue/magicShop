import { getValidationLogin } from "../Repositories/auth";

const TOKEN_KEY = "access_token";

export const login = async (username: string, password: string) => {
  const data = await getValidationLogin({ username, password });
  localStorage.setItem(TOKEN_KEY, data.access_token);
  return data;
};

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated() {
  return !!getToken();
}
