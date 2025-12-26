import { cookies } from 'next/headers';

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();

    if (!allCookies.length) return null;

    const cookieHeader = allCookies.map((c) => `${c.name}=${c.value}`).join('; ');

    const res = await fetch(`${process.env.SERVER_API_URL}/auth/me`, {
      headers: {
        cookie: cookieHeader,
      },
      cache: 'no-store',
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!data.success) return null;

    return data.user;
  } catch (e) {
    console.error('getCurrentUser error:', e);
    return null;
  }
}
