import * as z from 'zod';

export const NewsletterIssueSchema = z.object({
  number: z.number().int().positive(),
  introduction: z.string(),
  date: z.coerce.date(),
  image: z.string().optional(),
  draft: z.boolean().optional(),
});

export type NewsletterIssueData = z.infer<typeof NewsletterIssueSchema>;

export interface NewsletterIssueSummary {
  number: number;
  slug: string;
  url: string;
  image?: string;
  date: Date;
  description: string;
}

export function getPublishedNewsletterIssues(
  entries: readonly {id: string; data: NewsletterIssueData}[],
  site: string | URL,
): NewsletterIssueSummary[] {
  const numbers = new Set<number>();
  const slugs = new Set<string>();

  for (const {id, data} of entries) {
    if (numbers.has(data.number)) {
      throw new Error(`Newsletter returned a duplicate issue number: ${data.number}`);
    }
    if (slugs.has(id)) {
      throw new Error(`Newsletter returned a duplicate issue slug: ${id}`);
    }
    numbers.add(data.number);
    slugs.add(id);
  }

  return entries
    .filter(({data}) => !data.draft)
    .sort((a, b) => b.data.number - a.data.number)
    .map(({id, data}) => ({
      number: data.number,
      slug: id,
      url: new URL(`/issues/${id}`, site).toString(),
      image: data.image?.startsWith('/') ? new URL(data.image, site).toString() : data.image,
      date: data.date,
      description: data.introduction,
    }));
}
