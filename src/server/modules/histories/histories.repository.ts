import { db } from "@/src/server/db";
import { histories } from "@/src/server/db/schema";
import { eq } from "drizzle-orm";

export type History = typeof histories.$inferSelect;
export type CreateHistoryInput = Omit<typeof histories.$inferInsert, "id" | "sentAt">
export type UpdateHistoryInput = Partial<CreateHistoryInput>;

export async function findAllHistories(): Promise<History[]> {
  return db.select().from(histories).orderBy(histories.sentAt);
}

export async function findHistoryById(id: string): Promise<History | undefined> {
  const result = await db.select().from(histories).where(eq(histories.id, id));
  return result[0];
}

export async function createHistory(data: CreateHistoryInput): Promise<History> {
  const result = await db.insert(histories).values(data).returning();
  return result[0];
}

export async function updateHistory(
  id: string,
  data: UpdateHistoryInput
): Promise<History> {
  const result = await db
    .update(histories)
    .set(data)
    .where(eq(histories.id, id))
    .returning();

  return result[0];
}

export async function deleteHistory(id: string): Promise<History> {
  const result = await db
    .delete(histories)
    .where(eq(histories.id, id))
    .returning();

  return result[0];
}