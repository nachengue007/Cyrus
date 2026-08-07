import { db } from "@/src/server/db";
import { contacts, histories, templates } from "@/src/server/db/schema";
import { eq } from "drizzle-orm";

export type History = typeof histories.$inferSelect;
export type CreateHistoryInput = Omit<typeof histories.$inferInsert, "id" | "sentAt">
export type UpdateHistoryInput = Partial<CreateHistoryInput>;
export type HistorySelect = {
  id: string;
  contactId: string;
  contactName: string | null;
  templateId: string;
  templateName: string | null;
  status: string;
  sentAt: string | null;
};
export type Contacts = {
  id: string;
  name: string | null;
}
export type Templates = {
  id: string;
  name: string | null;
}

export async function findAllHistories(): Promise<HistorySelect[]> {
  const result = await db
    .select({
      id: histories.id,
      contactId: histories.contactId,
      contactName: contacts.name,
      templateId: histories.templateId,
      templateName: templates.name,
      status: histories.status,
      sentAt: histories.sentAt
    })
    .from(histories)
    .innerJoin(contacts, eq(contacts.id, histories.contactId))
    .innerJoin(templates, eq(templates.id, histories.templateId))
    .orderBy(histories.sentAt);
    
  return result;
}

export async function findHistoryById(id: string): Promise<History | undefined> {
  const result = await db.select().from(histories).where(eq(histories.id, id));
  return result[0];
}

export async function createHistory(data: CreateHistoryInput): Promise<History> {
  const result = await db.insert(histories).values(data).returning();
  return result[0];
}

export async function listContactsAndTemplates(): Promise<{ contactList: Contacts[]; templateList: Templates[] }> {
  const contactList = await db
    .select({
      id: contacts.id,
      name: contacts.name
    })
    .from(contacts);
  
  const templateList = await db
    .select({
      id: templates.id,
      name: templates.name
    })
    .from(templates);
  
  return { contactList, templateList }
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