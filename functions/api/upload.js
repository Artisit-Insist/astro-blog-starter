// 이미지 업로드 (어드민 인증) — GitHub public/uploads/에 커밋 후 URL 반환
// POST /api/upload  (multipart/form-data, field: file)  → { url: "/uploads/..." }
// R2가 계정에서 미활성화라 GitHub 저장으로 대체. 업로드 이미지는 다음 배포 시 사이트 반영.
import { requireAdmin, ghFetch, json } from './_lib.js';

const MAX = 5 * 1024 * 1024; // 5MB
const EXT = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif', 'image/svg+xml': 'svg' };

export async function onRequestPost({ request, env }) {
  const denied = requireAdmin(request, env);
  if (denied) return denied;
  if (!env.GITHUB_TOKEN) return json({ error: 'github_not_configured' }, 500);

  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!file || typeof file === 'string') return json({ error: 'no_file' }, 400);

    const type = file.type || '';
    if (!EXT[type]) return json({ error: 'unsupported_type', detail: type }, 400);
    const buf = new Uint8Array(await file.arrayBuffer());
    if (buf.length === 0) return json({ error: 'empty' }, 400);
    if (buf.length > MAX) return json({ error: 'too_large', detail: '5MB 이하' }, 400);

    // 키: uploads/YYYY/MM/<타임스탬프>-<정리된이름>.<ext>
    const now = new Date();
    const y = now.getUTCFullYear();
    const m = String(now.getUTCMonth() + 1).padStart(2, '0');
    const base = (form.get('name') || file.name || 'image')
      .toString()
      .replace(/\.[^.]+$/, '')
      .replace(/[^a-zA-Z0-9가-힣._-]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 40) || 'image';
    const key = `uploads/${y}/${m}/${now.getTime()}-${base}.${EXT[type]}`;
    const path = `public/${key}`;

    await ghFetch(env, `/repos/${env.GITHUB_REPO}/contents/${path}`, {
      method: 'PUT',
      body: JSON.stringify({
        message: `admin: 이미지 업로드 ${key}`,
        content: bytesToBase64(buf),
        branch: env.GITHUB_BRANCH || 'main',
      }),
    });

    return json({ ok: true, url: `/${key}` });
  } catch (e) {
    return json({ error: 'upload_failed', detail: String(e).slice(0, 200) }, 502);
  }
}

function bytesToBase64(bytes) {
  let bin = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
  }
  return btoa(bin);
}
