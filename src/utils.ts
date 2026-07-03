import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

/** 발행된(초안 아님) 글을 최신순으로 반환. 개발 모드에서는 초안도 포함. */
export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', ({ data }) =>
    import.meta.env.PROD ? data.draft !== true : true,
  );
  return posts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
}

/** 한국어 날짜 표기: 2026년 7월 2일 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/** 한국어 기준 예상 읽기 시간(분). 분당 약 500자로 추정. */
export function readingTime(body: string | undefined): number {
  const chars = (body ?? '').replace(/\s/g, '').length;
  return Math.max(1, Math.round(chars / 500));
}

/** 글을 "YYYY년 M월" 단위로 최신순 그룹핑 (아카이브/피드용) */
export function groupByMonth(posts: Post[]): { label: string; posts: Post[] }[] {
  const groups: { label: string; posts: Post[] }[] = [];
  for (const p of posts) {
    const d = p.data.pubDate;
    const label = `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
    let g = groups.find((x) => x.label === label);
    if (!g) {
      g = { label, posts: [] };
      groups.push(g);
    }
    g.posts.push(p);
  }
  return groups;
}

/** 같은 태그를 공유하는 관련 글 (겹치는 태그 많은 순, 자기 제외, 최대 limit개) */
export async function getRelatedPosts(current: Post, limit = 3): Promise<Post[]> {
  const tags = new Set(current.data.tags);
  if (tags.size === 0) return [];
  const posts = await getPublishedPosts();
  return posts
    .filter((p) => p.id !== current.id)
    .map((p) => ({ p, shared: p.data.tags.filter((t) => tags.has(t)).length }))
    .filter((x) => x.shared > 0)
    .sort((a, b) => b.shared - a.shared || b.p.data.pubDate.valueOf() - a.p.data.pubDate.valueOf())
    .slice(0, limit)
    .map((x) => x.p);
}

/** 태그별 스티커 컬러(장식 전용 — 구조·CTA에 쓰지 않음) */
const STICKERS = [
  'var(--sticker-sky)',
  'var(--sticker-pink)',
  'var(--sticker-teal)',
  'var(--sticker-orange)',
  'var(--sticker-green)',
  'var(--sticker-purple)',
];
export function stickerColor(tag: string): string {
  let h = 0;
  for (const c of tag) h = (h * 31 + c.charCodeAt(0)) % 997;
  return STICKERS[h % STICKERS.length];
}

/** 모든 태그를 빈도순으로 반환 */
export async function getAllTags(): Promise<{ tag: string; count: number }[]> {
  const posts = await getPublishedPosts();
  const map = new Map<string, number>();
  for (const p of posts) {
    for (const t of p.data.tags) map.set(t, (map.get(t) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}
