// 방문 수집 엔드포인트 (Cloudflare Pages Function)
// 클라이언트 비콘이 POST로 { p: 경로, r: 리퍼러 }를 보냄. IP는 저장하지 않고
// 방문자 식별은 (IP+UA+날짜) 해시로만 처리 → 개인정보 비식별.

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json().catch(() => ({}));

    let path = String(body.p || '/').slice(0, 512);
    if (!path.startsWith('/')) path = '/' + path;
    // admin/api 자체 트래픽은 집계 제외
    if (path.startsWith('/admin') || path.startsWith('/api')) {
      return new Response(null, { status: 204 });
    }

    const refHost = hostOf(String(body.r || ''));
    const refType = classifyRef(refHost);
    const ua = request.headers.get('user-agent') || '';
    const device = deviceOf(ua);
    const country = request.headers.get('cf-ipcountry') || 'XX';
    const ip = request.headers.get('cf-connecting-ip') || '';

    const now = Date.now();
    const day = kstDay(now);
    const visitor = await hashVisitor(ip, ua, day, env.ANALYTICS_SALT || 'coa-salt');

    if (env.DB) {
      await env.DB.prepare(
        `INSERT INTO pageviews (ts, day, path, referrer, referrer_type, country, device, visitor)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
        .bind(now, day, path, refHost, refType, country, device, visitor)
        .run();
    }
    return new Response(null, { status: 204 });
  } catch {
    // 수집 실패는 조용히 무시 (방문 경험에 영향 X)
    return new Response(null, { status: 204 });
  }
}

// 한국시간(KST) 기준 YYYY-MM-DD
function kstDay(ms) {
  return new Date(ms + 9 * 3600 * 1000).toISOString().slice(0, 10);
}

function hostOf(url) {
  if (!url) return '';
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function classifyRef(host) {
  if (!host) return 'direct';
  if (/google|naver|bing|daum|yahoo|duckduckgo|search|kagi/.test(host)) return 'search';
  if (/facebook|fb\.|instagram|threads|linkedin|lnkd|twitter|x\.com|t\.co|youtube|youtu\.be|kakao|band\.us/.test(host))
    return 'social';
  return 'referral';
}

function deviceOf(ua) {
  if (/iPad|Tablet/i.test(ua)) return 'tablet';
  if (/Mobi|Android|iPhone/i.test(ua)) return 'mobile';
  return 'desktop';
}

async function hashVisitor(ip, ua, day, salt) {
  const data = new TextEncoder().encode(`${ip}|${ua}|${day}|${salt}`);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(buf)]
    .slice(0, 8)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
