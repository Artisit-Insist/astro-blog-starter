// 콘텐츠 관리 API — 글 목록 (GitHub Contents API 프록시)
// GET /api/posts  (헤더 x-admin-key 인증) → 각 글의 slug/size/sha/title/draft
import { requireAdmin, ghFetch, json, base64ToUtf8 } from './_lib.js';

export async function onRequestGet({ request, env }) {
  const denied = requireAdmin(request, env);
  if (denied) return denied;
  if (!env.GITHUB_TOKEN) return json({ error: 'github_not_configured' }, 500);

  const ref = env.GITHUB_BRANCH || 'main';
  try {
    const dir = await ghFetch(
      env,
      `/repos/${env.GITHUB_REPO}/contents/src/content/blog?ref=${ref}`,
    );
    const files = dir
      .filter((f) => f.type === 'file' && /\.(md|mdx)$/.test(f.name))
      .sort((a, b) => b.name.localeCompare(a.name)); // 파일명 날짜 → 최신순

    // 각 글의 frontmatter(title/draft)를 병렬로 읽음
    const posts = await Promise.all(
      files.map(async (f) => {
        let title = f.name;
        let draft = false;
        try {
          const file = await ghFetch(
            env,
            `/repos/${env.GITHUB_REPO}/contents/src/content/blog/${f.name}?ref=${ref}`,
          );
          const content = base64ToUtf8(file.content);
          const fm = (content.match(/^---\n([\s\S]*?)\n---/) || [])[1] || '';
          const tm = fm.match(/^title:\s*(.+)$/m);
          if (tm) title = tm[1].replace(/^['"]|['"]$/g, '').trim();
          draft = /^draft:\s*true/m.test(fm);
        } catch {
          /* 개별 실패는 무시하고 파일명만 */
        }
        return { slug: f.name, size: f.size, sha: f.sha, title, draft };
      }),
    );
    return json({ posts });
  } catch (e) {
    return json({ error: 'github_error', detail: String(e) }, 502);
  }
}
