// 어드민 통계 API (Cloudflare Pages Function) — 비밀번호(ADMIN_PASSWORD)로 보호.
// GET /api/stats?days=30  (헤더 x-admin-key 또는 ?key= 로 인증)

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const key = request.headers.get('x-admin-key') || url.searchParams.get('key') || '';
  const expected = env.ADMIN_PASSWORD || '';

  if (!expected) return json({ error: 'not_configured' }, 500);
  if (key !== expected) return json({ error: 'unauthorized' }, 401);
  if (!env.DB) return json({ error: 'no_db' }, 500);

  const days = Math.min(365, Math.max(1, parseInt(url.searchParams.get('days') || '30', 10)));
  const since = kstDay(Date.now() - (days - 1) * 86400000);
  const DB = env.DB;
  const rows = async (sql, ...b) => (await DB.prepare(sql).bind(...b).all()).results;

  try {
    const totals = await DB.prepare(
      'SELECT COUNT(*) AS views, COUNT(DISTINCT visitor) AS visitors FROM pageviews WHERE day >= ?',
    )
      .bind(since)
      .first();

    const byDay = await rows(
      'SELECT day, COUNT(*) AS views, COUNT(DISTINCT visitor) AS visitors FROM pageviews WHERE day >= ? GROUP BY day ORDER BY day',
      since,
    );
    const topPaths = await rows(
      'SELECT path, COUNT(*) AS views FROM pageviews WHERE day >= ? GROUP BY path ORDER BY views DESC LIMIT 12',
      since,
    );
    const refTypes = await rows(
      'SELECT referrer_type AS type, COUNT(*) AS views FROM pageviews WHERE day >= ? GROUP BY referrer_type ORDER BY views DESC',
      since,
    );
    const topRef = await rows(
      "SELECT referrer, COUNT(*) AS views FROM pageviews WHERE day >= ? AND referrer <> '' GROUP BY referrer ORDER BY views DESC LIMIT 12",
      since,
    );
    const countries = await rows(
      'SELECT country, COUNT(*) AS views FROM pageviews WHERE day >= ? GROUP BY country ORDER BY views DESC LIMIT 12',
      since,
    );
    const devices = await rows(
      'SELECT device, COUNT(*) AS views FROM pageviews WHERE day >= ? GROUP BY device ORDER BY views DESC',
      since,
    );

    // 구독자 총계 (subscribers 테이블이 없으면 0)
    let subscribers = 0;
    try {
      const s = await DB.prepare('SELECT COUNT(*) AS n FROM subscribers').first();
      subscribers = (s && s.n) || 0;
    } catch {
      subscribers = 0;
    }

    return json({ days, since, totals, byDay, topPaths, refTypes, topRef, countries, devices, subscribers });
  } catch (e) {
    return json({ error: 'query_failed', detail: String(e) }, 500);
  }
}

function kstDay(ms) {
  return new Date(ms + 9 * 3600 * 1000).toISOString().slice(0, 10);
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}
