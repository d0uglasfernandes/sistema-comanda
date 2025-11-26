import { cookies } from 'next/headers';

const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';

export async function setAuthCookies(tokens: { accessToken: string; refreshToken: string }) {
  const cookieStore = await cookies();
  
  cookieStore.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60, // 15 minutes
    path: '/',
  });
  
  cookieStore.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
}

export async function getAuthCookies() {
  const cookieStore = await cookies();
  
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
  
  return { accessToken, refreshToken };
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
}