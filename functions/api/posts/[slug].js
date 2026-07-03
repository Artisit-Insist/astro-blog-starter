// 콘텐츠 관리 API — 글 읽기/저장 (GitHub에 커밋)
// GET  /api/posts/:slug            → { slug, sha, content }
// PUT  /api/posts/:slug            → body { content, sha?, message? } — sha 없으면 새 파일 생성
import { requireAdmin, ghFetch, json, utf8ToBase64, base64ToUtf8, validSlug } from '../_lib.js';

export async function onRequest({ request, env, params }) {
  const denied = requireAdmin(request, env);
  if (denied) return denied;
  if (!env.GITHUB_TOKEN) return json({ error: 'github_not_configured' }, 500);

  const slug = decodeURIComponent(params.slug || '');
  if (!validSlug(slug)) return json({ error: 'invalid_slug' }, 400);

  const repo = env.GITHUB_REPO;
  const branch = env.GITHUB_BRANCH || 'main';
  const path = `src/content/blog/${slug}`;

  try {
    if (request.method === 'GET') {
      const file = await ghFetch(env, `/repos/${repo}/contents/${path}?ref=${branch}`);
      return json({ slug, sha: file.sha, content: base64ToUtf8(file.content) });
    }

    if (request.method === 'PUT') {
      const body = await request.json();
      if (typeof body.content !== 'string' || body.content.length < 10) {
        return json({ error: 'empty_content' }, 400);
      }
      if (body.content.length > 200_000) return json({ error: 'too_large' }, 400);

      const payload = {
        message: body.message || `admin: ${slug} ${body.sha ? '수정' : '작성'} (웹 에디터)`,
        content: utf8ToBase64(body.content),
        branch,
      };
      if (body.sha) payload.sha = body.sha; // 있으면 수정, 없으면 생성

      const result = await ghFetch(env, `/repos/${repo}/contents/${path}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      return json({ ok: true, slug, sha: result.content.sha, commit: result.commit.sha });
    }

    if (request.method === 'DELETE') {
      const url = new URL(request.url);
      let sha = url.searchParams.get('sha');
      if (!sha) {
        // sha 미제공 시 현재 파일 sha 조회
        const file = await ghFetch(env, `/repos/${repo}/contents/${path}?ref=${branch}`);
        sha = file.sha;
      }
      await ghFetch(env, `/repos/${repo}/contents/${path}`, {
        method: 'DELETE',
        body: JSON.stringify({ message: `admin: ${slug} 삭제 (웹 에디터)`, sha, branch }),
      });
      return json({ ok: true, slug });
    }

    return json({ error: 'method_not_allowed' }, 405);
  } catch (e) {
    const msg = String(e);
    // 저장 충돌(다른 곳에서 먼저 수정됨)
    if (msg.includes('409') || msg.includes('does not match')) {
      return json({ error: 'conflict', detail: '다른 곳에서 먼저 수정되었습니다. 새로고침 후 다시 시도하세요.' }, 409);
    }
    if (msg.includes('404')) return json({ error: 'not_found' }, 404);
    return json({ error: 'github_error', detail: msg.slice(0, 300) }, 502);
  }
}
