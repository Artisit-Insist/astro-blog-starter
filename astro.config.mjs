// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import { SITE } from './src/consts.ts';

// ```mermaid 코드블록을 shiki 하이라이트 전에 <pre class="mermaid">로 바꿔
// 클라이언트 mermaid.js가 도식으로 렌더하게 한다. (remark라 shiki보다 먼저 실행)
function remarkMermaid() {
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const walk = (node) => {
    if (!node || !Array.isArray(node.children)) return;
    for (const child of node.children) {
      if (child.type === 'code' && child.lang === 'mermaid') {
        child.type = 'html';
        child.value = `<pre class="mermaid">${esc(child.value)}</pre>`;
        delete child.lang;
        delete child.meta;
      } else {
        walk(child);
      }
    }
  };
  return (tree) => walk(tree);
}

// https://astro.build
export default defineConfig({
  site: SITE.url,
  trailingSlash: 'ignore',
  integrations: [mdx(), sitemap({ filter: (page) => !page.includes('/admin') })],
  markdown: {
    remarkPlugins: [remarkMermaid],
    shikiConfig: { theme: 'github-dark', wrap: true },
  },
  build: { format: 'directory' },
});
