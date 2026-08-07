import { text, sqliteTable } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm/_relations";

export const contacts = sqliteTable("contacts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  company: text("company"),
  email: text("email").unique(),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const templates = sqliteTable("templates", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  subject: text("subject"),
  body: text("body").unique(),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const histories = sqliteTable("histories", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  contactId: text("contact_id").notNull().references(() => contacts.id),
  templateId: text("template_id").notNull().references(() => templates.id),
  status: text("status").notNull(),
  sentAt: text("sent_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const contactsRelations = relations(contacts, ({ many }) =>({
  histories: many(histories),
}));

export const historiesRelations = relations(histories, ({ one }) => ({
  contact: one(contacts, {
    fields: [histories.contactId],
    references: [contacts.id],
  }),
  templates: one(templates, {
    fields: [histories.templateId],
    references: [templates.id],
  }),
}));