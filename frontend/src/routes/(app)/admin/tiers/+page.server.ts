import type { PageServerLoad } from './$types';
import { PUBLIC_API_URL } from '$env/static/public';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ cookies, fetch, url }) => {
  const token = cookies.get('Access');
  if (!token) throw redirect(302, `/login?redirectTo=${encodeURIComponent(url.pathname)}`);

  const fetchUrl = `${PUBLIC_API_URL}/admin/tiers`;
  try {
    const res = await fetch(fetchUrl, { headers: { Authorization: `Bearer ${token}` } });
    if (res.status === 401) throw redirect(302, `/login?redirectTo=${encodeURIComponent(url.pathname)}`);
    const tiers = await res.json();
    return { tiers, access: token };
  } catch (error) {
    console.error('[Admin][Tiers] Fetch error:', error);
    throw error;
  }
};
