// 어드민 API 공용 헬퍼 (언더스코어 파일은 라우팅에서 제외됨)

export function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

/** x-admin-key 인증. 실패 시 Response 반환, 통과 시 null */
export function requireAdmin(request, env) {
  const key = request.headers.get('x-admin-key') || '';
  if (!env.ADMIN_PASSWORD) return json({ error: 'not_configured' }, 500);
  if (key !== env.ADMIN_PASSWORD) return json({ error: 'unauthorized' }, 401);
  return null;
}

/** GitHub REST API 호출 (JSON 반환) */
export async function ghFetch(env, path, init = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'astro-blog-admin',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json();
}

/** UTF-8 문자열 → base64 (GitHub contents API용) */
export function utf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(bin);
}

/** base64 → UTF-8 문자열 */
export function base64ToUtf8(b64) {
  const bin = atob(b64.replace(/\n/g, ''));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

/** 파일명(슬러그) 검증 — 경로 탈출 방지 */
export function validSlug(slug) {
  return /^[A-Za-z0-9가-힣][A-Za-z0-9가-힣._-]*\.(md|mdx)$/.test(slug) && !slug.includes('..');
}
