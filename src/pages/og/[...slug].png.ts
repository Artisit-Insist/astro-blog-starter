import type { APIRoute } from 'astro';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { getPublishedPosts } from '../../utils.ts';
import { SITE, SERVICE, AUTHOR } from '../../consts.ts';

// 빌드/개발 모두 프로젝트 루트에서 실행되므로 cwd 기준으로 폰트를 읽는다.
const font = readFileSync(join(process.cwd(), 'src/og/Pretendard-Bold.otf'));

export async function getStaticPaths() {
  const posts = await getPublishedPosts();
  const paths = posts.map((p) => ({
    params: { slug: p.id },
    props: { title: p.data.title, tag: p.data.tags[0] || '' },
  }));
  // 사이트 기본 OG
  paths.push({ params: { slug: 'default' }, props: { title: SITE.title, tag: '' } });
  return paths;
}

// satori 엘리먼트(객체 형태)
const el = (type: string, style: Record<string, unknown>, children: unknown) => ({
  type,
  props: { style, children },
});

export const GET: APIRoute = async ({ props }) => {
  const title = String((props as any).title || SITE.title).slice(0, 70);
  const tag = String((props as any).tag || '');

  const tree = el(
    'div',
    {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      background: '#f6f5f4',
      padding: '72px 80px',
      fontFamily: 'Pretendard',
    },
    [
      el('div', { display: 'flex', alignItems: 'center', gap: '16px' }, [
        el('div', { width: '24px', height: '24px', borderRadius: '999px', background: '#0075de', display: 'flex' }, ''),
        el('div', { fontSize: '30px', color: '#615d59', display: 'flex' }, SERVICE.name),
        tag
          ? el('div', { marginLeft: '10px', fontSize: '24px', color: '#0075de', display: 'flex' }, '#' + tag)
          : el('div', { display: 'flex' }, ''),
      ]),
      el(
        'div',
        { fontSize: '64px', fontWeight: 700, color: '#1a1712', lineHeight: 1.22, letterSpacing: '-2px', display: 'flex', maxWidth: '1040px' },
        title,
      ),
      el('div', { fontSize: '27px', color: '#615d59', display: 'flex' }, `${SERVICE.tagline}  ·  ${AUTHOR.name}`),
    ],
  );

  const svg = await satori(tree as any, {
    width: 1200,
    height: 630,
    fonts: [{ name: 'Pretendard', data: font, weight: 700, style: 'normal' }],
  });

  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();

  return new Response(png, {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
};
