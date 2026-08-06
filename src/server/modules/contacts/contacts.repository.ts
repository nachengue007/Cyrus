import { eq } from "drizzle-orm";
import { db } from "@/src/server/db";
import { contacts } from "@/src/server/db/schema";

export type Contact = typeof contacts.$inferSelect;
export type CreateContactInput = Omit<typeof contacts.$inferInsert, "id" | "createdAt">;
export type UpdateContactInput = Partial<CreateContactInput>;

export async function findAllContacts(): Promise<Contact[]> {
  return db.select().from(contacts).orderBy(contacts.createdAt);
}

export async function findContactById(id: string): Promise<Contact | undefined> {
  const result = await db.select().from(contacts).where(eq(contacts.id, id));
  return result[0];
}

export async function createContact(data: CreateContactInput): Promise<Contact> {
  const result = await db.insert(contacts).values(data).returning();
  return result[0];
}

export async function updateContact(
  id: string,
  data: UpdateContactInput
): Promise<Contact> {
  const result = await db
    .update(contacts)
    .set(data)
    .where(eq(contacts.id, id))
    .returning();
  return result[0];
}

export async function deleteContact(id: string): Promise<Contact> {
  const result = await db
    .delete(contacts)
    .where(eq(contacts.id, id))
    .returning();
  return result[0];
}