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
  let previousPageNumber = 0;
  const requestedStates = new Set<string>();

  while (true) {
    const state = `${limit}:${offset}`;
    if (requestedStates.has(state)) {
      throw new Error(`Simplecast pagination repeated page state ${state}`);
    }
    requestedStates.add(state);

    const page = await fetchPage(firstPage ? undefined : {limit, offset});
    const hasNextLink = page.pages && Object.hasOwn(page.pages, 'next');
    const pageNumber = page.pages?.current;
    const totalPages = page.pages?.total;
    if (pageNumber !== undefined) {
      if (pageNumber <= previousPageNumber) {
        throw new Error('Paginated API did not advance its page number');
      }
      if (totalPages !== undefined && pageNumber > totalPages) {
        throw new Error('Paginated API exceeded its reported page total');
      }
      previousPageNumber = pageNumber;
    }

    const hasNextPage = hasNextLink
      ? page.pages?.next !== null
      : pageNumber !== undefined && totalPages !== undefined
        ? pageNumber < totalPages
        : page.collection.length >= (page.pages?.limit ?? limit);

    if (
      hasNextLink &&
      ((page.pages?.next === null &&
        pageNumber !== undefined &&
        totalPages !== undefined &&
        pageNumber < totalPages) ||
        (page.pages?.next !== null &&
          pageNumber !== undefined &&
          totalPages !== undefined &&
          pageNumber >= totalPages))
    ) {
      throw new Error('Paginated API continuation conflicts with its reported page total');
    }

    if (!hasNextPage) {
      items.push(...page.collection);
      return items;
    }

    if (page.collection.length === 0) {
      throw new Error('Paginated API reported another page but returned no items');
    }

    items.push(...page.collection);
    const nextLink = hasNextLink ? page.pages?.next : undefined;
    if (hasNextLink) {
      if (typeof nextLink !== 'string') {
        throw new Error('Simplecast returned a malformed pagination continuation');
      }
      let continuation: URL;
      try {
        continuation = new URL(nextLink, 'https://api.simplecast.com');
      } catch {
        throw new Error('Simplecast returned a malformed pagination continuation');
      }
      const nextOffset = Number(continuation.searchParams.get('offset'));
      const nextLimit = Number(continuation.searchParams.get('limit'));
      if (
        !Number.isInteger(nextOffset) ||
        nextOffset < 0 ||
        !Number.isInteger(nextLimit) ||
        nextLimit <= 0
      ) {
        throw new Error('Simplecast returned a malformed pagination continuation');
      }
      if (nextOffset <= offset) {
        throw new Error('Simplecast pagination continuation did not advance the offset');
      }
      offset = nextOffset;
      limit = nextLimit;
    } else {
      const nextOffset = (page.pages?.offset ?? offset) + page.collection.length;
      if (nextOffset <= offset) {
        throw new Error('Simplecast pagination did not advance the offset');
      }
      offset = nextOffset;
      limit = page.pages?.limit ?? limit;
    }
    firstPage = false;
  }
}
