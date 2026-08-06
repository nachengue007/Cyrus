import { text, sqliteTable } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const contacts = sqliteTable("contacts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  company: text("company"),
  email: text("email").unique(),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});