import * as z from 'zod';

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
const FrontMatter = z.object({
  title: z.string(),
  description: z.string(),
  date: z.string(),
  language: z.enum(['ru', 'en']),
});

const MarkdownFile = z.object({
  frontmatter: FrontMatter,
  file: z.string(),
  url: z.string(),
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
        return MarkdownFile.parse(file);
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
