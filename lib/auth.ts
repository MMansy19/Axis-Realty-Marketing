import { cookies } from 'next/headers';

const ADMIN_COOKIE_NAME = 'admin_token';
const ADMIN_SECRET = process.env.ADMIN_SECRET!;

export async function verifyAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return token === ADMIN_SECRET;
}

export function getAdminCookieName() {
  return ADMIN_COOKIE_NAME;
}

export function getAdminSecret() {
  return ADMIN_SECRET;
}
