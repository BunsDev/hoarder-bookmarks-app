import { and, eq, gte, like, lte, sql } from "drizzle-orm";

import {
  bookmarkLinks,
  bookmarkLists,
  bookmarks,
  bookmarksInLists,
  bookmarkTags,
  tagsOnBookmarks,
} from "@hoarder/db/schema";
import { Matcher } from "@hoarder/shared/types/search";

import { AuthedContext } from "..";

interface BookmarkQueryReturnType {
  id: string;
}

function intersect(
  vals: BookmarkQueryReturnType[][],
): BookmarkQueryReturnType[] {
  if (!vals || vals.length === 0) {
    return [];
  }

  if (vals.length === 1) {
    return [...vals[0]];
  }

  const countMap = new Map<string, number>();
  const map = new Map<string, BookmarkQueryReturnType>();

  for (const arr of vals) {
    for (const item of arr) {
      countMap.set(item.id, (countMap.get(item.id) ?? 0) + 1);
      map.set(item.id, item);
    }
  }

  const result: BookmarkQueryReturnType[] = [];
  for (const [id, count] of countMap) {
    if (count === vals.length) {
      result.push(map.get(id)!);
    }
  }

  return result;
}

function union(vals: BookmarkQueryReturnType[][]): BookmarkQueryReturnType[] {
  if (!vals || vals.length === 0) {
    return [];
  }

  const uniqueIds = new Set<string>();
  const map = new Map<string, BookmarkQueryReturnType>();
  for (const arr of vals) {
    for (const item of arr) {
      uniqueIds.add(item.id);
      map.set(item.id, item);
    }
  }

  const result: BookmarkQueryReturnType[] = [];
  for (const id of uniqueIds) {
    result.push(map.get(id)!);
  }

  return result;
}

async function getIds(
  db: AuthedContext["db"],
  userId: string,
  matcher: Matcher,
): Promise<BookmarkQueryReturnType[]> {
  switch (matcher.type) {
    case "tagName": {
      return db
        .select({ id: sql<string>`${tagsOnBookmarks.bookmarkId}`.as("id") })
        .from(tagsOnBookmarks)
        .innerJoin(bookmarkTags, eq(tagsOnBookmarks.tagId, bookmarkTags.id))
        .where(
          and(
            eq(bookmarkTags.userId, userId),
            eq(bookmarkTags.name, matcher.tagName),
          ),
        );
    }
    case "listName": {
      return db
        .select({ id: sql<string>`${bookmarksInLists.bookmarkId}`.as("id") })
        .from(bookmarksInLists)
        .innerJoin(bookmarkLists, eq(bookmarksInLists.listId, bookmarkLists.id))
        .where(
          and(
            eq(bookmarkLists.userId, userId),
            eq(bookmarkLists.name, matcher.listName),
          ),
        );
    }
    case "archived": {
      return db
        .select({ id: bookmarks.id })
        .from(bookmarks)
        .where(
          and(
            eq(bookmarks.userId, userId),
            eq(bookmarks.archived, matcher.archived),
          ),
        );
    }
    case "url": {
      return db
        .select({ id: bookmarkLinks.id })
        .from(bookmarkLinks)
        .leftJoin(bookmarks, eq(bookmarks.id, bookmarkLinks.id))
        .where(
          and(
            eq(bookmarks.userId, userId),
            like(bookmarkLinks.url, `%${matcher.url}%`),
          ),
        );
    }
    case "favourited": {
      return db
        .select({ id: bookmarks.id })
        .from(bookmarks)
        .where(
          and(
            eq(bookmarks.userId, userId),
            eq(bookmarks.favourited, matcher.favourited),
          ),
        );
    }
    case "dateAfter": {
      return db
        .select({ id: bookmarks.id })
        .from(bookmarks)
        .where(
          and(
            eq(bookmarks.userId, userId),
            gte(bookmarks.createdAt, matcher.dateAfter),
          ),
        );
    }
    case "dateBefore": {
      return db
        .select({ id: bookmarks.id })
        .from(bookmarks)
        .where(
          and(
            eq(bookmarks.userId, userId),
            lte(bookmarks.createdAt, matcher.dateBefore),
          ),
        );
    }
    case "and": {
      const vals = await Promise.all(
        matcher.matchers.map((m) => getIds(db, userId, m)),
      );
      return intersect(vals);
    }
    case "or": {
      const vals = await Promise.all(
        matcher.matchers.map((m) => getIds(db, userId, m)),
      );
      return union(vals);
    }
    default: {
      throw new Error("Unknown matcher type");
    }
  }
}

export async function getBookmarkIdsFromMatcher(
  ctx: AuthedContext,
  matcher: Matcher,
): Promise<string[]> {
  const results = await getIds(ctx.db, ctx.user.id, matcher);
  return results.map((r) => r.id);
}
