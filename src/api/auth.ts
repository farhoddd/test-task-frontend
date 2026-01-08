import { API_CONFIG } from './config';

export interface AuthResponse {
  token: string;
  lifetime: number;
}

export interface AuthCredentials {
  username: string;
  password: string;
}

export async function login(
  credentials: AuthCredentials
): Promise<AuthResponse> {
  const body = new URLSearchParams({
    _username: credentials.username,
    _password: credentials.password,
    _subdomain: API_CONFIG.SUBDOMAIN,
  });

  const response = await fetch(
    `${API_CONFIG.getAuthUrl()}${API_CONFIG.ENDPOINTS.AUTH}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: body.toString(),
    }
  );

  if (!response.ok) {
    throw new Error('Ошибка авторизации');
  }

  return response.json();
}
