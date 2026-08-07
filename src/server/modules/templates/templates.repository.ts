import { db } from "@/src/server/db";
import { templates } from "@/src/server/db/schema";
import { eq } from "drizzle-orm";

export type Template = typeof templates.$inferSelect;
export type CreateTemplateInput = Omit<typeof templates.$inferInsert, "id" | "createdAt">;
export type UpdateTemplateInput = Partial<CreateTemplateInput>;

export async function findAllTemplates(): Promise<Template[]> {
  return db.select().from(templates).orderBy(templates.createdAt);
}

export async function findTemplateById(id: string): Promise<Template | undefined> {
  const result = await db.select().from(templates).where(eq(templates.id,id));
  return result[0];
}

export async function createTemplate(data: CreateTemplateInput): Promise<Template> {
  const result = await db.insert(templates).values(data).returning();
  return result[0];
}

export async function updateTemplate(
  id: string,
  data: UpdateTemplateInput
): Promise<Template> {
  const result = await db
    .update(templates)
    .set(data)
    .where(eq(templates.id, id))
    .returning();

  return result[0];
}

export async function deleteTemplate(id: string): Promise<Template> {
  const result = await db
    .delete(templates)
    .where(eq(templates.id, id))
    .returning()

  return result[0];
}