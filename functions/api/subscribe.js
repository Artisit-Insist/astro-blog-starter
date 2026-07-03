// 이메일 구독 수집 (공개 엔드포인트) — D1 subscribers에 저장
// POST /api/subscribe  body { email, source? }
export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = String(body.email || '').trim().toLowerCase();
    const source = String(body.source || 'site').slice(0, 40);

    // 간단한 이메일 검증
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) {
      return json({ error: 'invalid_email' }, 400);
    }
    if (!env.DB) return json({ error: 'no_db' }, 500);

    const res = await env.DB.prepare(
      'INSERT OR IGNORE INTO subscribers (email, ts, source) VALUES (?, ?, ?)',
    )
      .bind(email, Date.now(), source)
      .run();

    const added = res.meta && res.meta.changes > 0;
    return json({ ok: true, duplicate: !added });
  } catch (e) {
    return json({ error: 'failed', detail: String(e).slice(0, 200) }, 500);
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}
