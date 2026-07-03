import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// 블로그 글 컬렉션 — 파일은 src/content/blog/*.md(x)
const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      // 검색 스니펫/소셜 공유에 쓰이는 요약 (120~160자 권장)
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      tags: z.array(z.string()).default([]),
      // SEO/GEO 키워드
      keywords: z.array(z.string()).default([]),
      // 글 상단 한 줄 요약 (GEO: AI가 인용하기 좋은 TL;DR)
      tldr: z.string().optional(),
      heroImage: image().optional(),
      heroAlt: z.string().optional(),
      // 소셜 공유 이미지 (public/ 기준 경로). 없으면 사이트 기본 이미지 사용
      ogImage: z.string().optional(),
      draft: z.boolean().default(false),
    }),
});

export const collections = { blog };
