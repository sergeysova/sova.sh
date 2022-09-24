import * as t from 'runtypes';

export interface Page {
  title: string;
  description: string;
  cover_image: string | null;
  url: string;
  published_at: string;
}

interface MarkdownFile {
  frontmatter: Record<string, string>;
  file: string;
  url: string;
}

const FrontMatter = t.Record({
  title: t.String,
  description: t.String,
  date: t.String,
  language: t.Union(t.Literal('ru'), t.Literal('en')),
});

const MarkdownFile = t.Record({
  frontmatter: FrontMatter,
  file: t.String,
  url: t.String,
});

export async function getPages(): Promise<Page[]> {
  const [md, mdx] = await Promise.all([
    import.meta.glob('../pages/**/*.md'),
    import.meta.glob('../pages/**/*.mdx'),
  ]);
  const descriptors = [...Object.values(md), ...Object.values(mdx)];
  const files = await Promise.all(descriptors.map((fn) => fn()));
  return files
    .map((file) => {
      try {
        return MarkdownFile.check(file);
      } catch (error) {
        console.error('Failed to check markdown file', (file as any).file);
        throw error;
      }
    })
    .map((file) => ({
      title: file.frontmatter.title,
      description: file.frontmatter.description,
      cover_image: null,
      url: file.url,
      published_at: file.frontmatter.date,
    }))
    .sort((a, b) => new Date(b.published_at).valueOf() - new Date(a.published_at).valueOf());
}
