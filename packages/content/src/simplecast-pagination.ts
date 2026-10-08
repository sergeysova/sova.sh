export interface Pagination {
  limit: number;
  offset: number;
}

export interface PaginatedCollection<T> {
  collection: T[];
  pages?: {
    total?: number;
    limit?: number;
    offset?: number;
    current?: number;
    next?: unknown;
  } | null;
}

export async function collectPages<T>(
  fetchPage: (pagination?: Pagination) => Promise<PaginatedCollection<T>>,
  defaultLimit: number,
): Promise<T[]> {
  const items: T[] = [];
  let offset = 0;
  let limit = defaultLimit;
  let firstPage = true;

  while (true) {
    const page = await fetchPage(firstPage ? undefined : {limit, offset});
    const hasNextLink = page.pages && Object.hasOwn(page.pages, 'next');
    const hasNextPage = hasNextLink
      ? page.pages?.next !== null
      : page.pages?.current !== undefined && page.pages.total !== undefined
        ? page.pages.current < page.pages.total
        : page.collection.length >= (page.pages?.limit ?? limit);

    if (!hasNextPage) {
      items.push(...page.collection);
      return items;
    }

    if (page.collection.length === 0) {
      throw new Error('Paginated API reported another page but returned no items');
    }

    items.push(...page.collection);
    limit = page.pages?.limit ?? limit;
    offset = (page.pages?.offset ?? offset) + page.collection.length;
    firstPage = false;
  }
}
